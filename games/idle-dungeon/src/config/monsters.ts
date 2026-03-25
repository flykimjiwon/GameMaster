export type MonsterType = 'slime' | 'golem' | 'ghost' | 'dragon' | 'vampire';

export interface MonsterBaseStats {
  atk: number;
  hp: number;
  spd: number;
  def: number;
}

export interface MonsterConfig {
  type: MonsterType;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  gemCost: number;
  baseStats: MonsterBaseStats;
  specialty: string;
  color: string;
}

export const MONSTER_CONFIGS: Record<MonsterType, MonsterConfig> = {
  slime: {
    type: 'slime',
    name: 'Slime',
    emoji: '🟢',
    description: 'Explores rooms faster. Ideal for map clearing.',
    cost: 10,
    gemCost: 0,
    baseStats: { atk: 5, hp: 20, spd: 2, def: 2 },
    specialty: 'Exploration specialist — finds rooms 50% faster',
    color: '#44ff44',
  },
  golem: {
    type: 'golem',
    name: 'Golem',
    emoji: '🪨',
    description: 'Tanky fighter with massive damage output.',
    cost: 50,
    gemCost: 0,
    baseStats: { atk: 15, hp: 50, spd: 0.5, def: 10 },
    specialty: 'Combat specialist — +30% damage vs enemies',
    color: '#aaaaaa',
  },
  ghost: {
    type: 'ghost',
    name: 'Ghost',
    emoji: '👻',
    description: 'Blazing speed. Phases through obstacles.',
    cost: 30,
    gemCost: 0,
    baseStats: { atk: 8, hp: 15, spd: 3, def: 1 },
    specialty: 'Speed specialist — moves 3× faster than average',
    color: '#ccccff',
  },
  dragon: {
    type: 'dragon',
    name: 'Dragon',
    emoji: '🐉',
    description: 'Legendary beast that destroys boss floors.',
    cost: 200,
    gemCost: 0,
    baseStats: { atk: 25, hp: 40, spd: 1, def: 5 },
    specialty: 'Boss killer — +100% damage vs bosses',
    color: '#ff6600',
  },
  vampire: {
    type: 'vampire',
    name: 'Vampire',
    emoji: '🧛',
    description: 'Sustains itself by draining enemy life.',
    cost: 100,
    gemCost: 0,
    baseStats: { atk: 12, hp: 30, spd: 1.5, def: 3 },
    specialty: 'Lifesteal — heals 30% of damage dealt',
    color: '#cc0066',
  },
};

export const MONSTER_TYPES: MonsterType[] = ['slime', 'golem', 'ghost', 'dragon', 'vampire'];

export const GRADE_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
};

export const GRADE_LABELS: Record<number, string> = {
  1: '★',
  2: '★★',
  3: '★★★',
  4: '★★★★',
  5: '★★★★★',
};

export const GRADE_COLORS: Record<number, string> = {
  1: '#aaaaaa',
  2: '#44ff44',
  3: '#4499ff',
  4: '#cc33ff',
  5: '#ffd700',
};
