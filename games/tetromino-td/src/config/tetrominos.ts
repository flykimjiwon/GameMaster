export type TowerType = 'fire' | 'ice' | 'poison' | 'lightning';

export const TOWER_COLORS: Record<TowerType, number> = {
  fire: 0xff3333,
  ice: 0x3399ff,
  poison: 0x33ff33,
  lightning: 0xffff33,
};

export const TOWER_COLOR_NAMES: Record<TowerType, string> = {
  fire: '#ff3333',
  ice: '#3399ff',
  poison: '#33ff33',
  lightning: '#ffff33',
};

export const TOWER_TYPES: TowerType[] = ['fire', 'ice', 'poison', 'lightning'];

// Each tetromino shape: array of rotation states, each rotation = array of [row, col] offsets
export interface TetrominoShape {
  name: string;
  rotations: number[][][]; // [rotationIndex][cellIndex][row, col]
}

export const TETROMINO_SHAPES: Record<string, TetrominoShape> = {
  I: {
    name: 'I',
    rotations: [
      [[0,0],[0,1],[0,2],[0,3]],
      [[0,0],[1,0],[2,0],[3,0]],
      [[0,0],[0,1],[0,2],[0,3]],
      [[0,0],[1,0],[2,0],[3,0]],
    ],
  },
  O: {
    name: 'O',
    rotations: [
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
    ],
  },
  T: {
    name: 'T',
    rotations: [
      [[0,0],[0,1],[0,2],[1,1]],
      [[0,0],[1,0],[2,0],[1,1]],
      [[1,0],[1,1],[1,2],[0,1]],
      [[0,1],[1,1],[2,1],[1,0]],
    ],
  },
  S: {
    name: 'S',
    rotations: [
      [[0,1],[0,2],[1,0],[1,1]],
      [[0,0],[1,0],[1,1],[2,1]],
      [[0,1],[0,2],[1,0],[1,1]],
      [[0,0],[1,0],[1,1],[2,1]],
    ],
  },
  Z: {
    name: 'Z',
    rotations: [
      [[0,0],[0,1],[1,1],[1,2]],
      [[0,1],[1,0],[1,1],[2,0]],
      [[0,0],[0,1],[1,1],[1,2]],
      [[0,1],[1,0],[1,1],[2,0]],
    ],
  },
  L: {
    name: 'L',
    rotations: [
      [[0,0],[1,0],[2,0],[2,1]],
      [[0,0],[0,1],[0,2],[1,0]],
      [[0,0],[0,1],[1,1],[2,1]],
      [[0,2],[1,0],[1,1],[1,2]],
    ],
  },
  J: {
    name: 'J',
    rotations: [
      [[0,1],[1,1],[2,0],[2,1]],
      [[0,0],[1,0],[1,1],[1,2]],
      [[0,0],[0,1],[1,0],[2,0]],
      [[0,0],[0,1],[0,2],[1,2]],
    ],
  },
};

export const TETROMINO_NAMES = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'] as const;
export type TetrominoName = typeof TETROMINO_NAMES[number];
