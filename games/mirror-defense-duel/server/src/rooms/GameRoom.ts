import { Room, Client } from "@colyseus/core";
import { GameState, PlayerData } from "../state/GameState.js";
import { MatchmakingSystem } from "../systems/MatchmakingSystem.js";
import { validatePlacement } from "../systems/PathValidator.js";
import { BattleSimulator } from "../systems/BattleSimulator.js";
import {
  PLACEMENT_TIME,
  TICK_RATE_MS,
  DEFAULT_MATERIALS,
} from "../config/balance.js";
import type {
  TowerPlacement,
  WallPlacement,
  UnitOrder,
  PlacementData,
  Materials,
  TowerType,
  UnitType,
} from "../../../shared/types.js";

interface PlayerPlacement {
  towers: TowerPlacement[];
  walls: WallPlacement[];
  units: UnitOrder[];
  remainingMaterials: Materials;
}

export class GameRoom extends Room<GameState> {
  maxClients = 2;
  private playerCount = 0;
  private placements = new Map<string, PlayerPlacement>();
  private battleSim: BattleSimulator | null = null;
  private battleInterval: ReturnType<typeof setInterval> | null = null;

  onCreate(): void {
    this.setState(new GameState());
    this.state.seed = MatchmakingSystem.generateSeed();

    // Message handlers
    this.onMessage("place_tower", (client, data: { type: string; gridX: number; gridY: number }) => {
      this.handlePlaceTower(client, data);
    });

    this.onMessage("remove_tower", (client, data: { gridX: number; gridY: number }) => {
      this.handleRemoveTower(client, data);
    });

    this.onMessage("place_wall", (client, data: { gridX: number; gridY: number }) => {
      this.handlePlaceWall(client, data);
    });

    this.onMessage("remove_wall", (client, data: { gridX: number; gridY: number }) => {
      this.handleRemoveWall(client, data);
    });

    this.onMessage("set_units", (client, data: { units: UnitOrder[] }) => {
      this.handleSetUnits(client, data);
    });

    this.onMessage("ready", (client) => {
      this.handleReady(client);
    });

    this.onMessage("rematch", (client) => {
      this.handleRematch(client);
    });

    console.log(`Room ${this.roomId} created with seed: ${this.state.seed}`);
  }

  onJoin(client: Client): void {
    const colorIndex = this.playerCount;
    this.playerCount++;

    const player = new PlayerData();
    player.sessionId = client.sessionId;
    player.displayName = MatchmakingSystem.generateName(colorIndex);
    player.colorIndex = colorIndex;
    player.ready = false;
    player.baseHp = 100;

    this.state.players.set(client.sessionId, player);

    // Initialize empty placement
    this.placements.set(client.sessionId, {
      towers: [],
      walls: [],
      units: [],
      remainingMaterials: JSON.parse(JSON.stringify(DEFAULT_MATERIALS)),
    });

    // Set player order
    if (colorIndex === 0) {
      this.state.player1Id = client.sessionId;
    } else {
      this.state.player2Id = client.sessionId;
    }

    console.log(`Player ${player.displayName} (${client.sessionId}) joined`);

    // Both players joined → start placement phase
    if (this.state.players.size === 2) {
      this.lock(); // No more players
      this.startPlacementPhase();
    }
  }

  onLeave(client: Client): void {
    const player = this.state.players.get(client.sessionId);
    console.log(`Player ${player?.displayName} left`);

    this.state.players.delete(client.sessionId);
    this.placements.delete(client.sessionId);

    // If in battle, opponent wins
    if (this.state.phase === "battle" || this.state.phase === "placement") {
      const remaining = Array.from(this.state.players.keys())[0];
      if (remaining) {
        this.endBattle(remaining);
      }
    }
  }

  onDispose(): void {
    if (this.battleInterval) {
      clearInterval(this.battleInterval);
    }
    console.log(`Room ${this.roomId} disposed`);
  }

  // ── Phase Management ──

  private startPlacementPhase(): void {
    this.state.phase = "placement";
    this.state.timer = PLACEMENT_TIME;

    // Countdown timer
    const timerInterval = setInterval(() => {
      this.state.timer -= 1;
      if (this.state.timer <= 0) {
        clearInterval(timerInterval);
        this.autoReadyAll();
      }
    }, 1000);

    // Store interval ref for cleanup
    this.clock.setTimeout(() => {
      clearInterval(timerInterval);
    }, (PLACEMENT_TIME + 5) * 1000);

    console.log("Placement phase started");
  }

  private autoReadyAll(): void {
    // Auto-set default units for players who haven't set them
    for (const [sessionId, placement] of this.placements) {
      if (placement.units.length === 0) {
        placement.units = this.createDefaultUnitOrder();
      }
      const player = this.state.players.get(sessionId);
      if (player) player.ready = true;
    }
    this.startBattlePhase();
  }

  private createDefaultUnitOrder(): UnitOrder[] {
    const orders: UnitOrder[] = [];
    let slot = 0;
    const mat = DEFAULT_MATERIALS.units;
    for (const [unitType, count] of Object.entries(mat)) {
      for (let i = 0; i < count; i++) {
        orders.push({ type: unitType as UnitType, slot: slot++ });
      }
    }
    return orders;
  }

  private startBattlePhase(): void {
    this.state.phase = "battle";
    this.state.timer = 0;

    const p1Id = this.state.player1Id;
    const p2Id = this.state.player2Id;
    const p1 = this.placements.get(p1Id)!;
    const p2 = this.placements.get(p2Id)!;

    // Create battle simulator
    this.battleSim = new BattleSimulator(
      p1Id,
      p2Id,
      p1.towers,
      p1.walls,
      p1.units,
      p2.towers,
      p2.walls,
      p2.units,
      this.state.towers,
      this.state.walls,
      this.state.units
    );

    // Run battle simulation at TICK_RATE_MS intervals
    this.battleInterval = setInterval(() => {
      if (!this.battleSim) return;

      const result = this.battleSim.simulateTick();
      this.state.tick++;
      this.state.timer = this.state.tick * (TICK_RATE_MS / 1000);

      // Update base HP
      const player1 = this.state.players.get(p1Id);
      const player2 = this.state.players.get(p2Id);
      if (player1) player1.baseHp = result.p1BaseHp;
      if (player2) player2.baseHp = result.p2BaseHp;

      // Send battle events
      for (const event of result.events) {
        this.broadcast("battle_event", { event });
      }

      if (result.finished) {
        this.endBattle(result.winnerId);
      }
    }, TICK_RATE_MS);

    console.log("Battle phase started");
  }

  private endBattle(winnerId: string): void {
    if (this.battleInterval) {
      clearInterval(this.battleInterval);
      this.battleInterval = null;
    }

    this.state.phase = "result";
    this.state.winnerId = winnerId;
    this.battleSim = null;

    console.log(`Battle ended. Winner: ${winnerId || "draw"}`);
  }

  // ── Message Handlers ──

  private handlePlaceTower(
    client: Client,
    data: { type: string; gridX: number; gridY: number }
  ): void {
    if (this.state.phase !== "placement") return;

    const placement = this.placements.get(client.sessionId);
    if (!placement) return;

    const towerType = data.type as TowerType;
    const remaining = placement.remainingMaterials.towers[towerType];
    if (remaining === undefined || remaining <= 0) {
      client.send("placement_error", { message: `${towerType} 재료가 부족합니다.` });
      return;
    }

    // Check if cell is already occupied
    const occupied =
      placement.towers.some((t) => t.gridX === data.gridX && t.gridY === data.gridY) ||
      placement.walls.some((w) => w.gridX === data.gridX && w.gridY === data.gridY);

    if (occupied) {
      client.send("placement_error", { message: "이미 배치된 위치입니다." });
      return;
    }

    const newTower: TowerPlacement = {
      type: towerType,
      gridX: data.gridX,
      gridY: data.gridY,
    };

    // Validate path
    const testTowers = [...placement.towers, newTower];
    const validation = validatePlacement(testTowers, placement.walls);
    if (!validation.valid) {
      client.send("placement_error", { message: validation.error ?? "경로가 막힙니다." });
      return;
    }

    placement.towers.push(newTower);
    placement.remainingMaterials.towers[towerType]--;

    // Send updated placement back to this client only
    client.send("placement_update", {
      towers: placement.towers,
      walls: placement.walls,
      remaining: placement.remainingMaterials,
      path: validation.path,
    });
  }

  private handleRemoveTower(
    client: Client,
    data: { gridX: number; gridY: number }
  ): void {
    if (this.state.phase !== "placement") return;

    const placement = this.placements.get(client.sessionId);
    if (!placement) return;

    const idx = placement.towers.findIndex(
      (t) => t.gridX === data.gridX && t.gridY === data.gridY
    );
    if (idx === -1) return;

    const removed = placement.towers.splice(idx, 1)[0];
    placement.remainingMaterials.towers[removed.type]++;

    const validation = validatePlacement(placement.towers, placement.walls);
    client.send("placement_update", {
      towers: placement.towers,
      walls: placement.walls,
      remaining: placement.remainingMaterials,
      path: validation.path,
    });
  }

  private handlePlaceWall(
    client: Client,
    data: { gridX: number; gridY: number }
  ): void {
    if (this.state.phase !== "placement") return;

    const placement = this.placements.get(client.sessionId);
    if (!placement) return;

    if (placement.remainingMaterials.walls <= 0) {
      client.send("placement_error", { message: "벽 재료가 부족합니다." });
      return;
    }

    const occupied =
      placement.towers.some((t) => t.gridX === data.gridX && t.gridY === data.gridY) ||
      placement.walls.some((w) => w.gridX === data.gridX && w.gridY === data.gridY);

    if (occupied) {
      client.send("placement_error", { message: "이미 배치된 위치입니다." });
      return;
    }

    const newWall: WallPlacement = { gridX: data.gridX, gridY: data.gridY };
    const testWalls = [...placement.walls, newWall];
    const validation = validatePlacement(placement.towers, testWalls);
    if (!validation.valid) {
      client.send("placement_error", { message: validation.error ?? "경로가 막힙니다." });
      return;
    }

    placement.walls.push(newWall);
    placement.remainingMaterials.walls--;

    client.send("placement_update", {
      towers: placement.towers,
      walls: placement.walls,
      remaining: placement.remainingMaterials,
      path: validation.path,
    });
  }

  private handleRemoveWall(
    client: Client,
    data: { gridX: number; gridY: number }
  ): void {
    if (this.state.phase !== "placement") return;

    const placement = this.placements.get(client.sessionId);
    if (!placement) return;

    const idx = placement.walls.findIndex(
      (w) => w.gridX === data.gridX && w.gridY === data.gridY
    );
    if (idx === -1) return;

    placement.walls.splice(idx, 1);
    placement.remainingMaterials.walls++;

    const validation = validatePlacement(placement.towers, placement.walls);
    client.send("placement_update", {
      towers: placement.towers,
      walls: placement.walls,
      remaining: placement.remainingMaterials,
      path: validation.path,
    });
  }

  private handleSetUnits(
    client: Client,
    data: { units: UnitOrder[] }
  ): void {
    if (this.state.phase !== "placement") return;

    const placement = this.placements.get(client.sessionId);
    if (!placement) return;

    // Validate unit counts
    const counts: Record<string, number> = {};
    for (const u of data.units) {
      counts[u.type] = (counts[u.type] || 0) + 1;
    }

    for (const [type, count] of Object.entries(counts)) {
      const max = DEFAULT_MATERIALS.units[type as UnitType];
      if (max === undefined || count > max) {
        client.send("placement_error", { message: `${type} 유닛 수가 초과되었습니다.` });
        return;
      }
    }

    placement.units = data.units;
    client.send("units_update", { units: data.units });
  }

  private handleReady(client: Client): void {
    if (this.state.phase !== "placement") return;

    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    const placement = this.placements.get(client.sessionId);
    if (!placement) return;

    // Auto-assign units if empty
    if (placement.units.length === 0) {
      placement.units = this.createDefaultUnitOrder();
    }

    player.ready = true;
    console.log(`Player ${player.displayName} is ready`);

    // Check if both players are ready
    let allReady = true;
    this.state.players.forEach((p) => {
      if (!p.ready) allReady = false;
    });

    if (allReady && this.state.players.size === 2) {
      this.startBattlePhase();
    }
  }

  private handleRematch(_client: Client): void {
    if (this.state.phase !== "result") return;

    // Reset state
    this.state.phase = "waiting";
    this.state.winnerId = "";
    this.state.tick = 0;
    this.state.timer = 0;
    this.state.towers.splice(0, this.state.towers.length);
    this.state.walls.splice(0, this.state.walls.length);
    this.state.units.splice(0, this.state.units.length);
    this.state.seed = MatchmakingSystem.generateSeed();

    // Reset players
    this.state.players.forEach((p) => {
      p.ready = false;
      p.baseHp = 100;
    });

    // Reset placements
    for (const [sessionId] of this.placements) {
      this.placements.set(sessionId, {
        towers: [],
        walls: [],
        units: [],
        remainingMaterials: JSON.parse(JSON.stringify(DEFAULT_MATERIALS)),
      });
    }

    if (this.state.players.size === 2) {
      this.startPlacementPhase();
    }
  }
}
