import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';

interface ResultData {
  victory: boolean;
  killCount: number;
  level: number;
  remainingHp: number;
  remainingTime: number;
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  create(data: ResultData): void {
    const cx = GAME_CONFIG.WIDTH / 2;

    // Overlay
    this.add.rectangle(cx, GAME_CONFIG.HEIGHT / 2, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT, 0x000000, 0.7);

    // Title
    const titleColor = data.victory ? '#44ff44' : '#ff4444';
    const titleText = data.victory ? 'VICTORY!' : 'DEFEATED';
    this.add.text(cx, 80, titleText, {
      fontSize: '48px', color: titleColor, fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score
    const score = data.killCount * 10 + data.remainingHp * 5 + Math.floor(data.remainingTime) * 2;
    this.add.text(cx, 160, `SCORE: ${score}`, {
      fontSize: '32px', color: '#ffdd44', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Stats
    const stats = [
      `Kills: ${data.killCount}`,
      `Level: ${data.level}`,
      `HP: ${data.remainingHp}`,
      `Time: ${Math.floor(data.remainingTime)}s`,
    ];
    stats.forEach((text, i) => {
      this.add.text(cx, 220 + i * 32, text, {
        fontSize: '18px', color: '#cccccc', fontFamily: 'monospace',
      }).setOrigin(0.5);
    });

    // Retry button
    const btn = this.add.rectangle(cx, 420, 200, 50, 0x4488ff, 1).setInteractive({ useHandCursor: true });
    this.add.text(cx, 420, 'RETRY', {
      fontSize: '22px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x66aaff));
    btn.on('pointerout', () => btn.setFillStyle(0x4488ff));
    btn.on('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
      this.scene.stop();
    });
  }
}
