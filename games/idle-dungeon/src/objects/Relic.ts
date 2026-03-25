import { RelicConfig, RelicRarity, RARITY_COLORS, RARITY_WEIGHTS, RELIC_POOL } from '../config/relics';

let nextRelicId = 1;

export class Relic {
  instanceId: number;
  config: RelicConfig;

  constructor(config: RelicConfig) {
    this.instanceId = nextRelicId++;
    this.config = config;
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  get description(): string {
    return this.config.description;
  }

  get rarity(): RelicRarity {
    return this.config.rarity;
  }

  get color(): string {
    return RARITY_COLORS[this.config.rarity];
  }

  get emoji(): string {
    return this.config.emoji;
  }

  get bonusPercent(): string {
    const pct = Math.round((this.config.multiplier - 1) * 100);
    return `+${pct}%`;
  }

  toJSON(): object {
    return { instanceId: this.instanceId, configId: this.config.id };
  }

  static fromJSON(data: Record<string, unknown>): Relic | null {
    const cfg = RELIC_POOL.find(r => r.id === data['configId']);
    if (!cfg) return null;
    const relic = new Relic(cfg);
    relic.instanceId = data['instanceId'] as number;
    if (relic.instanceId >= nextRelicId) nextRelicId = relic.instanceId + 1;
    return relic;
  }
}

export function rollRelic(): Relic {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;

  let chosenRarity: RelicRarity = 'common';
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    rand -= weight;
    if (rand <= 0) {
      chosenRarity = rarity as RelicRarity;
      break;
    }
  }

  const pool = RELIC_POOL.filter(r => r.rarity === chosenRarity);
  const config = pool[Math.floor(Math.random() * pool.length)];
  return new Relic(config);
}
