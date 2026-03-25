export const GRID_COLS = 6;
export const GRID_ROWS = 6;
export const TILE_SIZE = 80;
export const TILE_GAP = 4;

export const GAME_WIDTH = 600;
export const GAME_HEIGHT = 800;

export const GRID_OFFSET_X = (GAME_WIDTH - (GRID_COLS * (TILE_SIZE + TILE_GAP) - TILE_GAP)) / 2;
export const GRID_OFFSET_Y = (GAME_HEIGHT - (GRID_ROWS * (TILE_SIZE + TILE_GAP) - TILE_GAP)) / 2 + 30;

export const NUMBER_COLORS: Record<number, number> = {
  1: 0xFF4444,
  2: 0xFF8844,
  3: 0xFFCC44,
  4: 0x44DD44,
  5: 0x44CCCC,
  6: 0x4488FF,
  7: 0x6644FF,
  8: 0xAA44FF,
  9: 0xFF44AA,
};

export function getComboMultiplier(chain: number): number {
  return chain <= 1 ? 1 : Math.pow(2, chain - 1);
}
