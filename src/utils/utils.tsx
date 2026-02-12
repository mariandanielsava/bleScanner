export function getDeviceDisplayName(device: { name?: string; id: string }) {
  const n = (device.name ?? '').trim();
  return n.length > 0 ? n : device.id;
}

export function formatRssi(rssi?: number | null) {
  if (rssi === undefined || rssi === null) return 'N/A';
  return `${rssi} dBm`;
}

export function getDeviceIconName(device: { name?: string }): string {
  const name = (device.name ?? '').toLowerCase();
  if (name.includes('watch') || name.includes('apple watch')) return 'clock';
  if (name.includes('tv')) return 'tv';
  if (
    name.includes('headphone') ||
    name.includes('sony') ||
    name.includes('xm')
  )
    return 'headphones';
  if (name.includes('bulb') || name.includes('hue') || name.includes('light'))
    return 'lightbulb';
  if (name.includes('phone') || name.includes('iphone')) return 'mobile-screen';
  if (name.includes('keyboard') || name.includes('key')) return 'keyboard';
  if (name.includes('speaker') || name.includes('sound')) return 'volume-high';
  return 'bluetooth-b';
}

export function getSignalBarCount(rssi?: number | null): number {
  if (rssi === undefined || rssi === null) return 0;
  if (rssi >= -55) return 4;
  if (rssi >= -65) return 3;
  if (rssi >= -80) return 2;
  if (rssi >= -95) return 1;
  return 0;
}
