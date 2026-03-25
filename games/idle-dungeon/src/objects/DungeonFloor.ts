import { Map as ROTMap } from 'rot-js';
import {
  FloorConfig,
  getFloorConfig,
  DUNGEON_WIDTH,
  DUNGEON_HEIGHT,
  ENEMY_POOL,
  BOSS_POOL,
  EnemyTemplate,
} from '../config/dungeon';
import { Decimal, decimalFromNumber } from '../systems/BigNumber';

export interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
  centerX: number;
  centerY: number;
  type: 'normal' | 'treasure' | 'boss' | 'empty';
  explored: boolean;
}

export interface DungeonEnemy {
  name: string;
  emoji: string;
  hp: Decimal;
  maxHp: Decimal;
  atk: Decimal;
  def: Decimal;
  isBoss: boolean;
}

export type TileType = 0 | 1; // 0 = floor, 1 = wall

export class DungeonFloor {
  floorNumber: number;
  config: FloorConfig;
  tiles: TileType[][];
  rooms: Room[];
  width: number;
  height: number;
  generated: boolean;

  constructor(floorNumber: number) {
    this.floorNumber = floorNumber;
    this.config = getFloorConfig(floorNumber);
    this.width = DUNGEON_WIDTH;
    this.height = DUNGEON_HEIGHT;
    this.tiles = [];
    this.rooms = [];
    this.generated = false;
  }

  generate(): void {
    // Init all tiles as walls
    this.tiles = Array.from({ length: this.height }, () =>
      new Array<TileType>(this.width).fill(1)
    );

    // Use rot-js Digger for dungeon generation
    const digger = new ROTMap.Digger(this.width, this.height, {
      roomWidth: [3, 8],
      roomHeight: [3, 6],
      corridorLength: [2, 6],
      dugPercentage: 0.3,
    });

    digger.create((x: number, y: number, value: number) => {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        this.tiles[y][x] = value as TileType;
      }
    });

    // Extract rooms from rot-js
    const rotRooms = digger.getRooms();
    this.rooms = [];

    rotRooms.forEach((rotRoom, i) => {
      const x = rotRoom.getLeft();
      const y = rotRoom.getTop();
      const w = rotRoom.getRight() - rotRoom.getLeft() + 1;
      const h = rotRoom.getBottom() - rotRoom.getTop() + 1;

      let roomType: Room['type'] = 'normal';
      if (i === rotRooms.length - 1 && this.config.isBossFloor) {
        roomType = 'boss';
      } else if (Math.random() < 0.3) {
        roomType = 'treasure';
      }

      this.rooms.push({
        x, y, w, h,
        centerX: Math.floor(x + w / 2),
        centerY: Math.floor(y + h / 2),
        type: roomType,
        explored: false,
      });
    });

    // Ensure at least a few rooms
    if (this.rooms.length === 0) {
      this._addFallbackRoom();
    }

    // Cap rooms per floor config
    if (this.rooms.length > this.config.roomCount) {
      this.rooms = this.rooms.slice(0, this.config.roomCount);
    }

    this.generated = true;
  }

  private _addFallbackRoom(): void {
    const cx = Math.floor(this.width / 2);
    const cy = Math.floor(this.height / 2);
    // Carve a simple room manually
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          this.tiles[ny][nx] = 0;
        }
      }
    }
    this.rooms.push({
      x: cx - 3, y: cy - 3, w: 7, h: 7,
      centerX: cx, centerY: cy,
      type: 'normal',
      explored: false,
    });
  }

  getEnemyForRoom(room: Room): DungeonEnemy | null {
    // 40% chance of enemy in normal rooms, 100% in boss rooms
    const chance = room.type === 'boss' ? 1.0 : room.type === 'treasure' ? 0.1 : 0.4;
    if (Math.random() > chance) return null;

    const cfg = this.config;
    let template: EnemyTemplate;

    if (room.type === 'boss') {
      template = BOSS_POOL[Math.floor(Math.random() * BOSS_POOL.length)];
    } else {
      template = ENEMY_POOL[Math.floor(Math.random() * ENEMY_POOL.length)];
    }

    const hp = decimalFromNumber(Math.floor(cfg.enemyHp * template.hpMult));
    const atk = decimalFromNumber(Math.floor(cfg.enemyAtk * template.atkMult));
    const def = decimalFromNumber(Math.floor(cfg.enemyDef * template.defMult));

    return {
      name: template.name,
      emoji: template.emoji,
      hp,
      maxHp: hp,
      atk,
      def,
      isBoss: room.type === 'boss',
    };
  }

  getTreasureValue(room: Room): Decimal {
    const base = this.config.treasureBase;
    const mult = room.type === 'boss' ? 10 : room.type === 'treasure' ? 3 : 1;
    const variance = 0.8 + Math.random() * 0.4;
    return decimalFromNumber(Math.floor(base * mult * variance));
  }
}
