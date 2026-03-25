import Phaser from 'phaser';
import { FOODS, GAME_WIDTH } from '../config/foods';
import type { GameScene } from './GameScene';

export class UIScene extends Phaser.Scene {
  gameScene!: GameScene;
  scoreText!: Phaser.GameObjects.Text;
  bestText!: Phaser.GameObjects.Text;
  comboText!: Phaser.GameObjects.Text;
  nextPreview!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { gameScene: GameScene }) {
    this.gameScene = data.gameScene;
  }

  create() {
    // Title
    this.add.text(GAME_WIDTH / 2, 16, '한국 음식 머지', {
      fontSize: '22px',
      color: '#ffd700',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Score
    this.add.text(20, 50, '점수', {
      fontSize: '12px',
      color: '#aaa',
      fontFamily: 'sans-serif',
    });
    this.scoreText = this.add.text(20, 66, '0', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2,
    });

    // Best
    this.add.text(20, 100, '최고', {
      fontSize: '12px',
      color: '#aaa',
      fontFamily: 'sans-serif',
    });
    this.bestText = this.add.text(20, 116, '0', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'sans-serif',
      stroke: '#000',
      strokeThickness: 2,
    });

    // Next food label
    this.add.text(GAME_WIDTH - 20, 50, '다음', {
      fontSize: '12px',
      color: '#aaa',
      fontFamily: 'sans-serif',
    }).setOrigin(1, 0);

    // Next food preview container
    this.nextPreview = this.add.container(GAME_WIDTH - 50, 90);

    // Combo text
    this.comboText = this.add.text(GAME_WIDTH / 2, 45, '', {
      fontSize: '20px',
      color: '#ff6b6b',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    // Food guide (bottom)
    this.createFoodGuide();
  }

  createFoodGuide() {
    const startX = 22;
    const y = this.scale.height - 28;

    this.add.text(startX, y - 18, '합체 순서:', {
      fontSize: '9px',
      color: '#666',
      fontFamily: 'sans-serif',
    });

    for (let i = 0; i < FOODS.length; i++) {
      const x = startX + i * 46;
      const def = FOODS[i];

      // Small circle
      const circle = this.add.graphics();
      circle.fillStyle(def.color, 0.8);
      circle.fillCircle(x + 10, y, 8);

      // Emoji
      this.add.text(x + 10, y, def.emoji, {
        fontSize: '10px',
      }).setOrigin(0.5);

      // Arrow (except last)
      if (i < FOODS.length - 1) {
        this.add.text(x + 26, y, '→', {
          fontSize: '8px',
          color: '#555',
        }).setOrigin(0.5);
      }
    }
  }

  updateNextPreview(level: number) {
    this.nextPreview.removeAll(true);

    const def = FOODS[level];
    const r = 18;

    const circle = this.add.graphics();
    circle.fillStyle(def.color, 1);
    circle.fillCircle(0, 0, r);
    circle.lineStyle(1, 0xffffff, 0.3);
    circle.strokeCircle(0, 0, r);

    const emoji = this.add.text(0, 0, def.emoji, {
      fontSize: '16px',
    }).setOrigin(0.5);

    this.nextPreview.add([circle, emoji]);
  }

  update() {
    if (!this.gameScene) return;

    // Update score
    this.scoreText.setText(String(this.gameScene.score));
    this.bestText.setText(String(this.gameScene.bestScore));

    // Update next preview
    this.updateNextPreview(this.gameScene.nextLevel);

    // Update combo
    if (this.gameScene.combo > 1) {
      this.comboText.setText(`${this.gameScene.combo}x COMBO!`);
      this.comboText.setAlpha(1);
    } else {
      this.comboText.setAlpha(Math.max(0, this.comboText.alpha - 0.02));
    }
  }
}
