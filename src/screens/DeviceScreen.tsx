import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useBle } from '../ble/useBle';
import { formatRssi, getDeviceDisplayName } from '../utils/utils';
import { ServiceItem } from '../components/ServiceItem';

export function DeviceScreen() {
  const { connectedDevice, connectionStatus, services, disconnect, refreshServices } = useBle();

  if (!connectedDevice) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No device connected</Text>
        <Text style={styles.emptySubtitle}>Connect to a device from the Scanner tab to see details here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Device</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.deviceName}>{getDeviceDisplayName(connectedDevice)}</Text>
        <Text style={styles.deviceId}>{connectedDevice.id}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>RSSI:</Text>
          <Text style={styles.value}>{formatRssi(connectedDevice.rssi)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{connectionStatus}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => void refreshServices()}>
            <Text style={styles.secondaryButtonText}>Refresh services</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.disconnectButton} onPress={() => void disconnect()}>
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.servicesTitle}>Services & characteristics</Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => <ServiceItem service={item} />}
        contentContainerStyle={services.length === 0 ? styles.servicesEmptyContainer : undefined}
        ListEmptyComponent={
          <Text style={styles.servicesEmptyText}>
            No services loaded yet. Use "Refresh services" if this device exposes GATT services.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f7',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f4f5f7',
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
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  deviceId: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  label: {
    width: 70,
    fontSize: 14,
    color: '#444',
  },
  value: {
    fontSize: 14,
    color: '#111',
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  servicesTitle: {
    marginTop: 4,
    marginBottom: 4,
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  servicesEmptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  servicesEmptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
});

