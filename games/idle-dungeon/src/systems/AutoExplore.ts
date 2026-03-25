import { DungeonFloor, Room, DungeonEnemy } from '../objects/DungeonFloor';
import { GameState } from './GameState';
import { Decimal, decimalFromNumber, formatDecimal } from './BigNumber';
import { rollRelic } from '../objects/Relic';
import { EXPLORE_TICK_MS } from '../config/dungeon';
import { Monster } from '../objects/Monster';
import { MONSTER_CONFIGS } from '../config/monsters';

export interface ExploreEvent {
  time: number;
  message: string;
  type: 'move' | 'combat' | 'treasure' | 'boss' | 'floor' | 'relic' | 'info';
  emoji: string;
}

export interface BattleState {
  active: boolean;
  enemy: DungeonEnemy | null;
  progress: number; // 0-100
}

export class AutoExplore {
  state: GameState;
  currentFloor: DungeonFloor;
  currentRoomIndex: number;
  roomProgress: number; // 0-100 to move to next room
  battle: BattleState;
  eventLog: ExploreEvent[];
  private _tickTimer: number | null = null;
  private _paused: boolean = false;

  onFloorChanged?: (floor: number) => void;
  onRoomChanged?: (roomIdx: number, progress: number) => void;
  onBattleUpdate?: (battle: BattleState) => void;
  onGoldChanged?: () => void;
  onRelicDropped?: (relicName: string) => void;
  onLogUpdated?: () => void;

  constructor(state: GameState) {
    this.state = state;
    this.currentRoomIndex = 0;
    this.roomProgress = 0;
    this.battle = { active: false, enemy: null, progress: 0 };
    this.eventLog = [];
    this.currentFloor = new DungeonFloor(state.currentFloor);
    this.currentFloor.generate();
    this._logEvent('info', '⚔️', `Floor ${state.currentFloor} — dungeon generated. ${this.currentFloor.rooms.length} rooms await.`);
  }

  start(): void {
    if (this._tickTimer !== null) return;
    this._tickTimer = window.setInterval(() => this._tick(), EXPLORE_TICK_MS);
  }

  stop(): void {
    if (this._tickTimer !== null) {
      clearInterval(this._tickTimer);
      this._tickTimer = null;
    }
  }

  pause(): void { this._paused = true; }
  resume(): void { this._paused = false; }

  private _tick(): void {
    if (this._paused) return;

    const deployed = this.state.getDeployedMonsters();
    if (deployed.length === 0) return;

    // Passive gold income
    const gps = this.state.goldPerSecond;
    if (gps > 0) {
      const passiveGold = decimalFromNumber(gps * EXPLORE_TICK_MS / 1000);
      this.state.addGold(passiveGold);
      if (this.onGoldChanged) this.onGoldChanged();
    }

    // Update play time
    this.state.stats.playTimeSeconds += EXPLORE_TICK_MS / 1000;

    if (this.battle.active) {
      this._tickBattle(deployed);
    } else {
      this._tickExploration(deployed);
    }
  }

  private _tickExploration(deployed: Monster[]): void {
    const partySpd = this.state.getPartySpd();
    // Progress rate: spd * 5 per tick (100ms), so spd=1 takes ~20 ticks = 2s per room
    const progressRate = partySpd * 5;
    this.roomProgress += progressRate;

    if (this.onRoomChanged) {
      this.onRoomChanged(this.currentRoomIndex, this.roomProgress);
    }

    if (this.roomProgress >= 100) {
      this.roomProgress = 0;
      this._enterRoom();
    }
  }

  private _enterRoom(): void {
    const rooms = this.currentFloor.rooms;
    if (this.currentRoomIndex >= rooms.length) {
      this._completeFloor();
      return;
    }

    const room = rooms[this.currentRoomIndex];
    room.explored = true;
    const roomLabel = `Room ${this.currentRoomIndex + 1}/${rooms.length}`;

    if (room.type === 'boss') {
      this._logEvent('boss', '👹', `${roomLabel}: BOSS CHAMBER! Preparing for battle...`);
    } else if (room.type === 'treasure') {
      this._logEvent('move', '🚪', `${roomLabel}: Discovered a treasure room!`);
    } else {
      this._logEvent('move', '🚶', `${roomLabel}: Exploring...`);
    }

    // Check for enemy
    const enemy = this.currentFloor.getEnemyForRoom(room);
    if (enemy) {
      this.battle = { active: true, enemy, progress: 0 };
      this._logEvent('combat', enemy.emoji, `${enemy.isBoss ? 'BOSS' : 'Enemy'} encountered: ${enemy.name}! HP: ${formatDecimal(enemy.maxHp)}`);
      if (this.onBattleUpdate) this.onBattleUpdate(this.battle);
    } else {
      // No enemy — collect treasure if any
      this._collectTreasure(room);
      this.currentRoomIndex++;
    }
  }

  private _tickBattle(deployed: Monster[]): void {
    if (!this.battle.enemy) return;

    const partyAtk = this.state.getPartyAtk();
    const enemy = this.battle.enemy;

    // Check for dragon bonus vs boss
    const hasDragon = deployed.some(m => m.type === 'dragon');
    const dragonBonus = hasDragon && enemy.isBoss ? 2.0 : 1.0;

    // Damage per tick
    const damagePerTick = partyAtk.mul(decimalFromNumber(dragonBonus * 0.1)); // 10% atk per tick

    // Vampire lifesteal
    const hasVampire = deployed.some(m => m.type === 'vampire');
    if (hasVampire) {
      const steal = damagePerTick.mul(decimalFromNumber(0.3));
      deployed.forEach(m => {
        if (m.type === 'vampire') {
          m.stats.hp = Decimal.min(m.stats.hp.add(steal), m.stats.maxHp);
        }
      });
    }

    enemy.hp = Decimal.max(decimalFromNumber(0), enemy.hp.sub(damagePerTick));
    this.battle.progress = Math.min(100, (1 - enemy.hp.div(enemy.maxHp).toNumber()) * 100);

    if (this.onBattleUpdate) this.onBattleUpdate(this.battle);

    if (enemy.hp.lte(decimalFromNumber(0))) {
      this._defeatEnemy(enemy);
    }
  }

  private _defeatEnemy(enemy: DungeonEnemy): void {
    this.state.stats.totalKills++;
    if (enemy.isBoss) this.state.stats.bossesDefeated++;

    // Gold reward from kill
    const goldMult = this.state.getRelicMultiplier('gold');
    const baseGold = decimalFromNumber(this.currentFloor.config.treasureBase * 2 * goldMult);
    this.state.addGold(baseGold);
    if (this.onGoldChanged) this.onGoldChanged();

    // Gems from bosses
    if (enemy.isBoss) {
      const gemReward = Math.ceil(this.state.currentFloor / 10);
      this.state.addGems(gemReward);
      this._logEvent('boss', '💎', `BOSS defeated! +${gemReward} Gems, +${formatDecimal(baseGold)} Gold`);

      // Relic drop every 10 floors
      if (this.state.currentFloor % 10 === 0) {
        const relic = rollRelic();
        this.state.addRelic(relic);
        this._logEvent('relic', relic.emoji, `Relic dropped: [${relic.name}] ${relic.description}`);
        if (this.onRelicDropped) this.onRelicDropped(relic.name);
      }
    } else {
      this._logEvent('combat', '⚔️', `${enemy.name} defeated! +${formatDecimal(baseGold)} Gold`);
    }

    // Heal slimes after combat
    this.state.getDeployedMonsters().forEach(m => {
      if (m.type === 'slime') m.heal();
    });

    this.battle = { active: false, enemy: null, progress: 0 };
    if (this.onBattleUpdate) this.onBattleUpdate(this.battle);

    // Collect treasure for the room
    const room = this.currentFloor.rooms[this.currentRoomIndex];
    if (room) this._collectTreasure(room);
    this.currentRoomIndex++;
  }

  private _collectTreasure(room: Room): void {
    const goldMult = this.state.getRelicMultiplier('gold');
    const treasure = this.currentFloor.getTreasureValue(room).mul(decimalFromNumber(goldMult));

    if (treasure.gt(decimalFromNumber(0))) {
      this.state.addGold(treasure);
      if (this.onGoldChanged) this.onGoldChanged();

      if (room.type === 'treasure') {
        this._logEvent('treasure', '💰', `Treasure chest! +${formatDecimal(treasure)} Gold`);
      } else if (treasure.gt(decimalFromNumber(this.currentFloor.config.treasureBase))) {
        this._logEvent('treasure', '🪙', `Found gold: +${formatDecimal(treasure)}`);
      }
    }
  }

  private _completeFloor(): void {
    this.state.stats.totalFloorsExplored++;
    this._logEvent('floor', '🏆', `Floor ${this.state.currentFloor} cleared! Descending...`);

    this.state.currentFloor++;
    this.currentRoomIndex = 0;
    this.roomProgress = 0;
    this.battle = { active: false, enemy: null, progress: 0 };

    this.currentFloor = new DungeonFloor(this.state.currentFloor);
    this.currentFloor.generate();

    this._logEvent('floor', '⬇️', `Floor ${this.state.currentFloor} — ${this.currentFloor.rooms.length} rooms. ${this.currentFloor.config.isBossFloor ? 'BOSS FLOOR!' : ''}`);

    if (this.onFloorChanged) this.onFloorChanged(this.state.currentFloor);
  }

  private _logEvent(type: ExploreEvent['type'], emoji: string, message: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    this.eventLog.unshift({
      time: Date.now(),
      message: `[${timeStr}] ${message}`,
      type,
      emoji,
    });
    // Keep last 50 events
    if (this.eventLog.length > 50) this.eventLog.pop();
    if (this.onLogUpdated) this.onLogUpdated();
  }

  getRecentLog(count = 20): ExploreEvent[] {
    return this.eventLog.slice(0, count);
  }

  jumpToFloor(floor: number): void {
    this.state.currentFloor = floor;
    this.currentRoomIndex = 0;
    this.roomProgress = 0;
    this.battle = { active: false, enemy: null, progress: 0 };
    this.currentFloor = new DungeonFloor(floor);
    this.currentFloor.generate();
    if (this.onFloorChanged) this.onFloorChanged(floor);
    this._logEvent('floor', '🌀', `Jumped to Floor ${floor}.`);
  }
}
