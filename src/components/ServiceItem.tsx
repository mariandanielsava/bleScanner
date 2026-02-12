import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BleService, BleCharacteristic } from '../ble/bleReducer';

const PRIMARY_KEYS = new Set(['Notify', 'Read', 'Write']);

type CharacteristicRowProps = {
  characteristic: BleCharacteristic;
};

const CharacteristicRow = memo(function CharacteristicRow({
  characteristic,
}: CharacteristicRowProps) {
  const badges = useMemo(() => {
    const keys = characteristic.properties
      ? Object.keys(characteristic.properties)
      : [];
    if (keys.length === 0) {
      return (
        <View style={[styles.badge, styles.badgeNeutral]}>
          <Text style={styles.badgeTextNeutral}>Unknown</Text>
        </View>
      );
    }
    return keys.map((k) => {
      const isPrimary = PRIMARY_KEYS.has(k);
      return (
        <View
          key={k}
          style={[
            styles.badge,
            isPrimary ? styles.badgePrimary : styles.badgeSecondary,
          ]}
        >
          <Text
            style={
              isPrimary ? styles.badgeTextPrimary : styles.badgeTextSecondary
            }
          >
            {k}
          </Text>
        </View>
      );
    });
  }, [characteristic.properties]);

  return (
    <View style={styles.characteristicBlock}>
      <View style={styles.characteristicHeader}>
        <Text style={styles.characteristicLabel}>Characteristic</Text>
      </View>
      <Text style={styles.characteristicId} numberOfLines={2}>
        {characteristic.characteristic}
      </Text>
      <View style={styles.badgesRow}>{badges}</View>
    </View>
  );
});

type Props = {
  service: BleService;
};

function ServiceItemComponent({ service }: Props) {
  const characteristicRows = useMemo(
    () =>
      service.characteristics.map((c) => (
        <CharacteristicRow
          key={`${c.service}-${c.characteristic}`}
          characteristic={c}
        />
      )),
    [service.characteristics],
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Service</Text>
          <Text style={styles.uuid} numberOfLines={1}>
            {service.uuid}
          </Text>
        </View>
      </View>
      {characteristicRows}
    </View>
  );
}

export const ServiceItem = memo(ServiceItemComponent);

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  uuid: {
    marginTop: 4,
    fontSize: 11,
    color: '#4b5563',
  },
  characteristicBlock: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f3f4f6',
  },
  characteristicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  characteristicLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9ca3af',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    marginRight: 4,
  },
  badgePrimary: {
    backgroundColor: 'rgba(19, 127, 236, 0.16)',
  },
  badgeSecondary: {
    backgroundColor: '#e5e7eb',
  },
  badgeNeutral: {
    backgroundColor: '#e5e7eb',
  },
  badgeTextPrimary: {
    fontSize: 10,
    fontWeight: '700',
    color: '#137fec',
    textTransform: 'uppercase',
  },
  badgeTextSecondary: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4b5563',
    textTransform: 'uppercase',
  },
  badgeTextNeutral: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  characteristicId: {
    marginTop: 4,
    fontSize: 11,
    color: '#4b5563',
  },
});
