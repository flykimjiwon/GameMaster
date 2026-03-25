export type EnemyType = 'soldier' | 'archer' | 'shield' | 'boss';

export interface EnemySpec {
  type: EnemyType;
  nameKo: string;
  hp: number;
  speed: number;
  damage: number;         // damage to castle per hit
  reward: number;         // score reward on kill
  color: number;
  bodyColor: number;
  size: number;           // radius
  isBoss?: boolean;
  attackRange?: number;   // for archer: ranged attack range
  attackRate?: number;    // for archer: ms between attacks
  arrowDamage?: number;   // for archer: arrow damage
}

export const ENEMY_SPECS: Record<EnemyType, EnemySpec> = {
  soldier: {
    type: 'soldier',
    nameKo: '병사',
    hp: 50,
    speed: 80,
    damage: 10,
    reward: 10,
    color: 0x8B0000,
    bodyColor: 0xcc2222,
    size: 16,
  },
  archer: {
    type: 'archer',
    nameKo: '궁수',
    hp: 35,
    speed: 65,
    damage: 5,
    reward: 15,
    color: 0x556B2F,
    bodyColor: 0x6B8E23,
    size: 14,
    attackRange: 250,
    attackRate: 2000,
    arrowDamage: 8,
  },
  shield: {
    type: 'shield',
    nameKo: '방패병',
    hp: 150,
    speed: 45,
    damage: 20,
    reward: 25,
    color: 0x4a3728,
    bodyColor: 0x7a5c4a,
    size: 20,
  },
  boss: {
    type: 'boss',
    nameKo: '보스',
    hp: 500,
    speed: 35,
    damage: 40,
    reward: 100,
    color: 0x4B0082,
    bodyColor: 0x8B008B,
    size: 30,
    isBoss: true,
  },
};

export interface WaveConfig {
  wave: number;
  enemies: { type: EnemyType; count: number; spawnInterval: number }[];
  hpScale: number;
  speedScale: number;
}

export function generateWaveConfig(wave: number): WaveConfig {
  const isBossWave = wave % 5 === 0;
  const hpScale = 1 + (wave - 1) * 0.18;
  const speedScale = 1 + (wave - 1) * 0.05;

  if (isBossWave) {
    return {
      wave,
      enemies: [
        { type: 'soldier', count: Math.min(3 + wave, 12), spawnInterval: 1200 },
        { type: 'boss', count: 1, spawnInterval: 3000 },
      ],
      hpScale,
      speedScale,
    };
  }

  const enemies: WaveConfig['enemies'] = [];

  // Always have soldiers
  enemies.push({ type: 'soldier', count: 3 + wave * 2, spawnInterval: 1000 });

  // Archers from wave 2
  if (wave >= 2) {
    enemies.push({ type: 'archer', count: Math.floor(wave / 2), spawnInterval: 1500 });
  }

  // Shield from wave 3
  if (wave >= 3) {
    enemies.push({ type: 'shield', count: Math.floor(wave / 3), spawnInterval: 2000 });
  }

  return { wave, enemies, hpScale, speedScale };
}
