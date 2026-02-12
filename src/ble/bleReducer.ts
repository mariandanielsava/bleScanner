export type BleConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export type BleCharacteristic = {
  characteristic: string;
  service: string;
  properties?: {
    Read?: string;
    Write?: string;
    WriteWithoutResponse?: string;
    Notify?: string;
    Indicate?: string;
  };
};

export type BleService = {
  uuid: string;
  characteristics: BleCharacteristic[];
};

export type BleConnectedDevice = {
  id: string;
  name?: string;
  rssi?: number;
};

export type BleState = {
  isScanning: boolean;
  discoveredDevices: BleConnectedDevice[];
  connectionStatus: BleConnectionStatus;
  connectedDevice?: BleConnectedDevice;
  services: BleService[];
  lastError?: string;
};

export const initialBleState: BleState = {
  isScanning: false,
  discoveredDevices: [],
  connectionStatus: 'disconnected',
  connectedDevice: undefined,
  services: [],
  lastError: undefined,
};

export type BleAction =
  | { type: 'SCAN_START' }
  | { type: 'SCAN_STOP' }
  | { type: 'SET_DISCOVERED_DEVICES'; devices: BleConnectedDevice[] }
  | {
      type: 'CONNECTION_STATUS';
      status: BleConnectionStatus;
      device?: BleConnectedDevice;
    }
  | { type: 'SET_SERVICES'; services: BleService[] }
  | { type: 'ERROR'; message?: string };

export function bleReducer(state: BleState, action: BleAction): BleState {
  switch (action.type) {
    case 'SCAN_START':
      return { ...state, isScanning: true, lastError: undefined };
    case 'SCAN_STOP':
      return { ...state, isScanning: false };
    case 'SET_DISCOVERED_DEVICES':
      return { ...state, discoveredDevices: action.devices };
    case 'CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.status,
        connectedDevice: action.device,
        services:
          action.status === 'connected'
            ? state.services
            : action.status === 'disconnected'
            ? []
            : state.services,
      };
    case 'SET_SERVICES':
      return { ...state, services: action.services };
    case 'ERROR':
      return { ...state, lastError: action.message };
    default:
      return state;
  }
}
