// Mock React Native modules
const mockLinking = {
  openSettings: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  getInitialURL: jest.fn(),
};

const mockRequestMultiple = jest.fn();
const mockPermissionsAndroid = {
  PERMISSIONS: {
    ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
    BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  requestMultiple: mockRequestMultiple,
};

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.BleManager = {
    checkState: jest.fn(),
    enableBluetooth: jest.fn(),
    scan: jest.fn(),
    stopScan: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    retrieveServices: jest.fn(),
  };
  RN.Linking = mockLinking;
  RN.PermissionsAndroid = mockPermissionsAndroid;
  return RN;
});

// Mock react-native-ble-manager
const mockBleManager = {
  checkState: jest.fn(),
  enableBluetooth: jest.fn(),
  scan: jest.fn(),
  stopScan: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  retrieveServices: jest.fn(),
  start: jest.fn(),
};

jest.mock('react-native-ble-manager', () => ({
  __esModule: true,
  default: mockBleManager,
  BleState: {
    On: 'on',
    Off: 'off',
    TurningOn: 'turning_on',
    Unsupported: 'unsupported',
    Unauthorized: 'unauthorized',
  },
  BleScanMatchMode: {
    Aggressive: 1,
    Sticky: 2,
  },
  BleScanMode: {
    LowPower: 0,
    Balanced: 1,
    LowLatency: 2,
  },
  BleScanCallbackType: {
    AllMatches: 1,
    FirstMatch: 2,
    MatchLost: 4,
  },
}));

// Mock @react-native-vector-icons/fontawesome6
jest.mock('@react-native-vector-icons/fontawesome6', () => ({
  __esModule: true,
  default: 'Icon',
}));

// Mock @react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock @shopify/flash-list
jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ data, renderItem, ...props }: any) => {
    const React = require('react');
    const { FlatList } = require('react-native');
    return React.createElement(FlatList, {
      data,
      renderItem,
      ...props,
    });
  },
}));
