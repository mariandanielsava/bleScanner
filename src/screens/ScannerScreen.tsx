import React, { useCallback, useMemo, memo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/fontawesome6';
import { useBle } from '../ble/useBle';
import { DeviceItem } from '../components/DeviceItem';
import type { TabParamList } from '../navigation/Tabs';
import type { BleConnectedDevice } from '../ble/bleReducer';

type NavProp = BottomTabNavigationProp<TabParamList, 'Scanner'>;

const ScannerEmptyList = memo(() => {
  return (
    <View style={styles.emptyInner}>
      <View style={styles.emptyIconCircle}>
        <Icon
          iconStyle="solid"
          name="magnifying-glass"
          size={28}
          color="#137fec"
        />
      </View>
      <Text style={styles.emptyTitle}>No devices yet</Text>
      <Text style={styles.emptyText}>
        Tap the scan button to look for Bluetooth devices in your proximity.
      </Text>
    </View>
  );
});

export function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const {
    scan,
    stopScan,
    sortBySignal,
    isScanning,
    discoveredDevices,
    connect,
    connectedDevice,
    connectionStatus,
    lastError,
  } = useBle();

  const handleScanPress = useCallback(() => {
    if (isScanning) {
      stopScan().catch(() => {});
    } else {
      scan();
    }
  }, [isScanning, scan, stopScan]);

  const handleConnect = useCallback(
    async (deviceId: string) => {
      if (
        connectedDevice?.id === deviceId &&
        connectionStatus === 'connected'
      ) {
        navigation.navigate('Device');
        return;
      }
      await connect(deviceId);
      navigation.navigate('Device');
    },
    [connect, connectedDevice?.id, connectionStatus, navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: BleConnectedDevice }) => (
      <DeviceItem
        device={item}
        isConnected={
          connectedDevice?.id === item.id && connectionStatus === 'connected'
        }
        isConnecting={
          connectionStatus === 'connecting' && connectedDevice?.id === item.id
        }
        connectionStatus={connectionStatus}
        onPress={() => handleConnect(item.id)}
      />
    ),
    [connectedDevice?.id, connectionStatus, handleConnect],
  );

  const keyExtractor = useCallback((item: BleConnectedDevice) => item.id, []);

  const listRef = useRef(null);

  const handleSortBySignal = useCallback(() => {
    sortBySignal();
    (listRef.current as { scrollToOffset: (p: { offset: number; animated?: boolean }) => void } | null)?.scrollToOffset({ offset: 0, animated: true });
  }, [sortBySignal]);

  const devicesCount = discoveredDevices.length;
  const isListEmpty = devicesCount === 0;

  const listContentContainerStyle = useMemo(
    () => (isListEmpty ? styles.emptyContainer : styles.listContent),
    [isListEmpty],
  );

  const containerStyle = useMemo(
    () => [styles.root, { paddingTop: insets.top }],
    [insets.top, insets.bottom],
  );

  return (
    <View style={containerStyle}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Devices</Text>
            <Text style={styles.subtitle}>
              Discovering nearby BLE peripherals
            </Text>
          </View>
        </View>

        {lastError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{lastError}</Text>
          </View>
        ) : null}

        <View style={styles.primarySection}>
          <View style={styles.primaryGlowWrapper}>
            <View style={styles.primaryGlow} />
            <TouchableOpacity
              onPress={handleScanPress}
              activeOpacity={0.9}
              style={[styles.scanButton, isScanning && styles.scanButtonActive]}
            >
              <Icon
                iconStyle="solid"
                name={isScanning ? 'square-xmark' : 'satellite-dish'}
                size={18}
                color="#ffffff"
                style={styles.scanIcon}
              />
              <Text style={styles.scanButtonText}>
                {isScanning ? 'Stop scanning' : 'Start scanning'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scanStatusRow}>
            <View
              style={[styles.scanDot, isScanning && styles.scanDotActive]}
            />
            <Text style={styles.scanStatusText}>
              {isScanning
                ? 'Searching for BLE devices…'
                : 'Tap scan to look for devices nearby.'}
            </Text>
          </View>
        </View>

        <View style={styles.listHeaderRow}>
          {devicesCount > 0 && (
            <Text style={styles.listHeaderTitle}>
              Found {devicesCount} device{devicesCount === 1 ? '' : 's'}
            </Text>
          )}
          {!isScanning && devicesCount > 0 && (
            <TouchableOpacity
              onPress={handleSortBySignal}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={isScanning || devicesCount === 0}
            >
              <Text style={styles.sortButtonText}>Sort by signal strength</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlashList
          ref={listRef}
          data={discoveredDevices as any}
          keyExtractor={keyExtractor}
          // @ts-expect-error - estimatedItemSize exists at runtime but is missing from the local type definition
          estimatedItemSize={88}
          renderItem={renderItem}
          contentContainerStyle={listContentContainerStyle}
          ListEmptyComponent={ScannerEmptyList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
  },
  filterButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  filterIcon: {
    fontSize: 16,
    color: '#137fec',
  },
  primarySection: {
    marginBottom: 28,
  },
  primaryGlowWrapper: {
    position: 'relative',
  },
  primaryGlow: {
    position: 'absolute',
    left: -4,
    right: -4,
    top: -4,
    bottom: -4,
    borderRadius: 16,
    backgroundColor: '#137fec',
    opacity: 0.25,
  },
  scanButton: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#137fec',
    shadowColor: '#137fec',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  scanButtonActive: {
    backgroundColor: '#b91c1c',
    shadowColor: '#b91c1c',
  },
  scanIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanStatusRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginRight: 6,
    backgroundColor: '#cbd5f5',
  },
  scanDotActive: {
    backgroundColor: '#137fec',
  },
  scanStatusText: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: '#6b7280',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#6b7280',
  },
  listHeaderSubtitle: {
    fontSize: 10,
    color: '#9ca3af',
  },
  sortButtonText: {
    fontSize: 10,
    color: '#137fec',
    fontWeight: '600',
  },
  errorBox: {
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
  },
  listWrapper: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyInner: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
  },
});
