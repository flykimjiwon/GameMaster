import { ArraySchema } from "@colyseus/schema";
import { TowerState, WallState, UnitState } from "../state/GameState.js";
import { findBestPath, buildBlockedSet } from "./PathValidator.js";
import {
  GRID_SIZE,
  TOWER_STATS,
  UNIT_STATS,
  SPAWN_INTERVAL,
  BASE_HP,
  BASE_X,
  BASE_Y,
  MAX_BATTLE_TICKS,
  AOE_RADIUS,
  SLOW_FACTOR,
  TANK_BUFF_RADIUS,
  TANK_BUFF_DEFENSE,
  SUDDEN_DEATH_WALL_INTERVAL,
} from "../config/balance.js";
import type {
  TowerPlacement,
  WallPlacement,
  UnitOrder,
  UnitType,
  BattleEvent,
} from "../../../shared/types.js";

interface InternalUnit {
  id: string;
  unitType: UnitType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  baseDamage: number;
  range: number;
  alive: boolean;
  attackerId: string;
  targetDefenderId: string;
  path: number[][];
  pathProgress: number; // float index along path
  spawned: boolean;
  spawnTick: number;
  schemaRef: UnitState;
}

interface InternalTower {
  id: string;
  towerType: string;
  gridX: number;
  gridY: number;
  hp: number;
  damage: number;
  range: number;
  attackSpeed: number;
  cooldown: number;
  defenderId: string;
  schemaRef: TowerState;
}

interface BattleSide {
  attackerId: string;
  defenderId: string;
  towers: InternalTower[];
  wallPositions: WallPlacement[];
  units: InternalUnit[];
  baseHp: number;
}

export interface BattleTickResult {
  events: BattleEvent[];
  finished: boolean;
  winnerId: string;
  p1BaseHp: number;
  p2BaseHp: number;
}

export class BattleSimulator {
  private sides: [BattleSide, BattleSide];
  private tick = 0;
  private suddenDeath = false;
  private events: BattleEvent[] = [];

  // Schema references for state sync
  private schemaTowers: ArraySchema<TowerState>;
  private schemaWalls: ArraySchema<WallState>;
  private schemaUnits: ArraySchema<UnitState>;

  constructor(
    p1Id: string,
    p2Id: string,
    p1Towers: TowerPlacement[],
    p1Walls: WallPlacement[],
    p1Units: UnitOrder[],
    p2Towers: TowerPlacement[],
    p2Walls: WallPlacement[],
    p2Units: UnitOrder[],
    schemaTowers: ArraySchema<TowerState>,
    schemaWalls: ArraySchema<WallState>,
    schemaUnits: ArraySchema<UnitState>
  ) {
    this.schemaTowers = schemaTowers;
    this.schemaWalls = schemaWalls;
    this.schemaUnits = schemaUnits;

    // Side 0: P1 attacks P2's defense
    const side0 = this.createSide(p1Id, p2Id, p2Towers, p2Walls, p1Units);
    // Side 1: P2 attacks P1's defense
    const side1 = this.createSide(p2Id, p1Id, p1Towers, p1Walls, p2Units);
    this.sides = [side0, side1];

    // Populate schema arrays for client sync
    this.syncSchemaInitial();
  }

  private createSide(
    attackerId: string,
    defenderId: string,
    defTowers: TowerPlacement[],
    defWalls: WallPlacement[],
    atkUnits: UnitOrder[]
  ): BattleSide {
    let towerId = 0;
    const towers: InternalTower[] = defTowers.map((t) => {
      const stats = TOWER_STATS[t.type];
      return {
        id: `t_${defenderId}_${towerId++}`,
        towerType: t.type,
        gridX: t.gridX,
        gridY: t.gridY,
        hp: stats.hp,
        damage: stats.damage,
        range: stats.range,
        attackSpeed: stats.attackSpeed,
        cooldown: 0,
        defenderId,
        schemaRef: new TowerState(),
      };
    });

    // Sort units by spawn order
    const sorted = [...atkUnits].sort((a, b) => a.slot - b.slot);
    let unitId = 0;
    const units: InternalUnit[] = sorted.map((u, idx) => {
      const stats = UNIT_STATS[u.type];
      // Calculate path for this unit
      const entryX = Math.min(
        GRID_SIZE - 1,
        Math.max(0, BASE_X + (idx % 3) - 1)
      );
      const path = findBestPath(defTowers, defWalls, entryX);

      return {
        id: `u_${attackerId}_${unitId++}`,
        unitType: u.type,
        x: path[0]?.[0] ?? BASE_X,
        y: path[0]?.[1] ?? 0,
        hp: stats.hp,
        maxHp: stats.hp,
        speed: stats.speed,
        baseDamage: stats.damage,
        range: stats.range,
        alive: true,
        attackerId,
        targetDefenderId: defenderId,
        path,
        pathProgress: 0,
        spawned: false,
        spawnTick: idx * SPAWN_INTERVAL,
        schemaRef: new UnitState(),
      };
    });

    return {
      attackerId,
      defenderId,
      towers,
      wallPositions: [...defWalls],
      units,
      baseHp: BASE_HP,
    };
  }

  private syncSchemaInitial(): void {
    // Clear arrays
    this.schemaTowers.splice(0, this.schemaTowers.length);
    this.schemaWalls.splice(0, this.schemaWalls.length);
    this.schemaUnits.splice(0, this.schemaUnits.length);

    for (const side of this.sides) {
      // Towers
      for (const t of side.towers) {
        const st = new TowerState();
        st.id = t.id;
        st.gridX = t.gridX;
        st.gridY = t.gridY;
        st.towerType = t.towerType;
        st.defenderId = t.defenderId;
        st.hp = t.hp;
        t.schemaRef = st;
        this.schemaTowers.push(st);
      }

      // Walls
      for (const w of side.wallPositions) {
        const sw = new WallState();
        sw.gridX = w.gridX;
        sw.gridY = w.gridY;
        sw.defenderId = side.defenderId;
        this.schemaWalls.push(sw);
      }

      // Units (hidden until spawned, but add to schema)
      for (const u of side.units) {
        const su = new UnitState();
        su.id = u.id;
        su.x = u.x;
        su.y = u.y;
        su.unitType = u.unitType;
        su.hp = u.hp;
        su.maxHp = u.maxHp;
        su.alive = false; // not spawned yet
        su.attackerId = u.attackerId;
        su.targetDefenderId = u.targetDefenderId;
        u.schemaRef = su;
        this.schemaUnits.push(su);
      }
    }
  }

  simulateTick(): BattleTickResult {
    this.tick++;
    this.events = [];

    // Sudden death: destroy walls periodically
    if (this.tick > MAX_BATTLE_TICKS && !this.suddenDeath) {
      this.suddenDeath = true;
      this.events.push({ kind: "sudden_death" });
    }
    if (this.suddenDeath && this.tick % SUDDEN_DEATH_WALL_INTERVAL === 0) {
      this.destroyRandomWall();
    }

    for (const side of this.sides) {
      this.spawnUnits(side);
      this.moveUnits(side);
      this.towerAttack(side);
      this.checkBaseReach(side);
    }

    // Sync to schema
    this.syncSchemaState();

    const finished = this.checkWinCondition();
    let winnerId = "";
    if (finished) {
      winnerId = this.determineWinner();
    }

    return {
      events: this.events,
      finished,
      winnerId,
      p1BaseHp: this.sides[1].baseHp, // Side 1 defends P1's base
      p2BaseHp: this.sides[0].baseHp, // Side 0 defends P2's base
    };
  }

  private spawnUnits(side: BattleSide): void {
    for (const unit of side.units) {
      if (!unit.spawned && this.tick >= unit.spawnTick) {
        unit.spawned = true;
        unit.alive = true;
        if (unit.path.length > 0) {
          unit.x = unit.path[0][0];
          unit.y = unit.path[0][1];
        }
      }
    }
  }

  private moveUnits(side: BattleSide): void {
    for (const unit of side.units) {
      if (!unit.alive || !unit.spawned) continue;

      // Check slow tower effect
      let speedMult = 1;
      for (const tower of side.towers) {
        if (tower.hp <= 0) continue;
        if (tower.towerType === "slow") {
          const dist = this.distance(unit.x, unit.y, tower.gridX, tower.gridY);
          if (dist <= tower.range) {
            speedMult = SLOW_FACTOR;
            break;
          }
        }
      }

      // Tank buff: nearby allies get defense buff (tracked externally)
      // Move along path
      const effectiveSpeed = unit.speed * speedMult;
      unit.pathProgress += effectiveSpeed;

      const idx = Math.floor(unit.pathProgress);
      if (idx >= unit.path.length - 1) {
        // Reached the end of path (base)
        unit.pathProgress = unit.path.length - 1;
        const last = unit.path[unit.path.length - 1];
        unit.x = last[0];
        unit.y = last[1];
      } else {
        // Interpolate between path nodes
        const frac = unit.pathProgress - idx;
        const curr = unit.path[idx];
        const next = unit.path[idx + 1];
        unit.x = curr[0] + (next[0] - curr[0]) * frac;
        unit.y = curr[1] + (next[1] - curr[1]) * frac;
      }
    }
  }

  private towerAttack(side: BattleSide): void {
    for (const tower of side.towers) {
      if (tower.hp <= 0) continue;
      tower.cooldown = Math.max(0, tower.cooldown - 1);
      if (tower.cooldown > 0) continue;
      if (tower.towerType === "slow") continue; // slow doesn't deal damage

      // Find nearest alive unit in range
      let nearest: InternalUnit | null = null;
      let nearestDist = Infinity;

      for (const unit of side.units) {
        if (!unit.alive || !unit.spawned) continue;
        const dist = this.distance(unit.x, unit.y, tower.gridX, tower.gridY);
        if (dist <= tower.range && dist < nearestDist) {
          nearest = unit;
          nearestDist = dist;
        }
      }

      if (!nearest) continue;

      tower.cooldown = tower.attackSpeed;

      if (tower.towerType === "cannon") {
        // AOE damage
        for (const unit of side.units) {
          if (!unit.alive || !unit.spawned) continue;
          const dist = this.distance(unit.x, unit.y, nearest.x, nearest.y);
          if (dist <= AOE_RADIUS) {
            this.damageUnit(unit, tower.damage, side);
          }
        }
      } else {
        this.damageUnit(nearest, tower.damage, side);
      }

      this.events.push({
        kind: "tower_fire",
        towerId: tower.id,
        targetId: nearest.id,
      });
    }
  }

  private damageUnit(unit: InternalUnit, damage: number, side: BattleSide): void {
    // Tank buff: nearby tank reduces damage
    let reduction = 0;
    for (const other of side.units) {
      if (!other.alive || !other.spawned) continue;
      if (other.unitType === "tank" && other.id !== unit.id) {
        const dist = this.distance(unit.x, unit.y, other.x, other.y);
        if (dist <= TANK_BUFF_RADIUS) {
          reduction = TANK_BUFF_DEFENSE;
          break;
        }
      }
    }

    const actualDamage = damage * (1 - reduction);
    unit.hp -= actualDamage;

    if (unit.hp <= 0) {
      unit.hp = 0;
      unit.alive = false;
      this.events.push({ kind: "unit_died", unitId: unit.id });
    }
  }

  private checkBaseReach(side: BattleSide): void {
    for (const unit of side.units) {
      if (!unit.alive || !unit.spawned) continue;

      const distToBase = this.distance(unit.x, unit.y, BASE_X, BASE_Y);
      if (distToBase < 0.5) {
        // Unit reached the base
        side.baseHp -= unit.baseDamage;
        side.baseHp = Math.max(0, side.baseHp);
        unit.alive = false;
        unit.hp = 0;

        this.events.push({
          kind: "base_hit",
          defenderId: side.defenderId,
          damage: unit.baseDamage,
        });
      }
    }
  }

  private checkWinCondition(): boolean {
    const s0Hp = this.sides[0].baseHp;
    const s1Hp = this.sides[1].baseHp;

    // A base is destroyed
    if (s0Hp <= 0 || s1Hp <= 0) return true;

    // All units dead/reached and no more spawns
    const allDone = this.sides.every((side) =>
      side.units.every((u) => !u.alive || !u.spawned)
    );
    const allSpawned = this.sides.every((side) =>
      side.units.every((u) => u.spawned)
    );

    if (allDone && allSpawned) return true;

    // Extended time limit (sudden death has its own timer)
    if (this.tick > MAX_BATTLE_TICKS + 100) return true;

    return false;
  }

  private determineWinner(): string {
    const p1BaseHp = this.sides[1].baseHp; // side[1] defends p1
    const p2BaseHp = this.sides[0].baseHp; // side[0] defends p2
    const p1Id = this.sides[1].defenderId;
    const p2Id = this.sides[0].defenderId;

    if (p1BaseHp <= 0 && p2BaseHp <= 0) {
      // Both destroyed — whoever has more remaining HP among their attacking units wins
      return p1BaseHp >= p2BaseHp ? p1Id : p2Id;
    }
    if (p1BaseHp <= 0) return p2Id;
    if (p2BaseHp <= 0) return p1Id;

    // Compare remaining base HP
    if (p1BaseHp !== p2BaseHp) {
      return p1BaseHp > p2BaseHp ? p1Id : p2Id;
    }

    // True draw — return empty (draw)
    return "";
  }

  private destroyRandomWall(): void {
    for (const side of this.sides) {
      if (side.wallPositions.length > 0) {
        const idx = this.tick % side.wallPositions.length;
        const wall = side.wallPositions[idx];

        // Remove from wall positions
        side.wallPositions.splice(idx, 1);

        // Remove from schema walls
        for (let i = 0; i < this.schemaWalls.length; i++) {
          const sw = this.schemaWalls[i];
          if (
            sw.gridX === wall.gridX &&
            sw.gridY === wall.gridY &&
            sw.defenderId === side.defenderId
          ) {
            this.schemaWalls.splice(i, 1);
            break;
          }
        }

        // Recalculate paths for remaining units
        for (const unit of side.units) {
          if (!unit.alive || !unit.spawned) continue;
          const currentIdx = Math.floor(unit.pathProgress);
          const newPath = findBestPath(
            side.towers
              .filter((t) => t.hp > 0)
              .map((t) => ({ type: t.towerType as any, gridX: t.gridX, gridY: t.gridY })),
            side.wallPositions,
            Math.round(unit.x)
          );
          // Adjust path to start from current position
          unit.path = [[Math.round(unit.x), Math.round(unit.y)], ...newPath.slice(1)];
          unit.pathProgress = 0;
        }
      }
    }
  }

  private syncSchemaState(): void {
    for (const side of this.sides) {
      for (const t of side.towers) {
        t.schemaRef.hp = t.hp;
      }
      for (const u of side.units) {
        u.schemaRef.x = u.x;
        u.schemaRef.y = u.y;
        u.schemaRef.hp = u.hp;
        u.schemaRef.alive = u.alive && u.spawned;
      }
    }
  }

  private distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  }

  getBaseHp(playerId: string): number {
    // Find the side where this player is the defender
    for (const side of this.sides) {
      if (side.defenderId === playerId) return side.baseHp;
    }
    return 0;
  }
}
