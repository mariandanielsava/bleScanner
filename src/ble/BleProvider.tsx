import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  type Peripheral,
  type PeripheralInfo,
} from 'react-native-ble-manager';
import type {
  BleConnectedDevice,
  BleConnectionStatus,
  BleService,
} from './bleReducer';
import {
  buildServicesFromPeripheralInfo,
  ensureBluetoothReadyForScan,
  peripheralToDevice,
  requestBluetoothPermissions,
} from './bleUtils';

const SERVICE_UUIDS: string[] = [];
const THROTTLE_MS = 300;

// Extend the library's Peripheral type with our UI flags (connected/connecting).
declare module 'react-native-ble-manager' {
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

export type BleContextValue = {
  isScanning: boolean;
  discoveredDevices: BleConnectedDevice[];
  connectionStatus: BleConnectionStatus;
  connectedDevice: BleConnectedDevice | undefined;
  services: BleService[];
  lastError: string | undefined;
  scan: () => void;
  stopScan: () => Promise<void>;
  sortBySignal: () => void;
  connect: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshServices: () => Promise<void>;
};

export const BleContext = createContext<BleContextValue | null>(null);

export function BleProvider({ children }: { children: React.ReactNode }) {
  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState<Peripheral[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Peripheral | null>(null);
  const [deviceServices, setDeviceServices] = useState<PeripheralInfo | null>(
    null,
  );
  const [lastError, setLastError] = useState<string | undefined>(undefined);

  const peripheralsMapRef = useRef<Map<Peripheral['id'], Peripheral>>(
    new Map(),
  );
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const sortByRssiRef = useRef(false);
  const connectingToIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedDevice?.id ?? null;

  // update actual list of peripherals used on screen
  const updatePeripheralsList = useCallback(() => {
    let list = Array.from(peripheralsMapRef.current.values());
    if (sortByRssiRef.current) {
      list = [...list].sort((a, b) => (b.rssi ?? -100) - (a.rssi ?? -100));
    }
    setPeripherals(list);
  }, []);

  // throttle list updates so we don't setState on every discovery
  const scheduleListUpdate = useCallback(() => {
    if (throttleRef.current !== null) return;
    throttleRef.current = setTimeout(() => {
      updatePeripheralsList();
      throttleRef.current = null;
    }, THROTTLE_MS);
  }, [updatePeripheralsList]);

  const onDiscover = useCallback(
    (peripheral: Peripheral) => {
      if (!peripheral?.id) return;
      const map = peripheralsMapRef.current;
      const existing = map.get(peripheral.id);
      const merged: Peripheral = {
        ...(existing ?? {}),
        ...peripheral,
        name: peripheral.name ?? existing?.name ?? peripheral.id,
      };
      map.set(peripheral.id, merged);
      if (map.size === 1) {
        updatePeripheralsList();
      } else {
        scheduleListUpdate();
      }
    },
    [scheduleListUpdate, updatePeripheralsList],
  );

  const onStopScan = useCallback(() => setIsScanning(false), []);

  const onDisconnect = useCallback(
    (event: BleDisconnectPeripheralEvent) => {
      const id = event.peripheral;
      const p = peripheralsMapRef.current.get(id);
      if (p) {
        peripheralsMapRef.current.set(id, {
          ...p,
          connected: false,
          connecting: false,
        });
        scheduleListUpdate();
      }
      if (selectedIdRef.current === id) {
        setSelectedDevice(null);
        setDeviceServices(null);
      }
    },
    [scheduleListUpdate],
  );

  useEffect(() => {
    BleManager.start({ showAlert: false }).catch(() => {});

    const subs = [
      BleManager.onDiscoverPeripheral(onDiscover),
      BleManager.onStopScan(onStopScan),
      BleManager.onDisconnectPeripheral(onDisconnect),
    ];

    requestBluetoothPermissions();

    return () => {
      subs.forEach(s => s.remove());
      if (throttleRef.current) clearTimeout(throttleRef.current);
    };
  }, [onDiscover, onStopScan, onDisconnect]);

  const scan = useCallback(() => {
    if (isScanning) return;
    setLastError(undefined);
    sortByRssiRef.current = false;
    peripheralsMapRef.current.clear();
    setPeripherals([]);
    setIsScanning(true);

    requestBluetoothPermissions().then(async granted => {
      if (!granted) {
        setIsScanning(false);
        setLastError('Bluetooth permissions denied');
        return;
      }
      const bt = await ensureBluetoothReadyForScan();
      if (!bt.ready) {
        setIsScanning(false);
        setLastError(bt.message);
        return;
      }
      BleManager.scan({
        serviceUUIDs: SERVICE_UUIDS,
        allowDuplicates: true,
        matchMode: BleScanMatchMode.Sticky,
        scanMode: BleScanMode.LowLatency,
        callbackType: BleScanCallbackType.AllMatches,
      }).catch((err: unknown) => {
        setIsScanning(false);
        setLastError(err instanceof Error ? err.message : 'Scan failed');
      });
    });
  }, [isScanning]);

  const stopScan = useCallback(async () => {
    try {
      await BleManager.stopScan();
      setIsScanning(false);
    } catch {
      setIsScanning(false);
    }
  }, []);

  const sortBySignal = useCallback(() => {
    sortByRssiRef.current = true;
    setPeripherals(prev =>
      [...prev].sort((a, b) => (b.rssi ?? -100) - (a.rssi ?? -100)),
    );
  }, []);

  const connect = useCallback(
    async (deviceId: string) => {
      setLastError(undefined);

      // keep track of current connecting device to prevent overlapping connect attempts
      if (connectingToIdRef.current !== null) return;

      const peripheral = peripheralsMapRef.current.get(deviceId) ?? {
        id: deviceId,
        rssi: -100,
        name: deviceId,
        advertising: {},
      };

      // disconnect if already have a connceted device
      const connected = Array.from(peripheralsMapRef.current.values()).filter(
        p => p.connected && p.id !== deviceId,
      );
      for (const p of connected) {
        try {
          await BleManager.disconnect(p.id);
        } catch {
          // ignore
        }
      }

      // stop scanning before connecting
      try {
        await BleManager.stopScan();
        setIsScanning(false);
      } catch {
        // ignore
      }

      connectingToIdRef.current = deviceId;
      peripheralsMapRef.current.set(deviceId, {
        ...peripheral,
        connecting: true,
      });
      scheduleListUpdate();
      setSelectedDevice({ ...peripheral, connecting: true });

      try {
        await BleManager.connect(peripheral.id);
        peripheralsMapRef.current.set(deviceId, {
          ...peripheral,
          connecting: false,
          connected: true,
        });
        scheduleListUpdate();

        await new Promise<void>(r => setTimeout(r, 400));

        const info = await BleManager.retrieveServices(peripheral.id);
        // avoid wrong update (user changed device while connecting)
        if (selectedIdRef.current !== deviceId) return;
        setSelectedDevice({ ...peripheral, connected: true });
        setDeviceServices(info);
      } catch (err) {
        peripheralsMapRef.current.set(deviceId, {
          ...peripheral,
          connecting: false,
          connected: false,
        });
        scheduleListUpdate();
        setSelectedDevice(null);
        setLastError(err instanceof Error ? err.message : 'Connection failed');
      } finally {
        connectingToIdRef.current = null;
      }
    },
    [scheduleListUpdate],
  );

  const disconnect = useCallback(async () => {
    if (!selectedDevice) return;
    try {
      await BleManager.disconnect(selectedDevice.id);
    } catch {
      // ignore
    }
    const p = peripheralsMapRef.current.get(selectedDevice.id);
    if (p) {
      peripheralsMapRef.current.set(selectedDevice.id, {
        ...p,
        connected: false,
      });
      scheduleListUpdate();
    }
    setSelectedDevice(null);
    setDeviceServices(null);
  }, [selectedDevice, scheduleListUpdate]);

  //refetch services for active device
  const refreshServices = useCallback(async () => {
    if (!selectedDevice) return;
    try {
      const info = await BleManager.retrieveServices(selectedDevice.id);
      setDeviceServices(info);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : 'Refresh failed');
    }
  }, [selectedDevice]);

  const connectionStatus: BleConnectionStatus = selectedDevice?.connecting
    ? 'connecting'
    : selectedDevice?.connected
    ? 'connected'
    : 'disconnected';

  const services = useMemo(
    () => buildServicesFromPeripheralInfo(deviceServices),
    [deviceServices],
  );

  const value: BleContextValue = useMemo(
    () => ({
      isScanning,
      discoveredDevices: peripherals.map(peripheralToDevice),
      connectionStatus,
      connectedDevice: selectedDevice
        ? peripheralToDevice(selectedDevice)
        : undefined,
      services,
      lastError,
      scan,
      stopScan,
      sortBySignal,
      connect,
      disconnect,
      refreshServices,
    }),
    [
      isScanning,
      peripherals,
      connectionStatus,
      selectedDevice,
      services,
      lastError,
      scan,
      stopScan,
      sortBySignal,
      connect,
      disconnect,
      refreshServices,
    ],
  );

  return <BleContext.Provider value={value}>{children}</BleContext.Provider>;
}
