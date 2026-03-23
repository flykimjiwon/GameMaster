import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TOWER_COLORS, TowerType } from '../config';

interface ResultData {
  totalEnemies: number;
  escaped: number;
  defended: number;
  rate: number;
  maxTier: number;
  maxTierType: TowerType;
  killed: number;
}

export class ResultScene extends Phaser.Scene {
  private resultData!: ResultData;

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: ResultData): void {
    this.resultData = data;
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const d = this.resultData;

    // Background
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);

    // Title
    const isVictory = d.rate >= 70;
    this.add.text(cx, 80, isVictory ? 'VICTORY!' : 'DEFEAT', {
      fontSize: '48px',
      color: isVictory ? '#44cc44' : '#cc4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats
    const names: Record<TowerType, string> = { archer: '아처', cannon: '캐논', slow: '슬로우' };
    const lines = [
      `방어 성공: ${d.defended}/${d.totalEnemies} (${d.rate}%)`,
      `통과한 적: ${d.escaped}마리`,
      `처치한 적: ${d.killed}마리`,
      `최고 타워: T${d.maxTier} ${names[d.maxTierType]}`,
    ];

    lines.forEach((line, i) => {
      this.add.text(cx, 180 + i * 45, line, {
        fontSize: '22px', color: '#ffffff',
      }).setOrigin(0.5);
    });

    // Max tier tower visual
    const towerColor = TOWER_COLORS[d.maxTierType];
    const gfx = this.add.graphics();
    gfx.fillStyle(towerColor, 0.9);
    gfx.fillRect(cx - 20, 370, 40, 40);
    gfx.lineStyle(2, 0xffffff, 0.6);
    gfx.strokeRect(cx - 20, 370, 40, 40);
    this.add.text(cx, 390, `${d.maxTier}`, {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Retry button
    const retryBg = this.add.rectangle(cx, 470, 180, 50, 0x44cc44).setInteractive({ useHandCursor: true });
    this.add.text(cx, 470, 'RETRY', {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    retryBg.on('pointerover', () => retryBg.setFillStyle(0x55dd55));
    retryBg.on('pointerout', () => retryBg.setFillStyle(0x44cc44));
    retryBg.on('pointerdown', () => this.scene.start('BuildScene'));

    // Home button
    const homeBg = this.add.rectangle(cx, 535, 180, 50, 0x4488cc).setInteractive({ useHandCursor: true });
    this.add.text(cx, 535, 'HOME', {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    homeBg.on('pointerover', () => homeBg.setFillStyle(0x55aadd));
    homeBg.on('pointerout', () => homeBg.setFillStyle(0x4488cc));
    homeBg.on('pointerdown', () => this.scene.start('TitleScene'));
  }
}
