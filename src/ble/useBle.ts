import { useContext } from 'react';
import { BleContext, type BleContextValue } from './BleProvider';

export function useBle(): BleContextValue {
  const ctx = useContext(BleContext);
  if (!ctx) {
    throw new Error('useBle must be used within BleProvider');
  }
  return ctx;
}

