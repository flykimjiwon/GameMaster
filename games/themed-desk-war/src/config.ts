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
  COLOR: 0x00ff88,
} as const;

export const ENEMY_CONFIG = {
  slime: { hp: 10, speed: 80, damage: 5, xp: 1, radius: 12, color: 0xff4444 },
  bat: { hp: 5, speed: 150, damage: 3, xp: 1, radius: 10, color: 0xaa44ff },
  golem: { hp: 50, speed: 40, damage: 15, xp: 5, size: 28, color: 0x888888 },
} as const;

export const BOSS_CONFIG = {
  hp: 300,
  speed: 60,
  damage: 20,
  radius: 40,
  color: 0xff0000,
  splitThreshold: 0.5,
  splitCount: 5,
} as const;

export const WEAPON_CONFIG = {
  orb: {
    radius: 8,
    damage: 10,
    orbitRadius: 60,
    rotationSpeed: 180, // degrees per second
    color: 0xffffff,
  },
  lightning: {
    damage: 20,
    interval: 2000, // ms
    color: 0xffff00,
  },
} as const;

export const XP_CONFIG = {
  baseRequired: 10, // xp needed = baseRequired * level
  gemRadius: 6,
  gemColor: 0x4488ff,
} as const;

export type EnemyType = 'slime' | 'bat' | 'golem';
