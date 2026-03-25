import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.BG_SKY, COLORS.BG_SKY, 0x0a0a2a, 0x0a0a2a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars
    const starGfx = this.add.graphics();
    starGfx.fillStyle(0xffffff, 1);
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = Math.random() * (GAME_HEIGHT * 0.65);
      const r = Math.random() * 1.5 + 0.3;
      starGfx.fillCircle(x, y, r);
    }

    // Ground strip
    const ground = this.add.graphics();
    ground.fillStyle(COLORS.GROUND, 1);
    ground.fillRect(0, GAME_HEIGHT - 80, GAME_WIDTH, 80);
    ground.lineStyle(2, COLORS.GROUND_LINE, 1);
    ground.lineBetween(0, GAME_HEIGHT - 80, GAME_WIDTH, GAME_HEIGHT - 80);

    // Title
    this.add.text(GAME_WIDTH / 2, 90, '원버튼 기사', {
      fontSize: '52px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace',
      stroke: '#4444aa',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 148, 'ONE BUTTON KNIGHT', {
      fontSize: '20px',
      color: '#8888cc',
      fontFamily: 'Courier New, monospace',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Controls guide card
    const cardX = GAME_WIDTH / 2 - 180;
    const cardY = 195;
    const cardW = 360;
    const cardH = 165;
    const card = this.add.graphics();
    card.fillStyle(0x111133, 0.9);
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
    card.lineStyle(1, 0x3333aa, 1);
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);

    const mid = GAME_WIDTH / 2;
    this.add.text(mid, cardY + 18, '[ 조작법 ]', {
      fontSize: '14px', color: '#aaaaff', fontFamily: 'Courier New, monospace',
    }).setOrigin(0.5);

    const rows = [
      { color: '#4488ff', label: '빠르게 탭 (< 200ms)', action: '⚔  검격 공격' },
      { color: '#44ff88', label: '짧게 홀드 (200–500ms)', action: '↑  점프' },
      { color: '#ffaa22', label: '길게 홀드 (> 500ms)', action: '⚡  대쉬 (무적)' },
    ];

    rows.forEach((row, i) => {
      const y = cardY + 48 + i * 38;
      // Gauge dot
      const dot = this.add.graphics();
      dot.fillStyle(parseInt(row.color.replace('#', '0x')), 1);
      dot.fillCircle(cardX + 18, y + 8, 6);
      this.add.text(cardX + 32, y, row.label, {
        fontSize: '12px', color: '#aaaacc', fontFamily: 'Courier New, monospace',
      });
      this.add.text(cardX + 32, y + 16, row.action, {
        fontSize: '13px', color: row.color, fontFamily: 'Courier New, monospace',
        fontStyle: 'bold',
      });
    });

    // Enemy type guide
    const ex = GAME_WIDTH / 2 - 160;
    const ey = 375;
    this.add.text(mid, ey, '적 유형:  빨강-병사 (검격)  •  노랑-새 (점프+검격)  •  초록-방패병 (대쉬)', {
      fontSize: '11px', color: '#888899', fontFamily: 'Courier New, monospace',
    }).setOrigin(0.5);

    // Start prompt — blinking
    const startText = this.add.text(mid, GAME_HEIGHT - 36, '▶  CLICK  /  SPACE  to  START  ◀', {
      fontSize: '16px', color: '#ffffff', fontFamily: 'Courier New, monospace',
      stroke: '#2222aa', strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Input to start
    this.input.keyboard?.once('keydown-SPACE', this.startGame, this);
    this.input.once('pointerdown', this.startGame, this);
  }

  private startGame(): void {
    this.scene.start('GameScene');
  }
}
