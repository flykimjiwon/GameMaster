import Phaser from 'phaser';
import { gameState } from '../systems/GameState';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  async create(): Promise<void> {
    const W = 800;
    const H = 600;

    // Starfield background
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8);
      const size = Phaser.Math.FloatBetween(1, 2.5);
      const star = this.add.graphics();
      star.fillStyle(0xffffff, alpha);
      star.fillCircle(x, y, size);
    }

    // Decorative border
    const border = this.add.graphics();
    border.lineStyle(2, 0x6a2a9e, 1);
    border.strokeRect(20, 20, W - 40, H - 40);
    border.lineStyle(1, 0x3a1a5e, 1);
    border.strokeRect(25, 25, W - 50, H - 50);

    // Corner ornaments
    const corners = [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]];
    corners.forEach(([cx, cy]) => {
      this.add.text(cx, cy, '✦', {
        fontSize: '18px',
        color: '#ffd700',
      }).setOrigin(0.5).setAlpha(0.7);
    });

    // Title
    this.add.text(W / 2, 120, 'IDLE DUNGEON', {
      fontSize: '52px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
      stroke: '#7a1a0e',
      strokeThickness: 6,
      shadow: { color: '#ff6600', blur: 20, offsetX: 0, offsetY: 0, fill: true },
    }).setOrigin(0.5);

    this.add.text(W / 2, 178, 'M A S T E R', {
      fontSize: '28px',
      color: '#e0d0ff',
      fontFamily: 'Georgia, serif',
      letterSpacing: 14,
    }).setOrigin(0.5);

    // Divider
    const divider = this.add.graphics();
    divider.lineStyle(1, 0xffd700, 0.4);
    divider.lineBetween(200, 215, 600, 215);

    // Emoji decoration
    this.add.text(W / 2, 260, '🏰 ⚔️ 🐉 💀 🏆', {
      fontSize: '32px',
    }).setOrigin(0.5);

    // Flavor text
    this.add.text(W / 2, 320, 'You are the Dungeon Master.', {
      fontSize: '16px',
      color: '#c0a0e0',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    this.add.text(W / 2, 345, 'Summon monsters. Send them into the depths.', {
      fontSize: '14px',
      color: '#9080b0',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    this.add.text(W / 2, 368, 'Collect treasure. Grow stronger. Never stop.', {
      fontSize: '14px',
      color: '#9080b0',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Check for existing save
    const hasSave = await gameState.hasSave();

    // START button
    const startBtn = this._makeButton(W / 2, hasSave ? 440 : 460, 'NEW GAME', 0xffd700, 0x7a4a00);
    startBtn.on('pointerdown', () => {
      gameState.deleteSave().then(() => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('DungeonScene', { newGame: true });
        });
      }).catch(console.error);
    });

    if (hasSave) {
      const contBtn = this._makeButton(W / 2, 500, 'CONTINUE', 0x33ccff, 0x003a5e);
      contBtn.on('pointerdown', () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('DungeonScene', { newGame: false });
        });
      });
    }

    // Version
    this.add.text(W / 2, H - 35, 'v1.0.0  |  Auto-saves every 30s', {
      fontSize: '11px',
      color: '#5a4a7a',
    }).setOrigin(0.5);

    // Flicker animation on title
    this.tweens.add({
      targets: this.add.text(W / 2, 120, '', {}),
      alpha: { from: 1, to: 0.8 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    this.cameras.main.fadeIn(600);
  }

  private _makeButton(
    x: number,
    y: number,
    label: string,
    textColor: number,
    fillColor: number
  ): Phaser.GameObjects.Text {
    const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

    const bg = this.add.graphics();
    bg.fillStyle(fillColor, 0.8);
    bg.fillRoundedRect(x - 120, y - 22, 240, 44, 6);
    bg.lineStyle(2, textColor, 0.8);
    bg.strokeRoundedRect(x - 120, y - 22, 240, 44, 6);

    const text = this.add.text(x, y, label, {
      fontSize: '20px',
      color: hex(textColor),
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    text.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(textColor, 0.25);
      bg.fillRoundedRect(x - 120, y - 22, 240, 44, 6);
      bg.lineStyle(2, textColor, 1);
      bg.strokeRoundedRect(x - 120, y - 22, 240, 44, 6);
    });
    text.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(fillColor, 0.8);
      bg.fillRoundedRect(x - 120, y - 22, 240, 44, 6);
      bg.lineStyle(2, textColor, 0.8);
      bg.strokeRoundedRect(x - 120, y - 22, 240, 44, 6);
    });

    return text;
  }
}
