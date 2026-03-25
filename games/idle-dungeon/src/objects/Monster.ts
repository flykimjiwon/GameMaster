import { Decimal, formatDecimal, decimalFromNumber } from '../systems/BigNumber';
import {
  MonsterType,
  MONSTER_CONFIGS,
  GRADE_MULTIPLIERS,
  GRADE_LABELS,
  GRADE_COLORS,
} from '../config/monsters';
import { LEVEL_UP_STAT_BONUS, LEVEL_UP_COST_MULTIPLIER, MAX_GRADE } from '../config/dungeon';

let nextMonsterId = 1;

export interface MonsterStats {
  atk: Decimal;
  hp: Decimal;
  maxHp: Decimal;
  spd: Decimal;
  def: Decimal;
}

export class Monster {
  id: number;
  type: MonsterType;
  level: number;
  grade: number;
  deployed: boolean;
  stats: MonsterStats;

  constructor(type: MonsterType, level = 1, grade = 1) {
    this.id = nextMonsterId++;
    this.type = type;
    this.level = level;
    this.grade = Math.min(grade, MAX_GRADE);
    this.deployed = false;
    this.stats = this._calcStats();
  }

  private _calcStats(): MonsterStats {
    const base = MONSTER_CONFIGS[this.type].baseStats;
    const levelMult = Math.pow(1 + LEVEL_UP_STAT_BONUS, this.level - 1);
    const gradeMult = GRADE_MULTIPLIERS[this.grade];
    const total = levelMult * gradeMult;

    const atk = decimalFromNumber(base.atk * total);
    const maxHp = decimalFromNumber(base.hp * total);
    const spd = decimalFromNumber(base.spd * (1 + (this.level - 1) * 0.05) * gradeMult);
    const def = decimalFromNumber(base.def * total);

    return { atk, hp: maxHp, maxHp, spd, def };
  }

  levelUp(): void {
    this.level++;
    this.stats = this._calcStats();
  }

  getUpgradeCost(): Decimal {
    const base = MONSTER_CONFIGS[this.type].cost;
    const cost = base * Math.pow(LEVEL_UP_COST_MULTIPLIER, this.level - 1);
    return decimalFromNumber(cost);
  }

  getStatMultiplier(): number {
    return Math.pow(1 + LEVEL_UP_STAT_BONUS, this.level - 1) * GRADE_MULTIPLIERS[this.grade];
  }

  get gradeLabel(): string {
    return GRADE_LABELS[this.grade];
  }

  get gradeColor(): string {
    return GRADE_COLORS[this.grade];
  }

  get emoji(): string {
    return MONSTER_CONFIGS[this.type].emoji;
  }

  get name(): string {
    return MONSTER_CONFIGS[this.type].name;
  }

  get color(): string {
    return MONSTER_CONFIGS[this.type].color;
  }

  get atkDisplay(): string {
    return formatDecimal(this.stats.atk);
  }

  get hpDisplay(): string {
    return `${formatDecimal(this.stats.hp)}/${formatDecimal(this.stats.maxHp)}`;
  }

  get spdDisplay(): string {
    return this.stats.spd.toFixed(2);
  }

  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      level: this.level,
      grade: this.grade,
      deployed: this.deployed,
    };
  }

  static fromJSON(data: ReturnType<Monster['toJSON']> & Record<string, unknown>): Monster {
    const m = new Monster(data['type'] as MonsterType, data['level'] as number, data['grade'] as number);
    m.id = data['id'] as number;
    m.deployed = data['deployed'] as boolean;
    if (m.id >= nextMonsterId) nextMonsterId = m.id + 1;
    return m;
  }

  heal(): void {
    this.stats.hp = this.stats.maxHp;
  }
}
