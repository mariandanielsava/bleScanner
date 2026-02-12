import { bleReducer, initialBleState } from '../src/ble/bleReducer';
import type { BleAction, BleConnectedDevice, BleService } from '../src/ble/bleReducer';

describe('bleReducer', () => {
  describe('SCAN_START', () => {
    it('should set isScanning to true and clear lastError', () => {
      const state = {
        ...initialBleState,
        isScanning: false,
        lastError: 'Previous error',
      };

      const action: BleAction = { type: 'SCAN_START' };
      const result = bleReducer(state, action);

      expect(result.isScanning).toBe(true);
      expect(result.lastError).toBeUndefined();
      expect(result.discoveredDevices).toEqual(state.discoveredDevices);
    });
  });

  describe('SCAN_STOP', () => {
    it('should set isScanning to false', () => {
      const state = {
        ...initialBleState,
        isScanning: true,
      };

      const action: BleAction = { type: 'SCAN_STOP' };
      const result = bleReducer(state, action);

      expect(result.isScanning).toBe(false);
    });
  });

  describe('SET_DISCOVERED_DEVICES', () => {
    it('should update discoveredDevices', () => {
      const devices: BleConnectedDevice[] = [
        { id: 'device-1', name: 'Device 1', rssi: -65 },
        { id: 'device-2', name: 'Device 2', rssi: -70 },
      ];

      const action: BleAction = {
        type: 'SET_DISCOVERED_DEVICES',
        devices,
      };
      const result = bleReducer(initialBleState, action);

      expect(result.discoveredDevices).toEqual(devices);
      expect(result.isScanning).toBe(initialBleState.isScanning);
    });
  });

  describe('CONNECTION_STATUS', () => {
    it('should update connectionStatus to connecting', () => {
      const device: BleConnectedDevice = {
        id: 'device-1',
        name: 'Device 1',
        rssi: -65,
      };

      const action: BleAction = {
        type: 'CONNECTION_STATUS',
        status: 'connecting',
        device,
      };
      const result = bleReducer(initialBleState, action);

      expect(result.connectionStatus).toBe('connecting');
      expect(result.connectedDevice).toEqual(device);
      expect(result.services).toEqual([]);
    });

    it('should update connectionStatus to connected and preserve services', () => {
      const device: BleConnectedDevice = {
        id: 'device-1',
        name: 'Device 1',
        rssi: -65,
      };
      const services: BleService[] = [
        {
          uuid: 'service-1',
          characteristics: [],
        },
      ];

      const state = {
        ...initialBleState,
        services,
      };

      const action: BleAction = {
        type: 'CONNECTION_STATUS',
        status: 'connected',
        device,
      };
      const result = bleReducer(state, action);

      expect(result.connectionStatus).toBe('connected');
      expect(result.connectedDevice).toEqual(device);
      expect(result.services).toEqual(services);
    });

    it('should update connectionStatus to disconnected and clear services', () => {
      const state = {
        ...initialBleState,
        services: [
          {
            uuid: 'service-1',
            characteristics: [],
          },
        ],
        connectedDevice: {
          id: 'device-1',
          name: 'Device 1',
        },
      };

      const action: BleAction = {
        type: 'CONNECTION_STATUS',
        status: 'disconnected',
      };
      const result = bleReducer(state, action);

      expect(result.connectionStatus).toBe('disconnected');
      expect(result.services).toEqual([]);
      expect(result.connectedDevice).toBeUndefined();
    });

    it('should preserve services when connecting', () => {
      const services: BleService[] = [
        {
          uuid: 'service-1',
          characteristics: [],
        },
      ];

      const state = {
        ...initialBleState,
        services,
      };

      const action: BleAction = {
        type: 'CONNECTION_STATUS',
        status: 'connecting',
      };
      const result = bleReducer(state, action);

      expect(result.services).toEqual(services);
    });
  });

  describe('SET_SERVICES', () => {
    it('should update services', () => {
      const services: BleService[] = [
        {
          uuid: 'service-1',
          characteristics: [
            {
              service: 'service-1',
              characteristic: 'char-1',
              properties: { Read: 'read' },
            },
          ],
        },
        {
          uuid: 'service-2',
          characteristics: [],
        },
      ];

      const action: BleAction = {
        type: 'SET_SERVICES',
        services,
      };
      const result = bleReducer(initialBleState, action);

      expect(result.services).toEqual(services);
    });
  });

  describe('ERROR', () => {
    it('should set lastError with message', () => {
      const action: BleAction = {
        type: 'ERROR',
        message: 'Connection failed',
      };
      const result = bleReducer(initialBleState, action);

      expect(result.lastError).toBe('Connection failed');
    });

    it('should set lastError to undefined when message is not provided', () => {
      const state = {
        ...initialBleState,
        lastError: 'Previous error',
      };

      const action: BleAction = { type: 'ERROR' };
      const result = bleReducer(state, action);

      expect(result.lastError).toBeUndefined();
    });
  });

  describe('default case', () => {
    it('should return state unchanged for unknown action', () => {
      const state = {
        ...initialBleState,
        isScanning: true,
      };

      const action = { type: 'UNKNOWN_ACTION' } as unknown as BleAction;
      const result = bleReducer(state, action);

      expect(result).toEqual(state);
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(initialBleState).toEqual({
        isScanning: false,
        discoveredDevices: [],
        connectionStatus: 'disconnected',
        connectedDevice: undefined,
        services: [],
        lastError: undefined,
      });
    });
  });
});
