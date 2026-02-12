import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '@react-native-vector-icons/fontawesome6';
import type {
  BleConnectedDevice,
  BleConnectionStatus,
} from '../ble/bleReducer';
import {
  formatRssi,
  getDeviceDisplayName,
  getDeviceIconName,
  getSignalBarCount,
} from '../utils/utils';

const BAR_COUNT = 4;

type Props = {
  device: BleConnectedDevice;
  isConnected: boolean;
  isConnecting: boolean;
  connectionStatus: BleConnectionStatus;
  onPress: () => void;
};

function DeviceItemComponent({
  device,
  isConnected,
  isConnecting,
  onPress,
}: Props) {
  const displayName = getDeviceDisplayName(device);
  const iconName = getDeviceIconName(device);
  const activeBars = getSignalBarCount(device.rssi);

  const label = isConnecting
    ? 'Connecting...'
    : isConnected
    ? 'Explore'
    : 'Connect';

  return (
    <TouchableOpacity
      style={[styles.container, isConnected && styles.connected]}
      onPress={onPress}
      disabled={isConnecting}
    >
      <>
        <View style={styles.iconContainer}>
          <Icon
            iconStyle={iconName === 'bluetooth-b' ? 'brand' : 'solid'}
            name={iconName as any}
            size={22}
            color={isConnecting ? '#9ca3af' : '#137fec'}
          />
        </View>
        <View style={styles.left}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <View style={styles.signalRow}>
            <View style={styles.signalBars}>
              {Array.from({ length: BAR_COUNT }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.signalBar,
                    { height: 6 + index * 4 },
                    index < activeBars
                      ? styles.signalBarActive
                      : styles.signalBarInactive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.rssiText}>{formatRssi(device.rssi)}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text
            style={[
              styles.actionText,
              isConnected && styles.actionTextConnected,
              isConnecting && styles.actionTextConnecting,
            ]}
          >
            {label}
          </Text>
        </View>
      </>
    </TouchableOpacity>
  );
}

export const DeviceItem = memo(DeviceItemComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  connected: {
    borderColor: '#137fec',
    backgroundColor: '#eff6ff',
  },
  connecting: {
    opacity: 0.85,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5f0ff',
  },
  left: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 6,
  },
  signalBar: {
    width: 3,
    borderRadius: 2,
    marginRight: 2,
  },
  signalBarActive: {
    backgroundColor: '#137fec',
  },
  signalBarInactive: {
    backgroundColor: '#e5e7eb',
  },
  rssiText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#137fec',
  },
  actionTextConnected: {
    color: '#059669',
  },
  actionTextConnecting: {
    color: '#9ca3af',
  },
});
