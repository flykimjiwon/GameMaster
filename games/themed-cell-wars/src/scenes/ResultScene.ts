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

    // 배경: 어두운 혈관
    this.add.rectangle(cx, GAME_CONFIG.HEIGHT / 2, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT, 0x0A0E1A, 1);
    this.add.rectangle(cx, GAME_CONFIG.HEIGHT / 2, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT, 0x000000, 0.5);

    // Neon frame
    const gfx = this.add.graphics();
    const frameColor = data.victory ? 0x00E5FF : 0xFF1744;
    gfx.lineStyle(2, frameColor, 0.6);
    gfx.strokeRect(30, 30, GAME_CONFIG.WIDTH - 60, GAME_CONFIG.HEIGHT - 60);
    gfx.lineStyle(1, frameColor, 0.2);
    gfx.strokeRect(36, 36, GAME_CONFIG.WIDTH - 72, GAME_CONFIG.HEIGHT - 72);

    // Title — 면역 승리! / 감염 확산...
    const titleColor = data.victory ? '#00E5FF' : '#FF1744';
    const titleText = data.victory ? '면역 승리!' : '감염 확산...';
    this.add.text(cx, 80, titleText, {
      fontSize: '48px', color: titleColor, fontFamily: 'monospace', fontStyle: 'bold',
      stroke: data.victory ? '#004466' : '#440011', strokeThickness: 4,
    }).setOrigin(0.5);

    // Score
    const score = data.killCount * 10 + data.remainingHp * 5 + Math.floor(data.remainingTime) * 2;
    this.add.text(cx, 160, `SCORE: ${score}`, {
      fontSize: '32px', color: '#FFD600', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Stats
    const stats = [
      `제거한 병원체: ${data.killCount}`,
      `면역 레벨: ${data.level}`,
      `남은 면역력: ${data.remainingHp}`,
      `잔여 시간: ${Math.floor(data.remainingTime)}s`,
    ];
    stats.forEach((text, i) => {
      this.add.text(cx, 220 + i * 32, text, {
        fontSize: '17px', color: '#00E5FF', fontFamily: 'monospace',
      }).setOrigin(0.5);
    });

    // Retry button
    const btn = this.add.rectangle(cx, 420, 220, 52, 0x003344).setInteractive({ useHandCursor: true });
    this.add.graphics().lineStyle(2, 0x00E5FF, 0.8).strokeRect(cx - 110, 394, 220, 52);
    this.add.text(cx, 420, '▶  다시 시작', {
      fontSize: '20px', color: '#00E5FF', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x005577));
    btn.on('pointerout', () => btn.setFillStyle(0x003344));
    btn.on('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
      this.scene.stop();
    });
  }
}
