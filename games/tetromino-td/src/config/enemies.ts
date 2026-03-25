export interface EnemyConfig {
  type: EnemyType;
  hp: number;
  speed: number;   // cells per second
  reward: number;
  color: number;
  size: number;    // radius in pixels
}

export type EnemyType = 'basic' | 'fast' | 'tank' | 'boss';

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  basic: {
    type: 'basic',
    hp: 20,
    speed: 1.2,
    reward: 10,
    color: 0xee8844,
    size: 8,
  },
  fast: {
    type: 'fast',
    hp: 10,
    speed: 2.5,
    reward: 15,
    color: 0xee44ee,
    size: 6,
  },
  tank: {
    type: 'tank',
    hp: 80,
    speed: 0.6,
    reward: 30,
    color: 0xaaaaaa,
    size: 12,
  },
  boss: {
    type: 'boss',
    hp: 200,
    speed: 0.8,
    reward: 100,
    color: 0xff0000,
    size: 16,
  },
};

export interface WaveSpawn {
  type: EnemyType;
  count: number;
  delay: number; // seconds between spawns
}

export interface WaveConfig {
  wave: number;
  spawns: WaveSpawn[];
}

export function generateWave(waveNumber: number): WaveConfig {
  const spawns: WaveSpawn[] = [];

  const basicCount = 3 + waveNumber * 2;
  spawns.push({ type: 'basic', count: basicCount, delay: 1.2 });

  if (waveNumber >= 2) {
    spawns.push({ type: 'fast', count: Math.floor(waveNumber / 2), delay: 0.8 });
  }
  if (waveNumber >= 3) {
    spawns.push({ type: 'tank', count: Math.max(1, Math.floor(waveNumber / 3)), delay: 2.0 });
  }
  if (waveNumber % 5 === 0) {
    spawns.push({ type: 'boss', count: 1, delay: 0 });
  }

  return { wave: waveNumber, spawns };
}
