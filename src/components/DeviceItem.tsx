import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BleConnectedDevice, BleConnectionStatus } from '../ble/bleReducer';
import { formatRssi, getDeviceDisplayName } from '../utils/utils';

type Props = {
  device: BleConnectedDevice;
  isConnected: boolean;
  connectionStatus: BleConnectionStatus;
  onPress: () => void;
};

export function DeviceItem({ device, isConnected, connectionStatus, onPress }: Props) {
  const statusLabel = isConnected ? connectionStatus : undefined;

  return (
    <TouchableOpacity style={[styles.container, isConnected && styles.connected]} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.name}>{getDeviceDisplayName(device)}</Text>
        <Text style={styles.id}>{device.id}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.rssi}>{formatRssi(device.rssi)}</Text>
        {statusLabel ? <Text style={styles.status}>{statusLabel}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  connected: {
    backgroundColor: '#e0f7fa',
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  id: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  rssi: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },
  status: {
    marginTop: 4,
    fontSize: 12,
    color: '#00796b',
    textTransform: 'capitalize',
  },
});

