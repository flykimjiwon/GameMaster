import Phaser from 'phaser';
import localforage from 'localforage';
import { getComboMultiplier, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

const BEST_SCORE_KEY = 'number-chain-best-score';

export class ComboSystem {
  private scene: Phaser.Scene;

  currentCombo: number = 0;
  maxCombo: number = 0;
  score: number = 0;
  bestScore: number = 0;

  private scoreText: Phaser.GameObjects.Text | null = null;
  private bestText: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    void this.loadBest();
  }

  setScoreDisplay(scoreText: Phaser.GameObjects.Text, bestText: Phaser.GameObjects.Text): void {
    this.scoreText = scoreText;
    this.bestText = bestText;
    this.refreshDisplay();
  }

  addExplosion(tileCount: number, sum: number, comboLevel: number): void {
    const multiplier = getComboMultiplier(comboLevel);
    const gained = sum * multiplier * tileCount;
    this.score += gained;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      void this.saveBest();
    }

    this.refreshDisplay();

    // Floating score text
    this.showFloatingScore(gained, multiplier);

    if (comboLevel >= 2) {
      this.showComboPopup(multiplier);
    }
  }

  private refreshDisplay(): void {
    if (this.scoreText) {
      this.scoreText.setText(`SCORE: ${this.score}`);
    }
    if (this.bestText) {
      this.bestText.setText(`BEST: ${this.bestScore}`);
    }
  }

  private showFloatingScore(points: number, multiplier: number): void {
    const x = GAME_WIDTH / 2 + Phaser.Math.Between(-60, 60);
    const y = GAME_HEIGHT / 2 + Phaser.Math.Between(-20, 20);

    const label = multiplier > 1 ? `+${points} x${multiplier}` : `+${points}`;
    const text = this.scene.add.text(x, y, label, {
      fontSize: '24px',
      fontFamily: 'Arial Black, Arial',
      color: multiplier > 1 ? '#FFD700' : '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setOrigin(0.5, 0.5);
    text.setDepth(15);

    this.scene.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 900,
      ease: 'Power2.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  showComboPopup(multiplier: number): void {
    const labels: Record<number, string> = {
      2: 'COMBO x2!',
      4: 'COMBO x4!',
      8: 'COMBO x8!',
      16: 'COMBO x16!',
    };
    const label = labels[multiplier] ?? `COMBO x${multiplier}!`;

    const text = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, label, {
      fontSize: '48px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#FF4400',
      strokeThickness: 5,
    });
    text.setOrigin(0.5, 0.5);
    text.setDepth(20);
    text.setAlpha(0);
    text.setScale(0.4);

    this.scene.tweens.add({
      targets: text,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: text,
          alpha: 0,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 500,
          delay: 400,
          ease: 'Power2.easeIn',
          onComplete: () => text.destroy(),
        });
      },
    });
  }

  resetCombo(): void {
    this.currentCombo = 0;
  }

  incrementCombo(): void {
    this.currentCombo++;
    if (this.currentCombo > this.maxCombo) {
      this.maxCombo = this.currentCombo;
    }
  }

  async loadBest(): Promise<void> {
    try {
      const val = await localforage.getItem<number>(BEST_SCORE_KEY);
      if (val !== null && val !== undefined) {
        this.bestScore = val;
      }
    } catch {
      // Ignore storage errors
    }
    this.refreshDisplay();
  }

  async saveBest(): Promise<void> {
    try {
      await localforage.setItem(BEST_SCORE_KEY, this.bestScore);
    } catch {
      // Ignore storage errors
    }
  }
}
