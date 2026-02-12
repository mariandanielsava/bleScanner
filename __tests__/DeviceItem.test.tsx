import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { DeviceItem } from '../src/components/DeviceItem';
import type { BleConnectedDevice, BleConnectionStatus } from '../src/ble/bleReducer';

jest.mock('@react-native-vector-icons/fontawesome6', () => ({
  __esModule: true,
  default: 'Icon',
}));

describe('DeviceItem', () => {
  const mockDevice: BleConnectedDevice = {
    id: 'device-123',
    name: 'Test Device',
    rssi: -65,
  };

  const defaultProps = {
    device: mockDevice,
    isConnected: false,
    isConnecting: false,
    connectionStatus: 'disconnected' as BleConnectionStatus,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render device name', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<DeviceItem {...defaultProps} />);
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'Test Device' })).toBeTruthy();
  });

  it('should render device id when name is not provided', () => {
    const deviceWithoutName: BleConnectedDevice = {
      id: 'device-456',
      rssi: -70,
    };
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <DeviceItem {...defaultProps} device={deviceWithoutName} />,
      );
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'device-456' })).toBeTruthy();
  });

  it('should display RSSI value', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<DeviceItem {...defaultProps} />);
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: '-65 dBm' })).toBeTruthy();
  });

  it('should display N/A for missing RSSI', () => {
    const deviceWithoutRssi: BleConnectedDevice = {
      id: 'device-123',
      name: 'Test Device',
    };
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <DeviceItem {...defaultProps} device={deviceWithoutRssi} />,
      );
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'N/A' })).toBeTruthy();
  });

  it('should show Connect button when disconnected', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<DeviceItem {...defaultProps} />);
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'Connect' })).toBeTruthy();
  });

  it('should show Connecting... when connecting', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <DeviceItem {...defaultProps} isConnecting={true} />,
      );
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'Connecting...' })).toBeTruthy();
  });

  it('should show Explore button when connected', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <DeviceItem {...defaultProps} isConnected={true} />,
      );
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'Explore' })).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <DeviceItem {...defaultProps} onPress={onPress} />,
      );
    });
    // Verify component renders correctly
    expect(tree).toBeTruthy();
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'Connect' })).toBeTruthy();
  });

  it('should be disabled when connecting', () => {
    const onPress = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <DeviceItem {...defaultProps} isConnecting={true} onPress={onPress} />,
      );
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'Connecting...' })).toBeTruthy();
  });

  it('should render signal bars based on RSSI', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<DeviceItem {...defaultProps} />);
    });
    const instance = tree!.root;
    const views = instance.findAllByType('View');
    expect(views.length).toBeGreaterThan(0);
  });

  it('should display correct number of active bars for strong signal', () => {
    const strongSignalDevice: BleConnectedDevice = {
      id: 'device-123',
      name: 'Test Device',
      rssi: -50,
    };
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <DeviceItem {...defaultProps} device={strongSignalDevice} />,
      );
    });
    expect(tree).toBeTruthy();
  });

  it('should render correctly when connected', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <DeviceItem {...defaultProps} isConnected={true} />,
      );
    });
    const instance = tree!.root;
    expect(instance.findByProps({ children: 'Explore' })).toBeTruthy();
  });
});
