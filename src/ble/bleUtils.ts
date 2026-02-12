import { Linking, PermissionsAndroid, Platform } from 'react-native';
import BleManager, {
  BleState,
  type Peripheral,
  type PeripheralInfo,
} from 'react-native-ble-manager';
import type { BleConnectedDevice, BleService } from './bleReducer';

export type BluetoothReadyResult =
  | { ready: true }
  | { ready: false; message: string };

export async function ensureBluetoothReadyForScan(): Promise<BluetoothReadyResult> {
  try {
    const state = await BleManager.checkState();
    if (state === BleState.On || state === BleState.TurningOn) {
      return { ready: true };
    }
    if (state === BleState.Off) {
      if (Platform.OS === 'android') {
        await BleManager.enableBluetooth();
        return { ready: false, message: 'Please turn on Bluetooth to scan' };
      }
      await Linking.openSettings();
      return { ready: false, message: 'Please turn on Bluetooth in Settings' };
    }
    if (state === BleState.Unsupported) {
      return { ready: false, message: 'Bluetooth is not supported' };
    }
    if (state === BleState.Unauthorized) {
      return { ready: false, message: 'Bluetooth access is not authorized' };
    }
    return { ready: false, message: 'Bluetooth is not available' };
  } catch {
    return { ready: false, message: 'Could not check Bluetooth state' };
  }
}

export function peripheralToDevice(p: Peripheral): BleConnectedDevice {
  return { id: p.id, name: p.name ?? undefined, rssi: p.rssi };
}

export function buildServicesFromPeripheralInfo(
  info: PeripheralInfo | null,
): BleService[] {
  if (!info) return [];
  const services = info.services ?? [];
  const chars = info.characteristics ?? [];
  const byService = new Map<string, BleService>();
  for (const s of services) {
    byService.set(s.uuid, { uuid: s.uuid, characteristics: [] });
  }
  for (const c of chars) {
    const existing = byService.get(c.service);
    if (existing) {
      existing.characteristics.push({
        characteristic: c.characteristic,
        service: c.service,
        properties:
          c.properties as BleService['characteristics'][0]['properties'],
      });
    }
  }
  return Array.from(byService.values()).sort((a, b) =>
    a.uuid.localeCompare(b.uuid),
  );
}

export async function requestBluetoothPermissions() {
  if (Platform.OS === 'android') {
    const permissions: any = [];
    if (Platform.Version >= 23 && Platform.Version <= 30) {
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    } else if (Platform.Version >= 31) {
      permissions.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      );
    }

    if (permissions.length === 0) {
      return true;
    }
    const granted = await PermissionsAndroid.requestMultiple(permissions);
    return Object.values(granted).every(
      result => result === PermissionsAndroid.RESULTS.GRANTED,
    );
  }
  return true;
}
