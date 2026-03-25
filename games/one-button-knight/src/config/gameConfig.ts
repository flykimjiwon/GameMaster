export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

export const HOLD_THRESHOLDS = {
  ATTACK: 200,   // < 200ms = attack
  JUMP: 500,     // 200–500ms = jump
  // > 500ms = dash
};

export const KNIGHT = {
  RUN_SPEED: 220,
  JUMP_VELOCITY: -520,
  DASH_SPEED: 680,
  DASH_DURATION: 400,    // ms
  GRAVITY: 900,
  ATTACK_DURATION: 350,  // ms
  ATTACK_RANGE: 90,
  ATTACK_HEIGHT: 60,
};

export const COMBO = {
  WINDOW_MS: 1200,       // time between kills to maintain combo
  MULTIPLIERS: [1, 2, 3, 5, 8, 10],
};

export const SPAWNER = {
  BASE_INTERVAL: 2200,   // ms
  MIN_INTERVAL: 700,
  SPEED_SCALE: 0.0004,   // increase per meter
};

export const COLORS = {
  BG_SKY: 0x0a0a1a,
  BG_MOUNTAIN: 0x111128,
  BG_GROUND_STRIP: 0x181830,
  GROUND: 0x22223a,
  GROUND_LINE: 0x4444aa,
  KNIGHT: 0xffffff,
  KNIGHT_SWORD: 0xaaddff,
  SLASH: 0x88ccff,
  ENEMY_SOLDIER: 0xff4444,
  ENEMY_BIRD: 0xffaa22,
  ENEMY_SHIELD: 0x44ff88,
  HUD_TEXT: 0xffffff,
  COMBO_TEXT: 0xffdd44,
  GAUGE_BG: 0x222244,
  GAUGE_ATTACK: 0x4488ff,
  GAUGE_JUMP: 0x44ff88,
  GAUGE_DASH: 0xffaa22,
};
