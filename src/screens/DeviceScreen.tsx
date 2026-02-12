import React, { useCallback, useMemo, memo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBle } from '../ble/useBle';
import { formatRssi, getDeviceDisplayName } from '../utils/utils';
import { ServiceItem } from '../components/ServiceItem';
import type { BleService } from '../ble/bleReducer';

const DeviceScreenEmpty = memo(function DeviceScreenEmpty() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No device connected</Text>
      <Text style={styles.emptySubtitle}>
        Connect to a device from the Scanner tab to see details here.
      </Text>
    </View>
  );
});

const ServicesListEmpty = memo(function ServicesListEmpty() {
  return (
    <Text style={styles.servicesEmptyText}>
      No services loaded yet. Use "Refresh" if this device exposes GATT
      services.
    </Text>
  );
});

export function DeviceScreen() {
  const insets = useSafeAreaInsets();
  const { connectedDevice, services, disconnect, refreshServices } = useBle();

  const handleRefresh = useCallback(() => {
    refreshServices().catch(() => {});
  }, [refreshServices]);

  const handleDisconnect = useCallback(() => {
    disconnect().catch(() => {});
  }, [disconnect]);

  const keyExtractor = useCallback((item: BleService) => item.uuid, []);

  const renderServiceItem = useCallback(
    ({ item }: { item: BleService }) => <ServiceItem service={item} />,
    [],
  );

  const servicesCount = services.length;
  const isServicesEmpty = servicesCount === 0;

  const listContentContainerStyle = useMemo(
    () =>
      isServicesEmpty ? styles.servicesEmptyContainer : styles.servicesContent,
    [isServicesEmpty],
  );

  const rootStyle = useMemo(
    () => [styles.root, { paddingTop: insets.top }],
    [insets.top],
  );

  if (!connectedDevice) {
    return <DeviceScreenEmpty />;
  }

  return (
    <View style={rootStyle}>
      <View style={styles.container}>
        <View style={styles.navRow}>
          <Text style={styles.navTitle}>Device details</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.deviceName}>
                {getDeviceDisplayName(connectedDevice)}
              </Text>
              <View style={styles.connectedRow}>
                <View style={styles.connectedDotOuter}>
                  <View style={styles.connectedDotInner} />
                </View>
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            </View>
            <View style={styles.rssiBlock}>
              <Text style={styles.rssiLabel}>RSSI</Text>
              <Text style={styles.rssiValue}>
                {formatRssi(connectedDevice.rssi)}
              </Text>
            </View>
          </View>

          <Text style={styles.deviceId}>{connectedDevice.id}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.servicesHeaderRow}>
          <Text style={styles.servicesTitle}>
            Services discovered ({servicesCount})
          </Text>
        </View>

        <FlatList
          data={services}
          keyExtractor={keyExtractor}
          renderItem={renderServiceItem}
          contentContainerStyle={listContentContainerStyle}
          ListEmptyComponent={ServicesListEmpty}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Protocol: BLE • MAC: {connectedDevice.id}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  headerSpacer: {
    height: 12,
  },
  container: {
    flex: 1,
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  navRow: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBackIcon: {
    marginRight: 4,
  },
  navBackText: {
    fontSize: 13,
    color: '#137fec',
    fontWeight: '500',
  },
  navTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: '#6b7280',
    fontWeight: '600',
  },
  navShareRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navShareIcon: {
    marginRight: 4,
  },
  navAction: {
    fontSize: 13,
    color: '#137fec',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f6f7f8',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  card: {
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deviceName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  deviceId: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 6,
    marginBottom: 8,
  },
  connectedRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedDotOuter: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  connectedDotInner: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#22c55e',
  },
  connectedText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#22c55e',
  },
  rssiBlock: {
    alignItems: 'flex-end',
  },
  rssiLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#9ca3af',
    marginBottom: 2,
  },
  rssiValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
    color: '#0f172a',
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  label: {
    width: 70,
    fontSize: 13,
    color: '#6b7280',
  },
  value: {
    fontSize: 13,
    color: '#111827',
  },
  actionsRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  refreshButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  servicesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  servicesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  servicesExpand: {
    fontSize: 12,
    color: '#137fec',
    fontWeight: '500',
  },
  servicesEmptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  servicesContent: {
    paddingBottom: 12,
  },
  servicesEmptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b7280',
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#9ca3af',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
