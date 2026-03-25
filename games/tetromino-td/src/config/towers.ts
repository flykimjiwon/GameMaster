import { TowerType } from './tetrominos';

export interface TowerConfig {
  type: TowerType;
  damage: number;
  range: number;      // in grid cells
  attackSpeed: number; // seconds between attacks
  special: 'aoe' | 'slow' | 'dot' | 'pierce';
  slowAmount?: number;   // 0-1, fraction of speed reduction
  slowDuration?: number; // seconds
  dotDamage?: number;    // damage per second
  dotDuration?: number;  // seconds
  color: number;
  label: string;
}

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
  fire: {
    type: 'fire',
    damage: 10,
    range: 3,
    attackSpeed: 1.0,
    special: 'aoe',
    color: 0xff3333,
    label: 'FIRE',
  },
  ice: {
    type: 'ice',
    damage: 5,
    range: 4,
    attackSpeed: 1.5,
    special: 'slow',
    slowAmount: 0.5,
    slowDuration: 2.0,
    color: 0x3399ff,
    label: 'ICE',
  },
  poison: {
    type: 'poison',
    damage: 3,
    range: 3,
    attackSpeed: 2.0,
    special: 'dot',
    dotDamage: 2,
    dotDuration: 5.0,
    color: 0x33ff33,
    label: 'PSTN',
  },
  lightning: {
    type: 'lightning',
    damage: 15,
    range: 5,
    attackSpeed: 2.0,
    special: 'pierce',
    color: 0xffff33,
    label: 'LTNG',
  },
};

export const LEVEL_MULTIPLIERS = {
  damageMultiplier: 1.5,
  rangeBonus: 1,      // cells per level
  maxLevel: 4,
};

export function getTowerStatsForLevel(
  config: TowerConfig,
  level: number
): { damage: number; range: number; attackSpeed: number } {
  const lvl = Math.max(1, level);
  return {
    damage: config.damage * Math.pow(LEVEL_MULTIPLIERS.damageMultiplier, lvl - 1),
    range: config.range + (lvl - 1) * LEVEL_MULTIPLIERS.rangeBonus,
    attackSpeed: config.attackSpeed,
  };
}
