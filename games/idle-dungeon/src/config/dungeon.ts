export interface FloorConfig {
  floorNumber: number;
  roomCount: number;
  enemyHp: number;
  enemyAtk: number;
  enemyDef: number;
  isBossFloor: boolean;
  treasureBase: number;
  goldPerSecond: number;
}

export const DUNGEON_WIDTH = 60;
export const DUNGEON_HEIGHT = 40;

export function getFloorConfig(floor: number): FloorConfig {
  const isBossFloor = floor % 10 === 0;
  const tier = Math.floor(floor / 10);

  // Room count: 5 base + 1 per 5 floors, capped at 15
  const roomCount = Math.min(5 + Math.floor(floor / 5), 15);

  // Enemy scaling: exponential growth
  const scale = Math.pow(1.15, floor - 1);
  const bossMultiplier = isBossFloor ? 5 : 1;

  const enemyHp = Math.floor(10 * scale * bossMultiplier);
  const enemyAtk = Math.floor(3 * scale * (isBossFloor ? 2 : 1));
  const enemyDef = Math.floor(1 * scale * (isBossFloor ? 1.5 : 1));

  // Treasure scales with floor
  const treasureBase = Math.floor(5 * Math.pow(1.2, floor - 1));

  // Passive gold per second from deployed monsters
  const goldPerSecond = Math.max(0.5, floor * 0.1 * (1 + tier * 0.5));

  return {
    floorNumber: floor,
    roomCount,
    enemyHp,
    enemyAtk,
    enemyDef,
    isBossFloor,
    treasureBase,
    goldPerSecond,
  };
}

export interface EnemyTemplate {
  name: string;
  emoji: string;
  hpMult: number;
  atkMult: number;
  defMult: number;
}

export const ENEMY_POOL: EnemyTemplate[] = [
  { name: 'Kobold', emoji: '👺', hpMult: 0.8, atkMult: 0.8, defMult: 0.6 },
  { name: 'Skeleton', emoji: '💀', hpMult: 1.0, atkMult: 1.0, defMult: 0.8 },
  { name: 'Orc', emoji: '👹', hpMult: 1.2, atkMult: 1.1, defMult: 1.0 },
  { name: 'Troll', emoji: '🧌', hpMult: 1.5, atkMult: 0.9, defMult: 1.2 },
  { name: 'Wraith', emoji: '👤', hpMult: 0.7, atkMult: 1.3, defMult: 0.5 },
  { name: 'Spider', emoji: '🕷️', hpMult: 0.6, atkMult: 1.4, defMult: 0.4 },
  { name: 'Golem', emoji: '🗿', hpMult: 2.0, atkMult: 0.8, defMult: 2.0 },
];

export const BOSS_POOL: EnemyTemplate[] = [
  { name: 'Ancient Dragon', emoji: '🐲', hpMult: 5.0, atkMult: 3.0, defMult: 2.0 },
  { name: 'Lich King', emoji: '💀', hpMult: 4.0, atkMult: 4.0, defMult: 1.5 },
  { name: 'Demon Lord', emoji: '😈', hpMult: 6.0, atkMult: 2.5, defMult: 2.5 },
  { name: 'Titan', emoji: '⚡', hpMult: 8.0, atkMult: 2.0, defMult: 3.0 },
  { name: 'Shadow King', emoji: '👑', hpMult: 4.5, atkMult: 3.5, defMult: 2.0 },
];

export const LEVEL_UP_STAT_BONUS = 0.20; // 20% per level
export const LEVEL_UP_COST_MULTIPLIER = 2.0; // cost doubles per level
export const MERGE_REQUIRED = 3; // 3 same monsters to merge
export const MAX_GRADE = 5;
export const GRADE_STAT_MULTIPLIER = 2.0; // ×2 per grade
export const OFFLINE_CAP_SECONDS = 86400; // 24 hours
export const AUTOSAVE_INTERVAL = 30000; // 30 seconds
export const EXPLORE_TICK_MS = 100; // exploration update interval
