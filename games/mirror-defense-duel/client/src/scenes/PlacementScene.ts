import Phaser from "phaser";
import { NetworkManager } from "../network/NetworkManager";
import { GridBoard } from "../objects/GridBoard";
import { PlacementSystem } from "../systems/PlacementSystem";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLACEMENT_CELL_SIZE,
  PLACEMENT_GRID_X,
  PLACEMENT_GRID_Y,
} from "../config/balance";

export class PlacementScene extends Phaser.Scene {
  private network!: NetworkManager;
  private grid!: GridBoard;
  private placementSystem!: PlacementSystem;
  private timerText!: Phaser.GameObjects.Text;
  private opponentStatus!: Phaser.GameObjects.Text;
  private phaseTitle!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "PlacementScene" });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a1a);
    this.network = NetworkManager.getInstance();

    // Title
    this.phaseTitle = this.add.text(GAME_WIDTH / 2, 15, "배치 페이즈", {
      fontSize: "18px",
      fontFamily: "monospace",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Timer
    this.timerText = this.add.text(GAME_WIDTH / 2, 42, "60", {
      fontSize: "28px",
      fontFamily: "monospace",
      color: "#00e676",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Opponent status
    this.opponentStatus = this.add.text(GAME_WIDTH - 20, 15, "", {
      fontSize: "12px",
      fontFamily: "monospace",
      color: "#888888",
    }).setOrigin(1, 0);

    // Grid
    this.grid = new GridBoard(
      this,
      PLACEMENT_GRID_X,
      PLACEMENT_GRID_Y,
      PLACEMENT_CELL_SIZE,
      true
    );

    // Grid labels
    this.add.text(PLACEMENT_GRID_X + 5 * PLACEMENT_CELL_SIZE, PLACEMENT_GRID_Y - 12, "▼ 적 진입로", {
      fontSize: "10px",
      fontFamily: "monospace",
      color: "#00e676",
    }).setOrigin(0.5);

    this.add.text(
      PLACEMENT_GRID_X + 5 * PLACEMENT_CELL_SIZE,
      PLACEMENT_GRID_Y + 10 * PLACEMENT_CELL_SIZE + 8,
      "■ 내 기지",
      {
        fontSize: "10px",
        fontFamily: "monospace",
        color: "#ff5252",
      }
    ).setOrigin(0.5);

    // Placement system (handles palette + input)
    this.placementSystem = new PlacementSystem(
      this,
      this.grid,
      this.network,
      () => this.onReady()
    );

    // Network listeners
    this.setupNetworkListeners();
  }

  update(): void {
    // Timer is updated via network state
  }

  private setupNetworkListeners(): void {
    const room = this.network.room;
    if (!room) return;

    // Update timer from server state
    room.onStateChange((state: any) => {
      if (state.phase === "placement") {
        const timeLeft = Math.ceil(state.timer);
        this.timerText.setText(`${timeLeft}`);

        if (timeLeft <= 10) {
          this.timerText.setColor("#ff5252");
          if (timeLeft <= 5) {
            this.timerText.setScale(1.1);
          }
        }
      }

      // Track opponent ready status
      let opponentReady = false;
      state.players.forEach((player: any, key: string) => {
        if (key !== this.network.sessionId && player.ready) {
          opponentReady = true;
        }
      });
      this.opponentStatus.setText(
        opponentReady ? "상대: 준비 완료" : "상대: 배치 중..."
      );
      this.opponentStatus.setColor(opponentReady ? "#00e676" : "#888888");

      // Transition to battle
      if (state.phase === "battle") {
        this.scene.start("BattleScene");
      }
    });
  }

  private onReady(): void {
    // Send default unit order if not set
    const units = [];
    let slot = 0;
    const counts = { infantry: 10, archer: 5, cavalry: 3, tank: 1 };
    for (const [type, count] of Object.entries(counts)) {
      for (let i = 0; i < count; i++) {
        units.push({ type, slot: slot++ });
      }
    }
    this.network.send("set_units", { units });
    this.network.send("ready");

    this.phaseTitle.setText("준비 완료! 상대를 기다리는 중...");
    this.phaseTitle.setColor("#00e676");
  }
}
