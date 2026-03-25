import Phaser from 'phaser';
import localforage from 'localforage';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  async create(data: { score: number; distance: number; combo: number }): Promise<void> {
    const { score, distance, combo } = data;

    // Dark overlay
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Load / update high score
    const prevHighScore = (await localforage.getItem<number>('obk_highscore')) ?? 0;
    const isNew = score > prevHighScore;
    if (isNew) {
      await localforage.setItem('obk_highscore', score);
    }
    const highScore = isNew ? score : prevHighScore;

    const mid = GAME_WIDTH / 2;

    // Title
    this.add.text(mid, 70, '— GAME OVER —', {
      fontSize: '38px', color: '#ff4444',
      fontFamily: 'Courier New, monospace',
      stroke: '#880000', strokeThickness: 5,
    }).setOrigin(0.5);

    // Stats card
    const cw = 340; const ch = 180;
    const cx = mid - cw / 2; const cy = 120;
    const card = this.add.graphics();
    card.fillStyle(0x111122, 0.95);
    card.fillRoundedRect(cx, cy, cw, ch, 8);
    card.lineStyle(1, 0x3333aa, 1);
    card.strokeRoundedRect(cx, cy, cw, ch, 8);

    const rows = [
      { label: 'SCORE', value: score.toLocaleString(), color: '#ffffff' },
      { label: 'DISTANCE', value: `${Math.floor(distance)} m`, color: '#aaaaff' },
      { label: 'MAX COMBO', value: `x${combo}`, color: '#ffdd44' },
      { label: 'HIGH SCORE', value: highScore.toLocaleString(), color: isNew ? '#44ff88' : '#888899' },
    ];

    rows.forEach((row, i) => {
      const y = cy + 22 + i * 38;
      this.add.text(cx + 20, y, row.label, {
        fontSize: '13px', color: '#666688', fontFamily: 'Courier New, monospace',
      });
      this.add.text(cx + cw - 20, y, row.value, {
        fontSize: '17px', color: row.color, fontFamily: 'Courier New, monospace',
        fontStyle: 'bold',
      }).setOrigin(1, 0);
    });

    if (isNew) {
      const newBadge = this.add.text(mid, cy + ch + 12, '★  NEW HIGH SCORE!  ★', {
        fontSize: '15px', color: '#44ff88', fontFamily: 'Courier New, monospace',
        stroke: '#004400', strokeThickness: 3,
      }).setOrigin(0.5);
      this.tweens.add({
        targets: newBadge, scaleX: 1.08, scaleY: 1.08,
        duration: 400, yoyo: true, repeat: -1,
      });
    }

    // Buttons
    this.makeButton(mid - 90, GAME_HEIGHT - 90, 'RETRY', () => {
      this.scene.start('GameScene');
    });
    this.makeButton(mid + 90, GAME_HEIGHT - 90, 'MENU', () => {
      this.scene.start('MenuScene');
    });

    // Keyboard shortcuts
    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('GameScene'), this);
    this.input.keyboard?.once('keydown-R', () => this.scene.start('GameScene'), this);
    this.input.keyboard?.once('keydown-M', () => this.scene.start('MenuScene'), this);

    this.add.text(mid, GAME_HEIGHT - 46, 'SPACE / R = Retry   M = Menu', {
      fontSize: '11px', color: '#555577', fontFamily: 'Courier New, monospace',
    }).setOrigin(0.5);
  }

  private makeButton(x: number, y: number, label: string, cb: () => void): void {
    const bw = 130; const bh = 38;
    const btn = this.add.graphics();
    btn.fillStyle(0x1a1a44, 1);
    btn.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 6);
    btn.lineStyle(1, 0x5555cc, 1);
    btn.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 6);

    const txt = this.add.text(x, y, label, {
      fontSize: '16px', color: '#aaaaff', fontFamily: 'Courier New, monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    txt.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(0x2a2a66, 1);
      btn.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 6);
      btn.lineStyle(1, 0x8888ff, 1);
      btn.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 6);
      txt.setColor('#ffffff');
    });
    txt.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(0x1a1a44, 1);
      btn.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 6);
      btn.lineStyle(1, 0x5555cc, 1);
      btn.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 6);
      txt.setColor('#aaaaff');
    });
    txt.on('pointerdown', cb);
  }
}
