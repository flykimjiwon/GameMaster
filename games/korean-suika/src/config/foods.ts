export interface FoodDef {
  level: number;
  name: string;
  emoji: string;
  radius: number;
  color: number;
  score: number;
}

export const FOODS: FoodDef[] = [
  { level: 0, name: '떡',       emoji: '🍡', radius: 20,  color: 0xf8c8dc, score: 1 },
  { level: 1, name: '김밥',     emoji: '🍙', radius: 28,  color: 0x4a7c59, score: 3 },
  { level: 2, name: '라면',     emoji: '🍜', radius: 36,  color: 0xe85d04, score: 6 },
  { level: 3, name: '치킨',     emoji: '🍗', radius: 44,  color: 0xd4a017, score: 10 },
  { level: 4, name: '피자',     emoji: '🍕', radius: 52,  color: 0xcc5803, score: 15 },
  { level: 5, name: '삼겹살',   emoji: '🥩', radius: 62,  color: 0xb5446e, score: 21 },
  { level: 6, name: '한우',     emoji: '🥓', radius: 74,  color: 0x8b0000, score: 28 },
  { level: 7, name: '한상차림', emoji: '🍱', radius: 88,  color: 0xffd700, score: 50 },
];

export const DROP_FOODS_MAX_LEVEL = 4; // 드롭 시 최대 레벨 (피자까지)

export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;
export const CONTAINER_X = 200;
export const CONTAINER_WIDTH = 340;
export const CONTAINER_HEIGHT = 500;
export const CONTAINER_TOP = 130;
export const CONTAINER_BOTTOM = CONTAINER_TOP + CONTAINER_HEIGHT;
export const WALL_THICKNESS = 12;
export const DEADLINE_Y = CONTAINER_TOP + 40;
