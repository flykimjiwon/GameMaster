// Re-export shared constants for client use
export {
  GRID_SIZE,
  PLACEMENT_TIME,
  BATTLE_TIME,
  BASE_HP,
  BASE_X,
  BASE_Y,
  ENTRY_Y,
  PLACEMENT_ROW_MIN,
  PLACEMENT_ROW_MAX,
  DEFAULT_MATERIALS,
  TOWER_STATS,
  UNIT_STATS,
  PLAYER_COLORS,
  PLAYER_COLOR_NAMES,
} from "../../../shared/types";

// Client-only rendering constants
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Placement scene
export const PLACEMENT_CELL_SIZE = 50;
export const PLACEMENT_GRID_X = 60;
export const PLACEMENT_GRID_Y = 80;
export const PALETTE_X = 620;
export const PALETTE_Y = 80;

// Battle scene
export const BATTLE_CELL_SIZE = 34;
export const BATTLE_LEFT_X = 30;
export const BATTLE_RIGHT_X = 660;
export const BATTLE_GRID_Y = 80;
export const BATTLE_GAP = 20;

// UI
export const FONT_FAMILY = "monospace";
export const UI_BG_COLOR = 0x1a1a2e;
export const UI_PANEL_COLOR = 0x16213e;
export const UI_ACCENT_COLOR = 0x0f3460;
export const UI_TEXT_COLOR = "#e0e0e0";
export const UI_HIGHLIGHT_COLOR = "#00ff88";
export const UI_DANGER_COLOR = "#ff4444";
