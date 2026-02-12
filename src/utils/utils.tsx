export function getDeviceDisplayName(device: { name?: string; id: string }) {
  const n = (device.name ?? '').trim();
  return n.length > 0 ? n : device.id;
}

export function formatRssi(rssi?: number | null) {
  if (rssi === undefined || rssi === null) return 'N/A';
  return `${rssi} dBm`;
}

