import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { throttle } from 'lodash';
import {
  bleReducer,
  initialBleState,
  type BleConnectedDevice,
  type BleService,
  type BleState,
} from './bleReducer';

type BleContextValue = BleState & {
  scan: () => Promise<void>;
  stopScan: () => Promise<void>;
  connect: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshServices: () => Promise<void>;
};

export const BleContext = createContext<BleContextValue | null>(null);

type BlePeripheralLike = {
  id: string;
  name?: string;
  rssi?: number;
  advertising?: unknown;
};

type RetrieveServicesResult = {
  id: string;
  name?: string;
  rssi?: number;
  services?: string[];
  characteristics?: Array<{
    characteristic: string;
    service: string;
    properties?: Record<string, string>;
  }>;
};

async function requestAndroidBlePermissions() {
  if (Platform.OS !== 'android') return;

  // Android 12+ requires runtime permissions for scan/connect.
  const perms: string[] = [];
  if (Platform.Version >= 31) {
    perms.push(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    );
  } else {
    // Pre-Android 12: location is required for scanning.
    perms.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  }

  await PermissionsAndroid.requestMultiple(perms);
}

function toConnectedDevice(p: BlePeripheralLike): BleConnectedDevice {
  return { id: p.id, name: p.name, rssi: p.rssi };
}

function buildServices(result: RetrieveServicesResult): BleService[] {
  const services = result.services ?? [];
  const chars = result.characteristics ?? [];

  const byService = new Map<string, BleService>();
  for (const svc of services) {
    byService.set(svc, { uuid: svc, characteristics: [] });
  }

  for (const c of chars) {
    const svcUuid = c.service;
    const existing = byService.get(svcUuid) ?? {
      uuid: svcUuid,
      characteristics: [],
    };
    existing.characteristics.push({
      characteristic: c.characteristic,
      service: c.service,
      properties: c.properties as any,
    });
    byService.set(svcUuid, existing);
  }

  return Array.from(byService.values()).sort((a, b) =>
    a.uuid.localeCompare(b.uuid),
  );
}

export function BleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bleReducer, initialBleState);

  // Use Map for discovery performance (requirement).
  const discoveredMapRef = useRef<Map<string, BlePeripheralLike>>(new Map());

  // Only allow one connected device at a time.
  const connectedIdRef = useRef<string | undefined>(undefined);

  const updateFlashListDataThrottled = useMemo(
    () =>
      throttle(() => {
        const arr = Array.from(discoveredMapRef.current.values())
          .map(toConnectedDevice)
          .sort((a, b) => {
            const ar = a.rssi ?? -999;
            const br = b.rssi ?? -999;
            return br - ar;
          });
        dispatch({ type: 'SET_DISCOVERED_DEVICES', devices: arr });
      }, 250),
    [],
  );

  useEffect(() => {
    BleManager.start({ showAlert: false }).catch(() => {
      // ignore; some platforms might throw if already started
    });

    const bleModule = NativeModules.BleManager;
    const emitter = new NativeEventEmitter(bleModule);

    const subDiscover = emitter.addListener(
      'BleManagerDiscoverPeripheral',
      (peripheral: BlePeripheralLike) => {
        if (!peripheral?.id) return;
        discoveredMapRef.current.set(peripheral.id, peripheral);
        updateFlashListDataThrottled();
      },
    );

    const subStop = emitter.addListener('BleManagerStopScan', () => {
      dispatch({ type: 'SCAN_STOP' });
    });

    const subDisconnect = emitter.addListener(
      'BleManagerDisconnectPeripheral',
      ({ peripheral }: { peripheral: string }) => {
        if (connectedIdRef.current === peripheral) {
          connectedIdRef.current = undefined;
          dispatch({
            type: 'CONNECTION_STATUS',
            status: 'disconnected',
            device: undefined,
          });
        }
      },
    );

    return () => {
      subDiscover.remove();
      subStop.remove();
      subDisconnect.remove();
      updateFlashListDataThrottled.cancel();
    };
  }, [updateFlashListDataThrottled]);

  const scan = async () => {
    try {
      await requestAndroidBlePermissions();
      discoveredMapRef.current.clear();
      dispatch({ type: 'SET_DISCOVERED_DEVICES', devices: [] });
      dispatch({ type: 'SCAN_START' });

      // allowDuplicates: true so RSSI updates can come in; list updates are throttled.
      await BleManager.scan([], 10, true);
    } catch (e: any) {
      dispatch({ type: 'SCAN_STOP' });
      dispatch({
        type: 'ERROR',
        message: e?.message ?? 'Failed to start scan',
      });
    }
  };

  const stopScan = async () => {
    try {
      await BleManager.stopScan();
      dispatch({ type: 'SCAN_STOP' });
    } catch {
      dispatch({ type: 'SCAN_STOP' });
    }
  };

  const disconnect = async () => {
    const current = connectedIdRef.current;
    if (!current) return;
    try {
      await BleManager.disconnect(current);
    } catch {
      // ignore
    } finally {
      connectedIdRef.current = undefined;
      dispatch({
        type: 'CONNECTION_STATUS',
        status: 'disconnected',
        device: undefined,
      });
    }
  };

  const refreshServices = async () => {
    const id = connectedIdRef.current;
    if (!id) return;
    try {
      const result = (await BleManager.retrieveServices(
        id,
      )) as RetrieveServicesResult;
      const services = buildServices(result);
      dispatch({ type: 'SET_SERVICES', services });
    } catch (e: any) {
      dispatch({
        type: 'ERROR',
        message: e?.message ?? 'Failed to retrieve services',
      });
    }
  };

  const connect = async (deviceId: string) => {
    try {
      // If user connects to another device -> disconnect the first.
      if (connectedIdRef.current && connectedIdRef.current !== deviceId) {
        await BleManager.disconnect(connectedIdRef.current).catch(() => {});
      }

      connectedIdRef.current = deviceId;
      const discovered = discoveredMapRef.current.get(deviceId);
      dispatch({
        type: 'CONNECTION_STATUS',
        status: 'connecting',
        device: discovered ? toConnectedDevice(discovered) : { id: deviceId },
      });

      await requestAndroidBlePermissions();
      await BleManager.connect(deviceId);

      dispatch({
        type: 'CONNECTION_STATUS',
        status: 'connected',
        device: discovered ? toConnectedDevice(discovered) : { id: deviceId },
      });

      await refreshServices();
    } catch (e: any) {
      connectedIdRef.current = undefined;
      dispatch({
        type: 'CONNECTION_STATUS',
        status: 'disconnected',
        device: undefined,
      });
      dispatch({ type: 'ERROR', message: e?.message ?? 'Failed to connect' });
    }
  };

  const value: BleContextValue = useMemo(
    () => ({
      ...state,
      scan,
      stopScan,
      connect,
      disconnect,
      refreshServices,
    }),
    [state],
  );

  return <BleContext.Provider value={value}>{children}</BleContext.Provider>;
}
