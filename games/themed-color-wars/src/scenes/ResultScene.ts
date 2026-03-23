import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TowerType } from '../config';
import { getTheme } from '../themes/ThemeSystem';

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
    const theme = getTheme();

    const isVictory = d.rate >= 70;

    // Background: colorful for victory, grey for defeat
    const bgColor = isVictory ? theme.background : 0xE0E0E0;
    this.cameras.main.setBackgroundColor(bgColor);
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, bgColor);

    if (isVictory) {
      // Colorful confetti-like background circles
      const confettiColors = [0xFFEB3B, 0xFF1744, 0x448AFF, 0x43A047, 0xFB8C00, 0x8E24AA];
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * GAME_WIDTH;
        const y = Math.random() * GAME_HEIGHT;
        const r = 8 + Math.random() * 20;
        const c = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        this.add.circle(x, y, r, c, 0.15);
      }
    }

    const titleText = isVictory ? '색이 돌아왔다!' : '세계가 잿빛으로...';
    const titleColor = isVictory ? '#FF1744' : '#616161';
    this.add.text(cx, 70, titleText, {
      fontSize: '36px',
      color: titleColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 112, isVictory ? 'VICTORY!' : 'DEFEAT', {
      fontSize: '22px',
      color: isVictory ? '#FB8C00' : '#9E9E9E',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const names: Record<TowerType, string> = { archer: '노랑', cannon: '빨강', slow: '파랑' };
    const lines = [
      `방어 성공: ${d.defended}/${d.totalEnemies} (${d.rate}%)`,
      `통과한 적: ${d.escaped}마리`,
      `처치한 적: ${d.killed}마리`,
      `최고 타워: T${d.maxTier} ${names[d.maxTierType]}`,
    ];

    lines.forEach((line, i) => {
      this.add.text(cx, 180 + i * 45, line, {
        fontSize: '22px', color: theme.hudTextColor,
      }).setOrigin(0.5);
    });

    // Max tier tower visual
    const towerVisual = theme.towerVisuals[d.maxTierType];
    const gfx = this.add.graphics();
    if (theme.drawTower) {
      gfx.setPosition(cx, 390);
      theme.drawTower(gfx, d.maxTierType, d.maxTier, 25);
    } else {
      gfx.fillStyle(towerVisual.color, 0.9);
      gfx.fillRect(cx - 20, 370, 40, 40);
      gfx.lineStyle(2, 0xffffff, 0.6);
      gfx.strokeRect(cx - 20, 370, 40, 40);
    }
    this.add.text(cx, 425, `T${d.maxTier}`, {
      fontSize: '14px', color: theme.hudTextColor, fontStyle: 'bold',
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
