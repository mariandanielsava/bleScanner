import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BleService } from '../ble/bleReducer';

type Props = {
  service: BleService;
};

export function ServiceItem({ service }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{service.uuid}</Text>
      {service.characteristics.map((c) => {
        const properties = c.properties ? Object.keys(c.properties).join(', ') : 'n/a';
        return (
          <View key={`${c.service}-${c.characteristic}`} style={styles.characteristicRow}>
            <Text style={styles.characteristicId}>{c.characteristic}</Text>
            <Text style={styles.properties}>{properties}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111',
  },
  characteristicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  characteristicId: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    marginRight: 8,
  },
  properties: {
    fontSize: 12,
    color: '#666',
  },
});

