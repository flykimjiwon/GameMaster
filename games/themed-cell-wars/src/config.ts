export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  WORLD_WIDTH: 2000,
  WORLD_HEIGHT: 2000,
  GAME_DURATION: 180, // 3 minutes in seconds
} as const;

export const PLAYER_CONFIG = {
  HP: 100,
  SPEED: 200,
  RADIUS: 16,
  MAGNET_RANGE: 80,
  INVINCIBLE_DURATION: 500, // ms
  COLOR: 0xE8F4FD, // 백혈구 흰색
} as const;

export const ENEMY_CONFIG = {
  slime: { hp: 10, speed: 80,  damage: 5,  xp: 1, radius: 14, color: 0x39FF14 }, // 코로나 바이러스
  bat:   { hp: 5,  speed: 150, damage: 3,  xp: 1, radius: 8,  color: 0xFFD600 }, // 대장균
  golem: { hp: 50, speed: 40,  damage: 15, xp: 5, size: 32,   color: 0xFF1744 }, // 암세포
} as const;

export const BOSS_CONFIG = {
  hp: 300,
  speed: 60,
  damage: 20,
  radius: 48,
  color: 0xFF6D00, // 슈퍼박테리아
  splitThreshold: 0.5,
  splitCount: 5,
} as const;

export const WEAPON_CONFIG = {
  orb: {
    radius: 7,
    damage: 10,
    orbitRadius: 60,
    rotationSpeed: 180, // degrees per second
    color: 0xFFD740, // Y자 항체
  },
  lightning: {
    damage: 20,
    interval: 2000, // ms
    color: 0x7C4DFF, // 인터페론
  },
} as const;

export const XP_CONFIG = {
  baseRequired: 10, // xp needed = baseRequired * level
  gemRadius: 6,
  gemColor: 0x00E5FF, // 면역 에너지
} as const;

export type EnemyType = 'slime' | 'bat' | 'golem';
