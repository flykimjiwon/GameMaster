export type RelicRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type RelicStat = 'atk' | 'hp' | 'spd' | 'def' | 'gold' | 'crit' | 'explore';

export interface RelicConfig {
  id: string;
  name: string;
  description: string;
  stat: RelicStat;
  multiplier: number;
  rarity: RelicRarity;
  emoji: string;
}

export const RARITY_COLORS: Record<RelicRarity, string> = {
  common: '#aaaaaa',
  rare: '#33ff33',
  epic: '#3399ff',
  legendary: '#cc33ff',
};

export const RARITY_WEIGHTS: Record<RelicRarity, number> = {
  common: 50,
  rare: 30,
  epic: 15,
  legendary: 5,
};

export const RELIC_POOL: RelicConfig[] = [
  {
    id: 'iron_fist',
    name: 'Iron Fist',
    description: 'Your monsters strike harder.',
    stat: 'atk',
    multiplier: 1.10,
    rarity: 'common',
    emoji: '👊',
  },
  {
    id: 'stone_skin',
    name: 'Stone Skin',
    description: 'Monsters shrug off blows.',
    stat: 'hp',
    multiplier: 1.25,
    rarity: 'common',
    emoji: '🛡️',
  },
  {
    id: 'swift_boots',
    name: 'Swift Boots',
    description: 'Exploration speed increased.',
    stat: 'spd',
    multiplier: 1.15,
    rarity: 'common',
    emoji: '👟',
  },
  {
    id: 'gold_magnet',
    name: 'Gold Magnet',
    description: 'Treasure chests yield more gold.',
    stat: 'gold',
    multiplier: 1.20,
    rarity: 'rare',
    emoji: '🧲',
  },
  {
    id: 'battle_drum',
    name: 'Battle Drum',
    description: 'War drums raise attack power.',
    stat: 'atk',
    multiplier: 1.20,
    rarity: 'rare',
    emoji: '🥁',
  },
  {
    id: 'elixir_vial',
    name: 'Elixir Vial',
    description: 'HP potions amplify max health.',
    stat: 'hp',
    multiplier: 1.40,
    rarity: 'rare',
    emoji: '⚗️',
  },
  {
    id: 'wind_charm',
    name: 'Wind Charm',
    description: 'Breezes carry your monsters faster.',
    stat: 'spd',
    multiplier: 1.30,
    rarity: 'rare',
    emoji: '🌀',
  },
  {
    id: 'dungeon_map',
    name: 'Ancient Map',
    description: 'Rooms are discovered 25% faster.',
    stat: 'explore',
    multiplier: 1.25,
    rarity: 'rare',
    emoji: '🗺️',
  },
  {
    id: 'sharp_blade',
    name: 'Sharp Blade',
    description: 'Critical hits deal triple damage.',
    stat: 'crit',
    multiplier: 1.05,
    rarity: 'epic',
    emoji: '⚔️',
  },
  {
    id: 'runic_armor',
    name: 'Runic Armor',
    description: 'Ancient runes greatly reinforce defense.',
    stat: 'def',
    multiplier: 1.50,
    rarity: 'epic',
    emoji: '🔮',
  },
  {
    id: 'thunder_crown',
    name: 'Thunder Crown',
    description: 'Lightning flows through your attacks.',
    stat: 'atk',
    multiplier: 1.40,
    rarity: 'epic',
    emoji: '👑',
  },
  {
    id: 'golden_chalice',
    name: 'Golden Chalice',
    description: 'Gold income increased substantially.',
    stat: 'gold',
    multiplier: 1.50,
    rarity: 'epic',
    emoji: '🏆',
  },
  {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    description: 'Risen from ash — all stats boosted.',
    stat: 'hp',
    multiplier: 2.0,
    rarity: 'legendary',
    emoji: '🔥',
  },
  {
    id: 'dragons_heart',
    name: "Dragon's Heart",
    description: 'The heart of a dragon beats in your monsters.',
    stat: 'atk',
    multiplier: 2.0,
    rarity: 'legendary',
    emoji: '❤️',
  },
  {
    id: 'time_crystal',
    name: 'Time Crystal',
    description: 'Time bends for your explorers.',
    stat: 'spd',
    multiplier: 2.0,
    rarity: 'legendary',
    emoji: '💎',
  },
];
