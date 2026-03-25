// ── Tower Types ──
export type TowerType = "arrow" | "cannon" | "slow";
export type WallType = "wall";
export type PlaceableType = TowerType | WallType;

// ── Unit Types ──
export type UnitType = "infantry" | "archer" | "cavalry" | "tank";

// ── Tower Stats ──
export interface TowerStats {
  type: TowerType;
  name: string;
  damage: number;
  range: number;       // grid cells
  attackSpeed: number; // ticks between attacks
  hp: number;
  color: number;       // hex color for rendering
}

// ── Unit Stats ──
export interface UnitStats {
  type: UnitType;
  name: string;
  hp: number;
  speed: number;       // cells per tick
  damage: number;      // damage to base on arrival
  range: number;       // 0 = melee
  color: number;
}

// ── Material Counts (identical for both players) ──
export interface Materials {
  towers: Record<TowerType, number>;
  walls: number;
  units: Record<UnitType, number>;
}

// ── Placement Data (client → server) ──
export interface TowerPlacement {
  type: TowerType;
  gridX: number;
  gridY: number;
}

export interface WallPlacement {
  gridX: number;
  gridY: number;
}

export interface UnitOrder {
  type: UnitType;
  slot: number; // spawn order (0 = first)
}

export interface PlacementData {
  towers: TowerPlacement[];
  walls: WallPlacement[];
  units: UnitOrder[];
}

// ── Message Types (client ↔ server) ──
export type ClientMessage =
  | { type: "place_tower"; tower: TowerPlacement }
  | { type: "remove_tower"; gridX: number; gridY: number }
  | { type: "place_wall"; wall: WallPlacement }
  | { type: "remove_wall"; gridX: number; gridY: number }
  | { type: "set_units"; units: UnitOrder[] }
  | { type: "ready" }
  | { type: "rematch" };

export type ServerMessage =
  | { type: "placement_error"; message: string }
  | { type: "kill_feed"; killer: string; victim: string }
  | { type: "battle_event"; event: BattleEvent };

export type BattleEvent =
  | { kind: "tower_fire"; towerId: string; targetId: string }
  | { kind: "unit_died"; unitId: string }
  | { kind: "base_hit"; defenderId: string; damage: number }
  | { kind: "sudden_death" };

// ── Game Constants ──
export const GRID_SIZE = 10;
export const PLACEMENT_TIME = 60;   // seconds
export const BATTLE_TIME = 30;      // seconds
export const BASE_HP = 100;
export const TICK_RATE_MS = 100;    // 10 ticks/sec
export const SPAWN_INTERVAL = 5;    // ticks between unit spawns
export const ENTRY_Y = 0;           // units enter from top
export const BASE_Y = 9;            // base at bottom
export const BASE_X = 5;            // base center column
export const WIN_CONDITION_PERCENT = 0; // not used for territory, base-hp only

// Placement zone: rows 1-8 (row 0 = entry, row 9 = base)
export const PLACEMENT_ROW_MIN = 1;
export const PLACEMENT_ROW_MAX = 8;

// ── Default Materials ──
export const DEFAULT_MATERIALS: Materials = {
  towers: { arrow: 3, cannon: 2, slow: 2 },
  walls: 5,
  units: { infantry: 10, archer: 5, cavalry: 3, tank: 1 },
};

// ── Tower Stat Table ──
export const TOWER_STATS: Record<TowerType, TowerStats> = {
  arrow: {
    type: "arrow",
    name: "화살탑",
    damage: 8,
    range: 3,
    attackSpeed: 5,   // every 5 ticks (0.5s)
    hp: 50,
    color: 0x4caf50,
  },
  cannon: {
    type: "cannon",
    name: "대포",
    damage: 25,
    range: 2,
    attackSpeed: 10,  // every 10 ticks (1s)
    hp: 80,
    color: 0xf44336,
  },
  slow: {
    type: "slow",
    name: "슬로우탑",
    damage: 0,
    range: 2,
    attackSpeed: 1,   // constant effect
    hp: 40,
    color: 0x2196f3,
  },
};

// ── Unit Stat Table ──
export const UNIT_STATS: Record<UnitType, UnitStats> = {
  infantry: {
    type: "infantry",
    name: "보병",
    hp: 50,
    speed: 0.05,      // cells per tick
    damage: 8,
    range: 0,
    color: 0xff9800,
  },
  archer: {
    type: "archer",
    name: "궁수",
    hp: 30,
    speed: 0.07,
    damage: 12,
    range: 2,
    color: 0x9c27b0,
  },
  cavalry: {
    type: "cavalry",
    name: "기마",
    hp: 80,
    speed: 0.1,
    damage: 15,
    range: 0,
    color: 0xffeb3b,
  },
  tank: {
    type: "tank",
    name: "탱크",
    hp: 200,
    speed: 0.03,
    damage: 5,
    range: 0,
    color: 0x795548,
  },
};

// ── Player Colors ──
export const PLAYER_COLORS = [0x1e88e5, 0xe53935];
export const PLAYER_COLOR_NAMES = ["파랑", "빨강"];
