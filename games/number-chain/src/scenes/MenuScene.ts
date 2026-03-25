import Phaser from 'phaser';
import localforage from 'localforage';
import { GAME_WIDTH, GAME_HEIGHT, NUMBER_COLORS } from '../config/gameConfig';

const BEST_SCORE_KEY = 'number-chain-best-score';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  async create(): Promise<void> {
    this.createBackground();
    this.createFloatingParticles();
    this.createTitle();
    await this.createBestScore();
    this.createStartPrompt();

    this.input.once('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private createBackground(): void {
    // Dark gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x0f3460, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Grid-like subtle overlay
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x4488FF, 0.06);
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      grid.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      grid.lineBetween(0, y, GAME_WIDTH, y);
    }
  }

  private createFloatingParticles(): void {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 18; i++) {
      const value = values[i % 9];
      const color = NUMBER_COLORS[value] ?? 0xFFFFFF;
      const x = Phaser.Math.Between(30, GAME_WIDTH - 30);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);

      const container = this.add.container(x, y);

      const bg = this.add.graphics();
      bg.fillStyle(color, 0.18);
      bg.fillRoundedRect(-22, -22, 44, 44, 8);
      container.add(bg);

      const text = this.add.text(0, 0, String(value), {
        fontSize: '22px',
        fontFamily: 'Arial Black, Arial',
        color: `#${color.toString(16).padStart(6, '0')}`,
      });
      text.setOrigin(0.5, 0.5);
      container.add(text);

      container.setAlpha(0);
      container.setDepth(0);

      const duration = Phaser.Math.Between(3000, 7000);
      const delay = Phaser.Math.Between(0, 3000);

      this.tweens.add({
        targets: container,
        y: y - Phaser.Math.Between(200, 400),
        alpha: { from: 0, to: 0.6 },
        duration,
        delay,
        ease: 'Linear',
        repeat: -1,
        yoyo: false,
        onRepeat: () => {
          container.y = GAME_HEIGHT + 30;
          container.x = Phaser.Math.Between(30, GAME_WIDTH - 30);
        },
      });
    }
  }

  private createTitle(): void {
    // Glow backdrop
    const glowBg = this.add.graphics();
    glowBg.fillStyle(0x4488FF, 0.08);
    glowBg.fillRoundedRect(GAME_WIDTH / 2 - 230, 180, 460, 120, 20);
    glowBg.setDepth(2);

    const titleLine1 = this.add.text(GAME_WIDTH / 2, 220, 'NUMBER', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial',
      color: '#4488FF',
      stroke: '#001133',
      strokeThickness: 6,
    });
    titleLine1.setOrigin(0.5, 0.5);
    titleLine1.setDepth(3);

    const titleLine2 = this.add.text(GAME_WIDTH / 2, 292, 'CHAIN', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial',
      color: '#00FF88',
      stroke: '#003322',
      strokeThickness: 6,
    });
    titleLine2.setOrigin(0.5, 0.5);
    titleLine2.setDepth(3);

    // Subtitle
    const sub = this.add.text(GAME_WIDTH / 2, 340, 'REACTION', {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#333300',
      strokeThickness: 3,
      letterSpacing: 8,
    });
    sub.setOrigin(0.5, 0.5);
    sub.setDepth(3);

    // Pulsing glow on title
    this.tweens.add({
      targets: [titleLine1, titleLine2],
      alpha: { from: 0.85, to: 1 },
      duration: 1200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // How to play hint
    const hint = this.add.text(GAME_WIDTH / 2, 420, 'Connect tiles that sum to\na multiple of 10 to explode!', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaacc',
      align: 'center',
      lineSpacing: 6,
    });
    hint.setOrigin(0.5, 0.5);
    hint.setDepth(3);
  }

  private async createBestScore(): Promise<void> {
    let best = 0;
    try {
      const val = await localforage.getItem<number>(BEST_SCORE_KEY);
      if (val !== null && val !== undefined) best = val;
    } catch {
      // Ignore
    }

    if (best > 0) {
      const bestText = this.add.text(GAME_WIDTH / 2, 500, `BEST: ${best}`, {
        fontSize: '26px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFD700',
        stroke: '#333300',
        strokeThickness: 3,
      });
      bestText.setOrigin(0.5, 0.5);
      bestText.setDepth(3);
    }
  }

  private createStartPrompt(): void {
    const tap = this.add.text(GAME_WIDTH / 2, 580, 'TAP TO START', {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#000033',
      strokeThickness: 4,
    });
    tap.setOrigin(0.5, 0.5);
    tap.setDepth(3);

    this.tweens.add({
      targets: tap,
      alpha: { from: 1, to: 0.2 },
      duration: 700,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }
}
