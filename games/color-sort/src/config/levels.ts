export interface LevelDef {
  colors: number;
  tubes: number;      // total tubes (colors + empty)
  emptyTubes: number;
  ballsPerTube: number;
}

export function getLevelDef(level: number): LevelDef {
  const ballsPerTube = 4;

  if (level <= 5) {
    return { colors: 3, tubes: 5, emptyTubes: 2, ballsPerTube };
  } else if (level <= 10) {
    return { colors: 4, tubes: 6, emptyTubes: 2, ballsPerTube };
  } else if (level <= 20) {
    return { colors: 5, tubes: 7, emptyTubes: 2, ballsPerTube };
  } else if (level <= 30) {
    return { colors: 6, tubes: 8, emptyTubes: 2, ballsPerTube };
  } else if (level <= 40) {
    return { colors: 7, tubes: 9, emptyTubes: 2, ballsPerTube };
  } else {
    return { colors: 8, tubes: 10, emptyTubes: 2, ballsPerTube };
  }
}

// 12 distinguishable colors
export const COLOR_PALETTE: number[] = [
  0xe74c3c, // red
  0x3498db, // blue
  0x2ecc71, // green
  0xf1c40f, // yellow
  0x9b59b6, // purple
  0xe67e22, // orange
  0x1abc9c, // teal
  0xe84393, // pink
  0x00cec9, // cyan
  0x6c5ce7, // indigo
  0xfdcb6e, // gold
  0x636e72, // gray
];

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 720;
export const TUBE_WIDTH = 40;
export const TUBE_HEIGHT = 160;
export const BALL_RADIUS = 16;
export const BALL_SPACING = 36;
export const MAX_LEVEL = 100;
