import Phaser from "phaser";
import { NetworkManager } from "../network/NetworkManager";
import { GAME_WIDTH, GAME_HEIGHT } from "../config/balance";

export class MatchmakingScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private dots = "";
  private dotTimer = 0;

  constructor() {
    super({ key: "MatchmakingScene" });
  }

  create(): void {
    // Background
    this.cameras.main.setBackgroundColor(0x0a0a1a);

    // Title
    this.add.text(GAME_WIDTH / 2, 180, "Mirror Defense Duel", {
      fontSize: "42px",
      fontFamily: "monospace",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 230, "PvP 미러 디펜스", {
      fontSize: "18px",
      fontFamily: "monospace",
      color: "#888888",
    }).setOrigin(0.5);

    // Decorative line
    const g = this.add.graphics();
    g.lineStyle(2, 0x1e88e5, 0.5);
    g.moveTo(GAME_WIDTH / 2 - 150, 260);
    g.lineTo(GAME_WIDTH / 2 + 150, 260);
    g.strokePath();

    // Status
    this.statusText = this.add.text(GAME_WIDTH / 2, 340, "서버 접속 중...", {
      fontSize: "16px",
      fontFamily: "monospace",
      color: "#aaaaaa",
    }).setOrigin(0.5);

    // How to play
    const rules = [
      "같은 재료로 방어진 구축 + 공격 편대 편성",
      "60초 배치 → 동시 전투 → 먼저 기지가 뚫린 쪽 패배",
      "방어 vs 공격 자원 배분이 핵심!",
    ];
    rules.forEach((text, i) => {
      this.add.text(GAME_WIDTH / 2, 430 + i * 28, text, {
        fontSize: "13px",
        fontFamily: "monospace",
        color: "#666666",
      }).setOrigin(0.5);
    });

    // Connect
    this.connectToServer();
  }

  update(_time: number, delta: number): void {
    this.dotTimer += delta;
    if (this.dotTimer > 500) {
      this.dotTimer = 0;
      this.dots = this.dots.length >= 3 ? "" : this.dots + ".";
      if (this.statusText.text.includes("대기")) {
        this.statusText.setText(`상대를 찾는 중${this.dots}`);
      }
    }
  }

  private async connectToServer(): Promise<void> {
    try {
      const network = NetworkManager.getInstance();
      const room = await network.joinOrCreate();

      this.statusText.setText("접속 완료! 상대를 찾는 중...");
      this.statusText.setColor("#00e676");

      // Listen for phase change
      room.onStateChange((state: any) => {
        if (state.phase === "placement") {
          this.scene.start("PlacementScene");
        }
      });

      // Check if already 2 players (instant match)
      if (room.state.players.size >= 2) {
        this.scene.start("PlacementScene");
      } else {
        this.statusText.setText("상대를 찾는 중...");
        this.statusText.setColor("#ffab00");
      }
    } catch (err) {
      console.error("Connection failed:", err);
      this.statusText.setText("서버 접속 실패. 새로고침 해주세요.");
      this.statusText.setColor("#ff5252");
    }
  }
}
