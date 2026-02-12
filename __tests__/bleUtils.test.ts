import { Linking, PermissionsAndroid, Platform } from 'react-native';
import BleManager, { BleState } from 'react-native-ble-manager';
import {
  ensureBluetoothReadyForScan,
  peripheralToDevice,
  buildServicesFromPeripheralInfo,
  requestBluetoothPermissions,
} from '../src/ble/bleUtils';
import type { Peripheral, PeripheralInfo } from 'react-native-ble-manager';

// Access mocked functions from jest.setup.js
const mockBleManager = BleManager as jest.Mocked<typeof BleManager>;
const mockLinking = Linking as jest.Mocked<typeof Linking>;

// Use jest.spyOn to properly mock PermissionsAndroid.requestMultiple
const mockRequestMultiple = jest.spyOn(
  PermissionsAndroid,
  'requestMultiple',
) as jest.Mock;

describe('bleUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('peripheralToDevice', () => {
    it('should convert peripheral with name to device', () => {
      const peripheral: Peripheral = {
        id: 'device-123',
        name: 'Test Device',
        rssi: -65,
        advertising: {},
      };

      const result = peripheralToDevice(peripheral);

      expect(result).toEqual({
        id: 'device-123',
        name: 'Test Device',
        rssi: -65,
      });
    });

    it('should convert peripheral without name to device', () => {
      const peripheral: Peripheral = {
        id: 'device-123',
        name: null,
        rssi: -70,
        advertising: {},
      };

      const result = peripheralToDevice(peripheral);

      expect(result).toEqual({
        id: 'device-123',
        name: undefined,
        rssi: -70,
      });
    });

    it('should handle peripheral with undefined name', () => {
      const peripheral: Peripheral = {
        id: 'device-123',
        rssi: -75,
        advertising: {},
      } as Peripheral;

      const result = peripheralToDevice(peripheral);

      expect(result).toEqual({
        id: 'device-123',
        name: undefined,
        rssi: -75,
      });
    });
  });

  describe('buildServicesFromPeripheralInfo', () => {
    it('should return empty array for null info', () => {
      const result = buildServicesFromPeripheralInfo(null);
      expect(result).toEqual([]);
    });

    it('should build services from peripheral info', () => {
      const info: PeripheralInfo = {
        id: 'device-123',
        name: 'Test Device',
        rssi: -65,
        services: [
          { uuid: 'service-1', isPrimary: true },
          { uuid: 'service-2', isPrimary: false },
        ],
        characteristics: [
          {
            service: 'service-1',
            characteristic: 'char-1',
            properties: { Read: 'read', Write: 'write' },
          },
          {
            service: 'service-1',
            characteristic: 'char-2',
            properties: { Notify: 'notify' },
          },
          {
            service: 'service-2',
            characteristic: 'char-3',
            properties: { Read: 'read' },
          },
        ],
      };

      const result = buildServicesFromPeripheralInfo(info);

      expect(result).toHaveLength(2);
      expect(result[0].uuid).toBe('service-1');
      expect(result[0].characteristics).toHaveLength(2);
      expect(result[0].characteristics[0].characteristic).toBe('char-1');
      expect(result[0].characteristics[1].characteristic).toBe('char-2');
      expect(result[1].uuid).toBe('service-2');
      expect(result[1].characteristics).toHaveLength(1);
      expect(result[1].characteristics[0].characteristic).toBe('char-3');
    });

    it('should sort services by UUID', () => {
      const info: PeripheralInfo = {
        id: 'device-123',
        name: 'Test Device',
        rssi: -65,
        services: [
          { uuid: 'service-z', isPrimary: true },
          { uuid: 'service-a', isPrimary: false },
        ],
        characteristics: [],
      };

      const result = buildServicesFromPeripheralInfo(info);

      expect(result[0].uuid).toBe('service-a');
      expect(result[1].uuid).toBe('service-z');
    });

    it('should handle services without characteristics', () => {
      const info: PeripheralInfo = {
        id: 'device-123',
        name: 'Test Device',
        rssi: -65,
        services: [{ uuid: 'service-1', isPrimary: true }],
        characteristics: [],
      };

      const result = buildServicesFromPeripheralInfo(info);

      expect(result).toHaveLength(1);
      expect(result[0].characteristics).toEqual([]);
    });

    it('should ignore characteristics for non-existent services', () => {
      const info: PeripheralInfo = {
        id: 'device-123',
        name: 'Test Device',
        rssi: -65,
        services: [{ uuid: 'service-1', isPrimary: true }],
        characteristics: [
          {
            service: 'service-unknown',
            characteristic: 'char-1',
            properties: { Read: 'read' },
          },
        ],
      };

      const result = buildServicesFromPeripheralInfo(info);

      expect(result).toHaveLength(1);
      expect(result[0].characteristics).toEqual([]);
    });
  });

  describe('ensureBluetoothReadyForScan', () => {
    it('should return ready: true when Bluetooth is on', async () => {
      mockBleManager.checkState.mockResolvedValue(BleState.On);

      const result = await ensureBluetoothReadyForScan();

      expect(result).toEqual({ ready: true });
      expect(mockBleManager.enableBluetooth).not.toHaveBeenCalled();
      expect(mockLinking.openSettings).not.toHaveBeenCalled();
    });

    it('should return ready: true when Bluetooth is turning on', async () => {
      mockBleManager.checkState.mockResolvedValue(BleState.TurningOn);

      const result = await ensureBluetoothReadyForScan();

      expect(result).toEqual({ ready: true });
    });

    it('should enable Bluetooth on Android when off', async () => {
      (Platform.OS as any) = 'android';
      mockBleManager.checkState.mockResolvedValue(BleState.Off);
      mockBleManager.enableBluetooth.mockResolvedValue(undefined);

      const result = await ensureBluetoothReadyForScan();

      expect(result).toEqual({
        ready: false,
        message: 'Please turn on Bluetooth to scan',
      });
      expect(mockBleManager.enableBluetooth).toHaveBeenCalled();
      expect(mockLinking.openSettings).not.toHaveBeenCalled();
    });

    it('should open settings on iOS when Bluetooth is off', async () => {
      (Platform.OS as any) = 'ios';
      mockBleManager.checkState.mockResolvedValue(BleState.Off);
      (mockLinking.openSettings as jest.Mock).mockResolvedValue(undefined);

      const result = await ensureBluetoothReadyForScan();

      expect(result).toEqual({
        ready: false,
        message: 'Please turn on Bluetooth in Settings',
      });
      expect(mockLinking.openSettings).toHaveBeenCalled();
      expect(mockBleManager.enableBluetooth).not.toHaveBeenCalled();
    });

    it('should return error message when Bluetooth is unsupported', async () => {
      mockBleManager.checkState.mockResolvedValue(BleState.Unsupported);

      const result = await ensureBluetoothReadyForScan();

      expect(result).toEqual({
        ready: false,
        message: 'Bluetooth is not supported',
      });
    });

    it('should return error message when Bluetooth is unauthorized', async () => {
      mockBleManager.checkState.mockResolvedValue(BleState.Unauthorized);

      const result = await ensureBluetoothReadyForScan();

      expect(result).toEqual({
        ready: false,
        message: 'Bluetooth access is not authorized',
      });
    });

    it('should return error message for unknown state', async () => {
      mockBleManager.checkState.mockResolvedValue('unknown' as any);

      const result = await ensureBluetoothReadyForScan();

      expect(result).toEqual({
        ready: false,
        message: 'Bluetooth is not available',
      });
    });

    it('should handle errors gracefully', async () => {
      mockBleManager.checkState.mockRejectedValue(new Error('Check failed'));

      const result = await ensureBluetoothReadyForScan();

      expect(result).toEqual({
        ready: false,
        message: 'Could not check Bluetooth state',
      });
    });
  });

  describe('requestBluetoothPermissions', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        writable: true,
        value: 'android',
      });
      mockRequestMultiple.mockClear();
    });

    it('should return true for iOS', async () => {
      Object.defineProperty(Platform, 'OS', {
        writable: true,
        value: 'ios',
      });
      mockRequestMultiple.mockClear();

      const result = await requestBluetoothPermissions();

      expect(result).toBe(true);
      expect(mockRequestMultiple).not.toHaveBeenCalled();
    });

    it('should request BLUETOOTH_SCAN and BLUETOOTH_CONNECT for Android 31+', async () => {
      Object.defineProperty(Platform, 'Version', {
        writable: true,
        value: 31,
      });
      mockRequestMultiple.mockResolvedValue({
        'android.permission.BLUETOOTH_SCAN':
          PermissionsAndroid.RESULTS.GRANTED,
        'android.permission.BLUETOOTH_CONNECT':
          PermissionsAndroid.RESULTS.GRANTED,
      });

      const result = await requestBluetoothPermissions();

      expect(result).toBe(true);
      expect(mockRequestMultiple).toHaveBeenCalledWith([
        'android.permission.BLUETOOTH_SCAN',
        'android.permission.BLUETOOTH_CONNECT',
      ]);
    });

    it('should request ACCESS_FINE_LOCATION for Android 23-30', async () => {
      Object.defineProperty(Platform, 'Version', {
        writable: true,
        value: 28,
      });
      mockRequestMultiple.mockResolvedValue({
        'android.permission.ACCESS_FINE_LOCATION':
          PermissionsAndroid.RESULTS.GRANTED,
      });

      const result = await requestBluetoothPermissions();

      expect(result).toBe(true);
      expect(mockRequestMultiple).toHaveBeenCalledWith([
        'android.permission.ACCESS_FINE_LOCATION',
      ]);
    });

    it('should return true for Android < 23', async () => {
      Object.defineProperty(Platform, 'Version', {
        writable: true,
        value: 22,
      });

      const result = await requestBluetoothPermissions();

      expect(result).toBe(true);
      expect(mockRequestMultiple).not.toHaveBeenCalled();
    });

    it('should return false if permissions are denied', async () => {
      Object.defineProperty(Platform, 'Version', {
        writable: true,
        value: 31,
      });
      mockRequestMultiple.mockResolvedValue({
        'android.permission.BLUETOOTH_SCAN': PermissionsAndroid.RESULTS.DENIED,
        'android.permission.BLUETOOTH_CONNECT':
          PermissionsAndroid.RESULTS.GRANTED,
      });

      const result = await requestBluetoothPermissions();

      expect(result).toBe(false);
    });

    it('should return false if any permission is denied', async () => {
      Object.defineProperty(Platform, 'Version', {
        writable: true,
        value: 28,
      });
      mockRequestMultiple.mockResolvedValue({
        'android.permission.ACCESS_FINE_LOCATION':
          PermissionsAndroid.RESULTS.DENIED,
      });

      const result = await requestBluetoothPermissions();

      expect(result).toBe(false);
    });
  });
});
