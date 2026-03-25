export type UnitType = 'warrior' | 'archer' | 'mage';

export interface UnitStats {
  hp: number;
  attack: number;
  attackSpeed: number; // attacks per second
  range: number; // pixels
  moveSpeed: number; // pixels per second
  isRanged: boolean;
  aoe: boolean;
  aoeRadius?: number;
}

// 3 types x 5 tiers = 15 unit varieties
export const UNIT_STATS: Record<UnitType, UnitStats[]> = {
  warrior: [
    { hp: 100,  attack: 15,  attackSpeed: 1.0, range: 40, moveSpeed: 60, isRanged: false, aoe: false },
    { hp: 200,  attack: 30,  attackSpeed: 1.1, range: 40, moveSpeed: 65, isRanged: false, aoe: false },
    { hp: 450,  attack: 65,  attackSpeed: 1.2, range: 45, moveSpeed: 70, isRanged: false, aoe: false },
    { hp: 1000, attack: 140, attackSpeed: 1.3, range: 45, moveSpeed: 75, isRanged: false, aoe: false },
    { hp: 2500, attack: 300, attackSpeed: 1.5, range: 50, moveSpeed: 80, isRanged: false, aoe: false },
  ],
  archer: [
    { hp: 50,  attack: 20,  attackSpeed: 1.2, range: 200, moveSpeed: 50, isRanged: true, aoe: false },
    { hp: 100, attack: 45,  attackSpeed: 1.3, range: 220, moveSpeed: 55, isRanged: true, aoe: false },
    { hp: 200, attack: 95,  attackSpeed: 1.4, range: 240, moveSpeed: 55, isRanged: true, aoe: false },
    { hp: 450, attack: 200, attackSpeed: 1.5, range: 260, moveSpeed: 60, isRanged: true, aoe: false },
    { hp: 1000,attack: 420, attackSpeed: 1.8, range: 300, moveSpeed: 65, isRanged: true, aoe: false },
  ],
  mage: [
    { hp: 40,  attack: 25,  attackSpeed: 0.7, range: 180, moveSpeed: 45, isRanged: true, aoe: true, aoeRadius: 60  },
    { hp: 80,  attack: 55,  attackSpeed: 0.8, range: 200, moveSpeed: 48, isRanged: true, aoe: true, aoeRadius: 70  },
    { hp: 160, attack: 115, attackSpeed: 0.9, range: 220, moveSpeed: 50, isRanged: true, aoe: true, aoeRadius: 80  },
    { hp: 350, attack: 240, attackSpeed: 1.0, range: 240, moveSpeed: 53, isRanged: true, aoe: true, aoeRadius: 90  },
    { hp: 800, attack: 500, attackSpeed: 1.1, range: 280, moveSpeed: 55, isRanged: true, aoe: true, aoeRadius: 100 },
  ],
};

export const UNIT_COLORS: Record<UnitType, number> = {
  warrior: 0xFF4444,
  archer:  0x44FF44,
  mage:    0x4488FF,
};

export const TIER_COLORS: number[] = [
  0xCCCCCC, // tier 1 - silver
  0x44FF44, // tier 2 - green
  0x4488FF, // tier 3 - blue
  0xAA44FF, // tier 4 - purple
  0xFFAA00, // tier 5 - gold
];

export const UNIT_TYPES: UnitType[] = ['warrior', 'archer', 'mage'];

export const AUTO_SPAWN_INTERVAL = 3000; // ms
export const MERGE_GRID_COLS = 5;
export const MERGE_GRID_ROWS = 3;
export const MAX_TIER = 5;
