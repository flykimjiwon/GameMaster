// Server-authoritative balance constants — single source of truth
export {
  GRID_SIZE,
  PLACEMENT_TIME,
  BATTLE_TIME,
  BASE_HP,
  TICK_RATE_MS,
  SPAWN_INTERVAL,
  ENTRY_Y,
  BASE_Y,
  BASE_X,
  PLACEMENT_ROW_MIN,
  PLACEMENT_ROW_MAX,
  DEFAULT_MATERIALS,
  TOWER_STATS,
  UNIT_STATS,
  PLAYER_COLORS,
} from "../../../shared/types.js";

// Server-only constants
export const MAX_BATTLE_TICKS = 300;      // 30s at 10 ticks/s
export const SUDDEN_DEATH_WALL_INTERVAL = 10; // destroy a wall every N ticks
export const AOE_RADIUS = 1.5;           // cannon splash radius (cells)
export const SLOW_FACTOR = 0.5;          // slow tower speed multiplier
export const TANK_BUFF_RADIUS = 2;       // tank aura radius (cells)
export const TANK_BUFF_DEFENSE = 0.2;    // 20% damage reduction
