import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Background
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);

    // Title
    this.add.text(cx, cy - 120, 'MERGE BATTLE TD', {
      fontSize: '42px', color: '#44cc44', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 70, '머지 타워 디펜스', {
      fontSize: '18px', color: '#88aa88',
    }).setOrigin(0.5);

    // Decorative towers
    const gfx = this.add.graphics();
    const colors = [0x44cc44, 0xcc4444, 0x4488cc];
    const sizes = [20, 25, 30];
    for (let i = 0; i < 3; i++) {
      const x = cx - 80 + i * 80;
      const y = cy + 10;
      gfx.fillStyle(colors[i], 0.8);
      gfx.fillRect(x - sizes[i] / 2, y - sizes[i] / 2, sizes[i], sizes[i]);
      gfx.lineStyle(2, 0xffffff, 0.5);
      gfx.strokeRect(x - sizes[i] / 2, y - sizes[i] / 2, sizes[i], sizes[i]);
    }

    // Start button
    const startBg = this.add.rectangle(cx, cy + 100, 200, 60, 0x44cc44).setInteractive({ useHandCursor: true });
    this.add.text(cx, cy + 100, 'START', {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
      targets: startBg,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    startBg.on('pointerover', () => startBg.setFillStyle(0x55dd55));
    startBg.on('pointerout', () => startBg.setFillStyle(0x44cc44));
    startBg.on('pointerdown', () => this.scene.start('BuildScene'));

    // Version
    this.add.text(cx, GAME_HEIGHT - 20, 'Prototype v0.1', {
      fontSize: '12px', color: '#555555',
    }).setOrigin(0.5);
  }
}
