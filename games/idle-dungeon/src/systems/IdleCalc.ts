import { Decimal, decimalFromNumber } from './BigNumber';
import { OFFLINE_CAP_SECONDS } from '../config/dungeon';

export interface OfflineResult {
  offlineGold: Decimal;
  offlineSeconds: number;
  offlineMinutes: number;
  floorsEstimated: number;
}

export function calcOfflineRewards(
  lastSaveTime: number,
  goldPerSecond: number,
  goldMultiplier: number
): OfflineResult {
  const now = Date.now();
  const elapsedMs = now - lastSaveTime;
  const elapsedSeconds = Math.min(elapsedMs / 1000, OFFLINE_CAP_SECONDS);

  if (elapsedSeconds < 5) {
    return {
      offlineGold: decimalFromNumber(0),
      offlineSeconds: 0,
      offlineMinutes: 0,
      floorsEstimated: 0,
    };
  }

  const gps = goldPerSecond * goldMultiplier;
  const offlineGold = decimalFromNumber(gps * elapsedSeconds);
  const floorsEstimated = Math.floor(elapsedSeconds / 30); // ~1 floor per 30s

  return {
    offlineGold,
    offlineSeconds: Math.floor(elapsedSeconds),
    offlineMinutes: Math.floor(elapsedSeconds / 60),
    floorsEstimated,
  };
}

export function formatOfflineTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
