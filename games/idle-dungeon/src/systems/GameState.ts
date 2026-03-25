import localforage from 'localforage';
import LZString from 'lz-string';
import { Decimal, decimalFromNumber, formatDecimal } from './BigNumber';
import { Monster } from '../objects/Monster';
import { Relic } from '../objects/Relic';
import { RELIC_POOL } from '../config/relics';
import { RelicStat } from '../config/relics';
import { AUTOSAVE_INTERVAL } from '../config/dungeon';

const SAVE_KEY = 'idle_dungeon_save';

export interface GameStats {
  totalFloorsExplored: number;
  totalKills: number;
  totalGoldEarned: Decimal;
  playTimeSeconds: number;
  strongestMonsterName: string;
  strongestMonsterAtk: Decimal;
  bossesDefeated: number;
  relicsFound: number;
}

export interface GameStateData {
  gold: Decimal;
  gems: number;
  currentFloor: number;
  monsters: Monster[];
  relics: Relic[];
  stats: GameStats;
  lastSaveTime: number;
  lastPlayTime: number;
}

export class GameState {
  gold: Decimal;
  gems: number;
  currentFloor: number;
  monsters: Monster[];
  relics: Relic[];
  stats: GameStats;
  lastSaveTime: number;
  lastPlayTime: number;
  private _autosaveTimer: number | null = null;
  onSave?: () => void;

  constructor() {
    this.gold = decimalFromNumber(50);
    this.gems = 0;
    this.currentFloor = 1;
    this.monsters = [];
    this.relics = [];
    this.lastSaveTime = Date.now();
    this.lastPlayTime = Date.now();
    this.stats = {
      totalFloorsExplored: 0,
      totalKills: 0,
      totalGoldEarned: decimalFromNumber(0),
      playTimeSeconds: 0,
      strongestMonsterName: 'None',
      strongestMonsterAtk: decimalFromNumber(0),
      bossesDefeated: 0,
      relicsFound: 0,
    };
  }

  get goldPerSecond(): number {
    const deployedCount = this.monsters.filter(m => m.deployed).length;
    if (deployedCount === 0) return 0;
    const baseGps = this.currentFloor * 0.2 * deployedCount;
    return baseGps * this.getRelicMultiplier('gold');
  }

  getRelicMultiplier(stat: RelicStat): number {
    return this.relics.reduce((mult, relic) => {
      if (relic.config.stat === stat) return mult * relic.config.multiplier;
      return mult;
    }, 1);
  }

  addGold(amount: Decimal): void {
    this.gold = this.gold.add(amount);
    this.stats.totalGoldEarned = this.stats.totalGoldEarned.add(amount);
  }

  spendGold(amount: Decimal): boolean {
    if (this.gold.lt(amount)) return false;
    this.gold = this.gold.sub(amount);
    return true;
  }

  addGems(n: number): void {
    this.gems += n;
  }

  addMonster(monster: Monster): void {
    this.monsters.push(monster);
    this._updateStrongest();
  }

  removeMonsters(ids: number[]): void {
    this.monsters = this.monsters.filter(m => !ids.includes(m.id));
  }

  addRelic(relic: Relic): void {
    this.relics.push(relic);
    this.stats.relicsFound++;
  }

  getDeployedMonsters(): Monster[] {
    return this.monsters.filter(m => m.deployed);
  }

  getPartyAtk(): Decimal {
    const deployed = this.getDeployedMonsters();
    if (deployed.length === 0) return decimalFromNumber(1);
    return deployed.reduce((sum, m) => sum.add(m.stats.atk), decimalFromNumber(0))
      .mul(decimalFromNumber(this.getRelicMultiplier('atk')));
  }

  getPartySpd(): number {
    const deployed = this.getDeployedMonsters();
    if (deployed.length === 0) return 1;
    const avgSpd = deployed.reduce((sum, m) => sum + m.stats.spd.toNumber(), 0) / deployed.length;
    return avgSpd * this.getRelicMultiplier('spd') * this.getRelicMultiplier('explore');
  }

  private _updateStrongest(): void {
    for (const m of this.monsters) {
      if (m.stats.atk.gt(this.stats.strongestMonsterAtk)) {
        this.stats.strongestMonsterAtk = m.stats.atk;
        this.stats.strongestMonsterName = `${m.emoji} ${m.name} Lv${m.level} ${m.gradeLabel}`;
      }
    }
  }

  startAutosave(): void {
    if (this._autosaveTimer !== null) return;
    this._autosaveTimer = window.setInterval(() => {
      this.save().catch(console.error);
    }, AUTOSAVE_INTERVAL);
  }

  stopAutosave(): void {
    if (this._autosaveTimer !== null) {
      clearInterval(this._autosaveTimer);
      this._autosaveTimer = null;
    }
  }

  async save(): Promise<void> {
    try {
      const data = {
        gold: this.gold.toString(),
        gems: this.gems,
        currentFloor: this.currentFloor,
        monsters: this.monsters.map(m => m.toJSON()),
        relics: this.relics.map(r => r.toJSON()),
        stats: {
          ...this.stats,
          totalGoldEarned: this.stats.totalGoldEarned.toString(),
          strongestMonsterAtk: this.stats.strongestMonsterAtk.toString(),
        },
        lastSaveTime: Date.now(),
        lastPlayTime: this.lastPlayTime,
      };
      const json = JSON.stringify(data);
      const compressed = LZString.compressToUTF16(json);
      await localforage.setItem(SAVE_KEY, compressed);
      this.lastSaveTime = data.lastSaveTime;
      if (this.onSave) this.onSave();
    } catch (err) {
      console.error('Save failed:', err);
    }
  }

  async load(): Promise<boolean> {
    try {
      const compressed = await localforage.getItem<string>(SAVE_KEY);
      if (!compressed) return false;

      const json = LZString.decompressFromUTF16(compressed);
      if (!json) return false;

      const data = JSON.parse(json) as Record<string, unknown>;

      this.gold = new Decimal(data['gold'] as string);
      this.gems = data['gems'] as number;
      this.currentFloor = data['currentFloor'] as number;
      this.lastSaveTime = data['lastSaveTime'] as number;
      this.lastPlayTime = (data['lastPlayTime'] as number) || Date.now();

      const monstersData = data['monsters'] as Array<Record<string, unknown>>;
      this.monsters = monstersData.map(m => Monster.fromJSON(m));

      const relicsData = data['relics'] as Array<Record<string, unknown>>;
      this.relics = relicsData
        .map(r => Relic.fromJSON(r))
        .filter((r): r is Relic => r !== null);

      const statsData = data['stats'] as Record<string, unknown>;
      this.stats = {
        totalFloorsExplored: statsData['totalFloorsExplored'] as number,
        totalKills: statsData['totalKills'] as number,
        totalGoldEarned: new Decimal(statsData['totalGoldEarned'] as string),
        playTimeSeconds: statsData['playTimeSeconds'] as number,
        strongestMonsterName: statsData['strongestMonsterName'] as string,
        strongestMonsterAtk: new Decimal(statsData['strongestMonsterAtk'] as string),
        bossesDefeated: (statsData['bossesDefeated'] as number) || 0,
        relicsFound: (statsData['relicsFound'] as number) || 0,
      };

      return true;
    } catch (err) {
      console.error('Load failed:', err);
      return false;
    }
  }

  async hasSave(): Promise<boolean> {
    const compressed = await localforage.getItem<string>(SAVE_KEY);
    return compressed !== null;
  }

  async deleteSave(): Promise<void> {
    await localforage.removeItem(SAVE_KEY);
  }
}

// Singleton
export const gameState = new GameState();
