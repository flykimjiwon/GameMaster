import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, MAX_LEVEL } from '../config/levels';

export class LevelSelect extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelect' });
  }

  create() {
    // Background
    const gfx = this.add.graphics();
    gfx.fillGradientStyle(0x0f0f1a, 0x0f0f1a, 0x1a1030, 0x1a1030, 1);
    gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 40, '스테이지 선택', {
      fontSize: '26px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Get progress
    const saved = localStorage.getItem('colorsort_progress');
    const maxCleared = saved ? parseInt(saved, 10) : 0;

    // Grid of level buttons
    const cols = 5;
    const btnSize = 56;
    const gap = 14;
    const gridWidth = cols * btnSize + (cols - 1) * gap;
    const startX = (GAME_WIDTH - gridWidth) / 2 + btnSize / 2;
    const startY = 100;
    const displayCount = Math.min(MAX_LEVEL, 50);

    for (let i = 0; i < displayCount; i++) {
      const level = i + 1;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnSize + gap);
      const y = startY + row * (btnSize + gap);

      const unlocked = level <= maxCleared + 1;
      const cleared = level <= maxCleared;

      // Button background
      let bgColor = 0x222244;
      if (cleared) bgColor = 0x2d3436;
      if (!unlocked) bgColor = 0x111122;

      const bg = this.add.rectangle(x, y, btnSize, btnSize, bgColor, 1)
        .setInteractive(unlocked ? { useHandCursor: true } : undefined);

      // Border
      const border = this.add.graphics();
      border.lineStyle(2, cleared ? 0x2ecc71 : (unlocked ? 0x6c5ce7 : 0x333344), cleared ? 0.8 : 0.5);
      border.strokeRoundedRect(x - btnSize / 2, y - btnSize / 2, btnSize, btnSize, 8);

      // Level number
      const textColor = unlocked ? '#ffffff' : '#444455';
      this.add.text(x, y - 4, String(level), {
        fontSize: '18px',
        color: textColor,
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      // Stars or lock
      if (cleared) {
        this.add.text(x, y + 16, '★', {
          fontSize: '12px',
          color: '#ffd700',
        }).setOrigin(0.5);
      } else if (!unlocked) {
        this.add.text(x, y + 16, '🔒', {
          fontSize: '10px',
        }).setOrigin(0.5);
      }

      // Click handler
      if (unlocked) {
        bg.on('pointerover', () => bg.setFillStyle(0x3a3a5c));
        bg.on('pointerout', () => bg.setFillStyle(bgColor));
        bg.on('pointerup', () => {
          this.scene.start('GameScene', { level });
        });
      }
    }
  }
}
