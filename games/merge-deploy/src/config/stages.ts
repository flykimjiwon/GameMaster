export interface EnemySpawnConfig {
  type: string;
  count: number;
  interval: number; // ms between each enemy spawn
  hp: number;
  attack: number;
  speed: number;
}

export interface WaveConfig {
  delay: number; // ms before wave starts
  enemies: EnemySpawnConfig[];
}

export interface StageConfig {
  id: number;
  name: string;
  waves: WaveConfig[];
  baseHp: number;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  costPerLevel: number;
  effectPerLevel: number; // % per level
}

export const UPGRADES: UpgradeConfig[] = [
  { id: 'attack',     name: 'Attack Power', description: 'Unit base attack +5% per level',    maxLevel: 20, costPerLevel: 1, effectPerLevel: 5 },
  { id: 'mergeSpeed', name: 'Merge Speed',  description: 'Auto-spawn interval -5% per level', maxLevel: 20, costPerLevel: 1, effectPerLevel: 5 },
  { id: 'spawnSpeed', name: 'Spawn Speed',  description: 'Unit spawn rate +5% per level',     maxLevel: 20, costPerLevel: 2, effectPerLevel: 5 },
  { id: 'hp',         name: 'Unit HP',      description: 'Unit base HP +5% per level',        maxLevel: 20, costPerLevel: 1, effectPerLevel: 5 },
];

export const STAGES: StageConfig[] = [
  // Stage 1: Tutorial
  {
    id: 1, name: 'Green Fields',
    baseHp: 500,
    waves: [
      { delay: 3000,  enemies: [{ type: 'grunt', count: 3, interval: 2000, hp: 50,  attack: 5,  speed: 40 }] },
      { delay: 18000, enemies: [{ type: 'grunt', count: 5, interval: 1500, hp: 60,  attack: 7,  speed: 40 }] },
    ],
  },
  // Stage 2: Forest Path
  {
    id: 2, name: 'Forest Path',
    baseHp: 800,
    waves: [
      { delay: 3000,  enemies: [{ type: 'grunt',  count: 4, interval: 1800, hp: 80,  attack: 8,  speed: 42 }] },
      { delay: 20000, enemies: [{ type: 'grunt',  count: 6, interval: 1500, hp: 90,  attack: 10, speed: 44 }] },
      { delay: 38000, enemies: [{ type: 'runner', count: 3, interval: 1000, hp: 60,  attack: 6,  speed: 70 }] },
    ],
  },
  // Stage 3: River Crossing
  {
    id: 3, name: 'River Crossing',
    baseHp: 1200,
    waves: [
      { delay: 3000,  enemies: [{ type: 'grunt',  count: 5, interval: 1500, hp: 100, attack: 10, speed: 44 }] },
      { delay: 22000, enemies: [{ type: 'runner', count: 4, interval: 1200, hp: 80,  attack: 8,  speed: 72 }] },
      { delay: 40000, enemies: [{ type: 'grunt',  count: 6, interval: 1000, hp: 120, attack: 12, speed: 46 }] },
      { delay: 58000, enemies: [{ type: 'brute',  count: 2, interval: 3000, hp: 300, attack: 20, speed: 35 }] },
    ],
  },
  // Stage 4: Dark Valley
  {
    id: 4, name: 'Dark Valley',
    baseHp: 1800,
    waves: [
      { delay: 3000,  enemies: [{ type: 'grunt',  count: 6, interval: 1200, hp: 120, attack: 12, speed: 46 }] },
      { delay: 20000, enemies: [{ type: 'runner', count: 5, interval: 1000, hp: 100, attack: 10, speed: 75 }] },
      { delay: 38000, enemies: [{ type: 'brute',  count: 3, interval: 2500, hp: 350, attack: 25, speed: 36 }] },
      { delay: 58000, enemies: [
          { type: 'grunt',  count: 4, interval: 1000, hp: 130, attack: 14, speed: 48 },
          { type: 'runner', count: 3, interval: 1200, hp: 110, attack: 12, speed: 76 },
        ],
      },
    ],
  },
  // Stage 5: Ancient Ruins
  {
    id: 5, name: 'Ancient Ruins',
    baseHp: 2500,
    waves: [
      { delay: 3000,  enemies: [{ type: 'grunt',  count: 7, interval: 1000, hp: 150, attack: 15, speed: 48 }] },
      { delay: 22000, enemies: [{ type: 'brute',  count: 4, interval: 2000, hp: 400, attack: 30, speed: 37 }] },
      { delay: 42000, enemies: [{ type: 'runner', count: 6, interval: 800,  hp: 120, attack: 12, speed: 78 }] },
      { delay: 62000, enemies: [{ type: 'boss',   count: 1, interval: 5000, hp: 1500,attack: 50, speed: 30 }] },
    ],
  },
  // Stage 6: Scorched Earth
  {
    id: 6, name: 'Scorched Earth',
    baseHp: 3500,
    waves: [
      { delay: 3000,  enemies: [{ type: 'grunt',  count: 8, interval: 900,  hp: 200, attack: 18, speed: 50 }] },
      { delay: 22000, enemies: [{ type: 'runner', count: 7, interval: 800,  hp: 150, attack: 15, speed: 80 }] },
      { delay: 40000, enemies: [{ type: 'brute',  count: 5, interval: 1800, hp: 500, attack: 35, speed: 38 }] },
      { delay: 60000, enemies: [
          { type: 'grunt',  count: 5, interval: 800,  hp: 220, attack: 20, speed: 52 },
          { type: 'runner', count: 4, interval: 900,  hp: 160, attack: 16, speed: 82 },
        ],
      },
      { delay: 80000, enemies: [{ type: 'boss', count: 1, interval: 5000, hp: 2500, attack: 65, speed: 32 }] },
    ],
  },
  // Stage 7: Frozen Wastes
  {
    id: 7, name: 'Frozen Wastes',
    baseHp: 5000,
    waves: [
      { delay: 3000,  enemies: [{ type: 'grunt',  count: 10, interval: 800,  hp: 250, attack: 22, speed: 52 }] },
      { delay: 25000, enemies: [{ type: 'brute',  count: 6,  interval: 1500, hp: 650, attack: 40, speed: 39 }] },
      { delay: 47000, enemies: [{ type: 'runner', count: 8,  interval: 700,  hp: 200, attack: 18, speed: 85 }] },
      { delay: 67000, enemies: [{ type: 'boss',   count: 2,  interval: 8000, hp: 2000,attack: 55, speed: 32 }] },
      { delay: 90000, enemies: [
          { type: 'grunt',  count: 8,  interval: 700,  hp: 280, attack: 25, speed: 54 },
          { type: 'brute',  count: 3,  interval: 2000, hp: 700, attack: 45, speed: 40 },
        ],
      },
    ],
  },
  // Stage 8: Shadow Fortress
  {
    id: 8, name: 'Shadow Fortress',
    baseHp: 7000,
    waves: [
      { delay: 3000,  enemies: [{ type: 'runner', count: 10, interval: 600,  hp: 250, attack: 22, speed: 88 }] },
      { delay: 22000, enemies: [{ type: 'brute',  count: 8,  interval: 1200, hp: 800, attack: 50, speed: 40 }] },
      { delay: 44000, enemies: [{ type: 'grunt',  count: 12, interval: 700,  hp: 320, attack: 28, speed: 55 }] },
      { delay: 66000, enemies: [{ type: 'boss',   count: 2,  interval: 6000, hp: 3000,attack: 75, speed: 33 }] },
      { delay: 88000, enemies: [
          { type: 'runner', count: 6,  interval: 600,  hp: 280, attack: 24, speed: 90 },
          { type: 'brute',  count: 4,  interval: 1500, hp: 900, attack: 55, speed: 41 },
          { type: 'grunt',  count: 6,  interval: 700,  hp: 350, attack: 30, speed: 57 },
        ],
      },
    ],
  },
  // Stage 9: Demon Gate
  {
    id: 9, name: 'Demon Gate',
    baseHp: 10000,
    waves: [
      { delay: 3000,  enemies: [{ type: 'grunt',  count: 12, interval: 600,  hp: 400, attack: 35, speed: 58 }] },
      { delay: 22000, enemies: [{ type: 'runner', count: 12, interval: 500,  hp: 300, attack: 28, speed: 92 }] },
      { delay: 40000, enemies: [{ type: 'brute',  count: 10, interval: 1000, hp: 1000,attack: 60, speed: 42 }] },
      { delay: 62000, enemies: [{ type: 'boss',   count: 3,  interval: 5000, hp: 3500,attack: 90, speed: 35 }] },
      { delay: 88000, enemies: [
          { type: 'grunt',  count: 10, interval: 500,  hp: 450, attack: 38, speed: 60 },
          { type: 'runner', count: 8,  interval: 500,  hp: 330, attack: 30, speed: 94 },
          { type: 'brute',  count: 5,  interval: 1200, hp: 1100,attack: 65, speed: 43 },
        ],
      },
      { delay: 115000, enemies: [{ type: 'boss', count: 1, interval: 5000, hp: 8000, attack: 120, speed: 30 }] },
    ],
  },
  // Stage 10: Final Boss
  {
    id: 10, name: 'Dragon\'s Lair',
    baseHp: 15000,
    waves: [
      { delay: 3000,  enemies: [
          { type: 'grunt',  count: 15, interval: 500,  hp: 500,  attack: 40,  speed: 62 },
          { type: 'runner', count: 10, interval: 600,  hp: 380,  attack: 34,  speed: 96 },
        ],
      },
      { delay: 28000, enemies: [{ type: 'brute', count: 12, interval: 900,  hp: 1300, attack: 75,  speed: 44 }] },
      { delay: 52000, enemies: [{ type: 'boss',  count: 3,  interval: 4000, hp: 5000, attack: 100, speed: 36 }] },
      { delay: 76000, enemies: [
          { type: 'grunt',  count: 12, interval: 400,  hp: 600,  attack: 45,  speed: 64 },
          { type: 'runner', count: 12, interval: 400,  hp: 450,  attack: 38,  speed: 98 },
          { type: 'brute',  count: 6,  interval: 1000, hp: 1500, attack: 80,  speed: 45 },
        ],
      },
      { delay: 105000, enemies: [{ type: 'boss', count: 1, interval: 5000, hp: 20000, attack: 180, speed: 28 }] },
    ],
  },
];
