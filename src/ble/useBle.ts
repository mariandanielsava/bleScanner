import { useContext } from 'react';
import { BleContext } from './BleProvider';

export function useBle() {
  const ctx = useContext(BleContext);
  if (!ctx) {
    throw new Error('useBle must be used within BleProvider');
  }
  return ctx;
}

