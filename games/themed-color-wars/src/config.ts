// Game constants
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Grid
export const GRID_COLS = 5;
export const GRID_ROWS = 3;
export const CELL_SIZE = 80;
export const GRID_OFFSET_X = 300;
export const GRID_OFFSET_Y = 150;

// Path
export const PATH_COLOR = 0xBDBDBD;
export const PATH_ALPHA = 0.5;

// Tower types — color-wars rename: archer=yellow, cannon=red, slow=blue
export type TowerType = 'archer' | 'cannon' | 'slow';
export type CellState = 'empty' | 'tower' | 'path';

// T1 colors
export const TOWER_COLORS: Record<TowerType, number> = {
  archer: 0xFFEB3B, // bright yellow
  cannon: 0xFF1744, // red
  slow:   0x448AFF, // blue
};

// T2 deeper colors
export const TOWER_COLORS_T2: Record<TowerType, number> = {
  archer: 0xFFC107, // deep gold
  cannon: 0xD50000, // deep red
  slow:   0x1565C0, // deep blue
};

export const TOWER_STATS: Record<TowerType, { dmg: number[]; range: number[]; speed: number[]; special?: string; slowPct?: number[] }> = {
  archer: { dmg: [5, 12, 30], range: [3, 3, 4], speed: [1.0, 0.8, 0.5] },
  cannon: { dmg: [15, 35, 80], range: [2, 2, 3], speed: [2.0, 1.5, 1.0], special: 'aoe' },
  slow:   { dmg: [2, 5, 10],   range: [2, 3, 3], speed: [1.0, 0.8, 0.5], special: 'slow', slowPct: [30, 50, 70] },
};

export const TIER_SIZES = [30, 45, 60];

// Enemy types — all achromatic (무채색)
export const ENEMY_STATS = {
  goblin: { hp: 30, speed: 100, color: 0x9E9E9E, radius: 10, shape: 'circle' as const },   // grey
  wolf:   { hp: 15, speed: 180, color: 0x424242, radius: 10, shape: 'triangle' as const }, // dark grey
  troll:  { hp: 120, speed: 50, color: 0xF5F5F5, radius: 16, shape: 'circle' as const },   // bleach white
};

export type EnemyType = keyof typeof ENEMY_STATS;

// HUD
export const HUD_HEIGHT = 50;
export const PANEL_HEIGHT = 100;
export const PANEL_Y = GAME_HEIGHT - PANEL_HEIGHT;

// Phases
export const BUILD_TIME = 30;
export const TOTAL_ENEMIES = 30;

// Projectile
export const PROJECTILE_SPEED = 400;
export const PROJECTILE_RADIUS = 4;
export const AOE_RADIUS = 50;
