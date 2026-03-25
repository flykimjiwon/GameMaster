import Phaser from "phaser";
import { NetworkManager } from "../network/NetworkManager";
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_COLORS } from "../config/balance";

export class ResultScene extends Phaser.Scene {
  private network!: NetworkManager;

  constructor() {
    super({ key: "ResultScene" });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a1a);
    this.network = NetworkManager.getInstance();

    const room = this.network.room;
    if (!room) {
      this.showError();
      return;
    }

    const state = room.state as any;
    const winnerId = state.winnerId;
    const myId = this.network.sessionId;
    const isWinner = winnerId === myId;
    const isDraw = winnerId === "";

    // Result background glow
    const g = this.add.graphics();
    if (isDraw) {
      g.fillStyle(0xffab00, 0.05);
    } else if (isWinner) {
      g.fillStyle(0x00e676, 0.05);
    } else {
      g.fillStyle(0xff5252, 0.05);
    }
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Result text
    let resultText: string;
    let resultColor: string;
    if (isDraw) {
      resultText = "무승부!";
      resultColor = "#ffab00";
    } else if (isWinner) {
      resultText = "승리!";
      resultColor = "#00e676";
    } else {
      resultText = "패배...";
      resultColor = "#ff5252";
    }

    this.add.text(GAME_WIDTH / 2, 200, resultText, {
      fontSize: "64px",
      fontFamily: "monospace",
      color: resultColor,
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Player stats
    let yPos = 300;
    state.players.forEach((player: any, sessionId: string) => {
      const isMe = sessionId === myId;
      const colorIdx = player.colorIndex;
      const color = isMe ? "#ffffff" : "#aaaaaa";

      this.add.text(GAME_WIDTH / 2, yPos, `${isMe ? "▶ " : "  "}${player.displayName}`, {
        fontSize: "18px",
        fontFamily: "monospace",
        color,
        fontStyle: isMe ? "bold" : "normal",
      }).setOrigin(0.5);

      this.add.text(GAME_WIDTH / 2, yPos + 25, `기지 HP: ${Math.ceil(player.baseHp)}`, {
        fontSize: "14px",
        fontFamily: "monospace",
        color: player.baseHp > 0 ? "#4caf50" : "#ff5252",
      }).setOrigin(0.5);

      yPos += 70;
    });

    // Buttons
    const btnY = 520;

    // Rematch button
    const rematchBtn = this.add.text(GAME_WIDTH / 2 - 120, btnY, "  다시 하기  ", {
      fontSize: "16px",
      fontFamily: "monospace",
      color: "#000000",
      backgroundColor: "#00e676",
      padding: { x: 16, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => rematchBtn.setStyle({ backgroundColor: "#69f0ae" }))
      .on("pointerout", () => rematchBtn.setStyle({ backgroundColor: "#00e676" }))
      .on("pointerdown", () => {
        this.network.send("rematch");
        this.listenForRematch();
        rematchBtn.setText("  대기 중...  ");
        rematchBtn.disableInteractive();
      });

    // New game button
    const newGameBtn = this.add.text(GAME_WIDTH / 2 + 120, btnY, "  새 게임  ", {
      fontSize: "16px",
      fontFamily: "monospace",
      color: "#ffffff",
      backgroundColor: "#333366",
      padding: { x: 16, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => newGameBtn.setStyle({ backgroundColor: "#444488" }))
      .on("pointerout", () => newGameBtn.setStyle({ backgroundColor: "#333366" }))
      .on("pointerdown", () => {
        this.network.leave();
        this.scene.start("MatchmakingScene");
      });
  }

  private listenForRematch(): void {
    const room = this.network.room;
    if (!room) return;

    room.onStateChange((state: any) => {
      if (state.phase === "placement") {
        this.scene.start("PlacementScene");
      }
    });
  }

  private showError(): void {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "연결이 끊어졌습니다.", {
      fontSize: "20px",
      fontFamily: "monospace",
      color: "#ff5252",
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, "클릭하여 재접속", {
      fontSize: "14px",
      fontFamily: "monospace",
      color: "#aaaaaa",
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.scene.start("MatchmakingScene");
      });
  }
}
