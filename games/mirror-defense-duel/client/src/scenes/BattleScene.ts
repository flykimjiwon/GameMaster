import Phaser from "phaser";
import { NetworkManager } from "../network/NetworkManager";
import { BattleRenderer } from "../systems/BattleRenderer";
import { ReplaySystem } from "../systems/ReplaySystem";
import { GAME_WIDTH } from "../config/balance";

export class BattleScene extends Phaser.Scene {
  private network!: NetworkManager;
  private battleRenderer!: BattleRenderer;
  private replay!: ReplaySystem;
  private timerText!: Phaser.GameObjects.Text;
  private initialized = false;

  // Track known units/towers to avoid re-adding
  private knownTowers = new Set<string>();
  private knownUnits = new Set<string>();
  private mySessionId = "";
  private player1Id = "";
  private player2Id = "";

  constructor() {
    super({ key: "BattleScene" });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a1a);
    this.network = NetworkManager.getInstance();
    this.mySessionId = this.network.sessionId;
    this.replay = new ReplaySystem();
    this.replay.startRecording();
    this.initialized = false;
    this.knownTowers.clear();
    this.knownUnits.clear();

    // Title
    this.add.text(GAME_WIDTH / 2, 12, "⚔ 전투 진행 중 ⚔", {
      fontSize: "16px",
      fontFamily: "monospace",
      color: "#ffab00",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Timer
    this.timerText = this.add.text(GAME_WIDTH / 2, 38, "0.0s", {
      fontSize: "14px",
      fontFamily: "monospace",
      color: "#aaaaaa",
    }).setOrigin(0.5);

    this.setupNetworkListeners();
  }

  update(): void {
    if (this.battleRenderer) {
      this.battleRenderer.update();
    }
  }

  private setupNetworkListeners(): void {
    const room = this.network.room;
    if (!room) return;

    room.onStateChange((state: any) => {
      if (state.phase !== "battle" && state.phase !== "result") return;

      // Initialize renderer on first battle state
      if (!this.initialized) {
        this.player1Id = state.player1Id;
        this.player2Id = state.player2Id;

        this.battleRenderer = new BattleRenderer(
          this,
          this.mySessionId,
          this.player1Id,
          this.player2Id
        );
        this.initialized = true;
      }

      // Update timer
      this.timerText.setText(`${state.timer.toFixed(1)}s`);

      // Sync towers
      if (state.towers) {
        state.towers.forEach((tower: any) => {
          if (!this.knownTowers.has(tower.id)) {
            this.knownTowers.add(tower.id);
            this.battleRenderer.addTower(
              tower.defenderId,
              tower.id,
              tower.gridX,
              tower.gridY,
              tower.towerType,
              this.mySessionId,
              this.player1Id
            );
          }
        });
      }

      // Sync walls
      if (state.walls) {
        state.walls.forEach((wall: any, idx: number) => {
          const wallKey = `w_${wall.defenderId}_${wall.gridX}_${wall.gridY}`;
          if (!this.knownTowers.has(wallKey)) {
            this.knownTowers.add(wallKey);
            this.battleRenderer.addWall(
              wall.defenderId,
              wall.gridX,
              wall.gridY,
              this.mySessionId,
              this.player1Id
            );
          }
        });
      }

      // Sync units
      if (state.units) {
        state.units.forEach((unit: any) => {
          if (!unit.alive && !this.knownUnits.has(unit.id)) return;

          if (!this.knownUnits.has(unit.id) && unit.alive) {
            this.knownUnits.add(unit.id);
            this.battleRenderer.addUnit(
              unit.attackerId,
              unit.targetDefenderId,
              unit.id,
              unit.unitType,
              unit.x,
              unit.y,
              unit.hp,
              this.mySessionId,
              this.player1Id
            );
          } else if (this.knownUnits.has(unit.id)) {
            this.battleRenderer.updateUnit(
              unit.id,
              unit.x,
              unit.y,
              unit.hp,
              unit.alive,
              unit.attackerId,
              this.mySessionId
            );
          }
        });
      }

      // Update base HP
      state.players.forEach((player: any, sessionId: string) => {
        if (this.battleRenderer) {
          this.battleRenderer.updateBaseHp(
            sessionId,
            player.baseHp,
            this.mySessionId
          );
        }
      });

      // Record replay frame
      const unitData: any[] = [];
      if (state.units) {
        state.units.forEach((u: any) => {
          unitData.push({
            id: u.id,
            x: u.x,
            y: u.y,
            hp: u.hp,
            alive: u.alive,
          });
        });
      }

      let p1Hp = 100, p2Hp = 100;
      state.players.forEach((p: any, sid: string) => {
        if (sid === this.player1Id) p1Hp = p.baseHp;
        else p2Hp = p.baseHp;
      });

      this.replay.recordFrame({
        tick: state.tick,
        units: unitData,
        baseHp: { p1: p1Hp, p2: p2Hp },
      });

      // Transition to result
      if (state.phase === "result") {
        this.replay.stopRecording();
        this.time.delayedCall(1500, () => {
          this.scene.start("ResultScene");
        });
      }
    });

    // Battle events
    room.onMessage("battle_event", (data: any) => {
      const event = data.event;
      if (event.kind === "unit_died") {
        this.battleRenderer?.addKillFeed("유닛 처치!");
      } else if (event.kind === "base_hit") {
        this.battleRenderer?.addKillFeed(`기지 피격! (-${event.damage})`);
      } else if (event.kind === "sudden_death") {
        this.battleRenderer?.addKillFeed("⚡ 서든데스! 벽이 파괴됩니다!");
        this.timerText.setText("SUDDEN DEATH");
        this.timerText.setColor("#ff5252");
      }
    });
  }
}
