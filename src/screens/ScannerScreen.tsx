import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useBle } from '../ble/useBle';
import { DeviceItem } from '../components/DeviceItem';
import type { TabParamList } from '../navigation/Tabs';

type NavProp = BottomTabNavigationProp<TabParamList, 'Scanner'>;

export function ScannerScreen() {
  const navigation = useNavigation<NavProp>();
  const { scan, stopScan, isScanning, discoveredDevices, connect, connectedDevice, connectionStatus } = useBle();

  const handleScanPress = useCallback(() => {
    if (isScanning) {
      void stopScan();
    } else {
      void scan();
    }
  }, [isScanning, scan, stopScan]);

  const handleConnect = useCallback(
    async (deviceId: string) => {
      await connect(deviceId);
      // After successful connect, automatically navigate to Device tab
      navigation.navigate('Device');
    },
    [connect, navigation],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BLE Scanner</Text>
        <TouchableOpacity
          onPress={handleScanPress}
          style={[styles.scanButton, isScanning && styles.scanButtonActive]}>
          <Text style={styles.scanButtonText}>{isScanning ? 'Stop scanning' : 'Scan'}</Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={discoveredDevices}
        keyExtractor={(item) => item.id}
        estimatedItemSize={72}
        renderItem={({ item }) => (
          <DeviceItem
            device={item}
            isConnected={connectedDevice?.id === item.id}
            connectionStatus={connectionStatus}
            onPress={() => handleConnect(item.id)}
          />
        )}
        contentContainerStyle={discoveredDevices.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isScanning
              ? 'Scanning for nearby BLE devices...'
              : 'No devices yet. Press "Scan" to start discovering BLE devices.'}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  scanButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1976d2',
  },
  scanButtonActive: {
    backgroundColor: '#d32f2f',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
  },
});

