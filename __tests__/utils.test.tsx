import {
  getDeviceDisplayName,
  formatRssi,
  getDeviceIconName,
  getSignalBarCount,
} from '../src/utils/utils';

describe('utils', () => {
  describe('getDeviceDisplayName', () => {
    it('should return device name when name is provided', () => {
      const device = { id: 'device-123', name: 'My Device' };
      expect(getDeviceDisplayName(device)).toBe('My Device');
    });

    it('should return device id when name is empty string', () => {
      const device = { id: 'device-123', name: '' };
      expect(getDeviceDisplayName(device)).toBe('device-123');
    });

    it('should return device id when name is undefined', () => {
      const device = { id: 'device-123' };
      expect(getDeviceDisplayName(device)).toBe('device-123');
    });

    it('should return device id when name is only whitespace', () => {
      const device = { id: 'device-123', name: '   ' };
      expect(getDeviceDisplayName(device)).toBe('device-123');
    });

    it('should trim whitespace from name', () => {
      const device = { id: 'device-123', name: '  My Device  ' };
      expect(getDeviceDisplayName(device)).toBe('My Device');
    });
  });

  describe('formatRssi', () => {
    it('should format valid RSSI value', () => {
      expect(formatRssi(-65)).toBe('-65 dBm');
      expect(formatRssi(-80)).toBe('-80 dBm');
      expect(formatRssi(0)).toBe('0 dBm');
    });

    it('should return N/A for undefined', () => {
      expect(formatRssi(undefined)).toBe('N/A');
    });

    it('should return N/A for null', () => {
      expect(formatRssi(null)).toBe('N/A');
    });
  });

  describe('getDeviceIconName', () => {
    it('should return clock for watch devices', () => {
      expect(getDeviceIconName({ name: 'Apple Watch' })).toBe('clock');
      expect(getDeviceIconName({ name: 'My Watch' })).toBe('clock');
      expect(getDeviceIconName({ name: 'Samsung Watch' })).toBe('clock');
    });

    it('should return tv for TV devices', () => {
      expect(getDeviceIconName({ name: 'Samsung TV' })).toBe('tv');
      expect(getDeviceIconName({ name: 'LG TV' })).toBe('tv');
    });

    it('should return headphones for headphone devices', () => {
      expect(getDeviceIconName({ name: 'Sony Headphones' })).toBe('headphones');
      expect(getDeviceIconName({ name: 'XM-1000' })).toBe('headphones');
      expect(getDeviceIconName({ name: 'Bose Headphone' })).toBe('headphones');
    });

    it('should return lightbulb for light devices', () => {
      expect(getDeviceIconName({ name: 'Philips Hue Bulb' })).toBe('lightbulb');
      expect(getDeviceIconName({ name: 'Smart Light' })).toBe('lightbulb');
    });

    it('should return mobile-screen for phone devices', () => {
      expect(getDeviceIconName({ name: 'iPhone 12' })).toBe('mobile-screen');
      expect(getDeviceIconName({ name: 'Samsung Phone' })).toBe('mobile-screen');
    });

    it('should return keyboard for keyboard devices', () => {
      expect(getDeviceIconName({ name: 'Mechanical Keyboard' })).toBe('keyboard');
      expect(getDeviceIconName({ name: 'Wireless Key' })).toBe('keyboard');
    });

    it('should return volume-high for speaker devices', () => {
      expect(getDeviceIconName({ name: 'JBL Speaker' })).toBe('volume-high');
      expect(getDeviceIconName({ name: 'Sound Bar' })).toBe('volume-high');
    });

    it('should return bluetooth-b as default', () => {
      expect(getDeviceIconName({ name: 'Unknown Device' })).toBe('bluetooth-b');
      expect(getDeviceIconName({ name: '' })).toBe('bluetooth-b');
      expect(getDeviceIconName({})).toBe('bluetooth-b');
    });

    it('should be case insensitive', () => {
      expect(getDeviceIconName({ name: 'APPLE WATCH' })).toBe('clock');
      expect(getDeviceIconName({ name: 'Sony XM-1000' })).toBe('headphones');
    });
  });

  describe('getSignalBarCount', () => {
    it('should return 4 bars for strong signal (>= -55)', () => {
      expect(getSignalBarCount(-55)).toBe(4);
      expect(getSignalBarCount(-50)).toBe(4);
      expect(getSignalBarCount(0)).toBe(4);
    });

    it('should return 3 bars for good signal (>= -65)', () => {
      expect(getSignalBarCount(-65)).toBe(3);
      expect(getSignalBarCount(-60)).toBe(3);
    });

    it('should return 2 bars for fair signal (>= -80)', () => {
      expect(getSignalBarCount(-80)).toBe(2);
      expect(getSignalBarCount(-75)).toBe(2);
    });

    it('should return 1 bar for weak signal (>= -95)', () => {
      expect(getSignalBarCount(-95)).toBe(1);
      expect(getSignalBarCount(-90)).toBe(1);
    });

    it('should return 0 bars for very weak signal (< -95)', () => {
      expect(getSignalBarCount(-100)).toBe(0);
      expect(getSignalBarCount(-120)).toBe(0);
    });

    it('should return 0 for undefined', () => {
      expect(getSignalBarCount(undefined)).toBe(0);
    });

    it('should return 0 for null', () => {
      expect(getSignalBarCount(null)).toBe(0);
    });
  });
});
