import Phaser from 'phaser';
import { Ball } from './Ball';
import { TUBE_WIDTH, TUBE_HEIGHT, BALL_SPACING, COLOR_PALETTE } from '../config/levels';

const MAX_BALLS = 4;

export class Tube {
  scene: Phaser.Scene;
  index: number;
  x: number;
  y: number;
  balls: Ball[] = [];
  graphics: Phaser.GameObjects.Graphics;
  hitZone: Phaser.GameObjects.Rectangle;
  selected = false;
  completedEffect: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, index: number, x: number, y: number) {
    this.scene = scene;
    this.index = index;
    this.x = x;
    this.y = y;

    // Tube visual (rounded rectangle)
    this.graphics = scene.add.graphics();
    this.drawTube(false);

    // Hit zone for interaction
    this.hitZone = scene.add.rectangle(x, y + TUBE_HEIGHT / 2 - 10, TUBE_WIDTH + 16, TUBE_HEIGHT + 40, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
  }

  drawTube(highlighted: boolean) {
    this.graphics.clear();

    const w = TUBE_WIDTH;
    const h = TUBE_HEIGHT;
    const left = this.x - w / 2;
    const top = this.y;

    // Tube body
    this.graphics.fillStyle(0x1a1a2e, 0.9);
    this.graphics.fillRoundedRect(left, top, w, h, { tl: 4, tr: 4, bl: 12, br: 12 });

    // Tube border
    const borderColor = highlighted ? 0x6c5ce7 : 0x333355;
    const borderWidth = highlighted ? 3 : 2;
    this.graphics.lineStyle(borderWidth, borderColor, highlighted ? 1 : 0.6);
    this.graphics.strokeRoundedRect(left, top, w, h, { tl: 4, tr: 4, bl: 12, br: 12 });

    // Glass reflection
    this.graphics.fillStyle(0xffffff, 0.04);
    this.graphics.fillRoundedRect(left + 3, top + 3, w / 3, h - 6, 4);

    if (highlighted) {
      // Glow effect
      this.graphics.lineStyle(1, 0x6c5ce7, 0.3);
      this.graphics.strokeRoundedRect(left - 2, top - 2, w + 4, h + 4, { tl: 6, tr: 6, bl: 14, br: 14 });
    }
  }

  setHighlight(val: boolean) {
    this.selected = val;
    this.drawTube(val);
  }

  setBalls(colorIndices: number[]) {
    // Clear existing
    this.balls.forEach(b => b.destroy());
    this.balls = [];

    // Create new balls (bottom to top)
    for (let i = 0; i < colorIndices.length; i++) {
      const ci = colorIndices[i];
      const bx = this.x;
      const by = this.y + TUBE_HEIGHT - 22 - i * BALL_SPACING;
      const ball = new Ball(this.scene, bx, by, ci, COLOR_PALETTE[ci]);
      ball.setDepth(10);
      this.balls.push(ball);
    }
  }

  getTopBall(): Ball | null {
    return this.balls.length > 0 ? this.balls[this.balls.length - 1] : null;
  }

  getTopColorIndex(): number | -1 {
    const top = this.getTopBall();
    return top ? top.colorIndex : -1;
  }

  canReceive(colorIndex: number): boolean {
    if (this.balls.length >= MAX_BALLS) return false;
    if (this.balls.length === 0) return true;
    return this.getTopColorIndex() === colorIndex;
  }

  isEmpty(): boolean {
    return this.balls.length === 0;
  }

  isFull(): boolean {
    return this.balls.length >= MAX_BALLS;
  }

  isComplete(): boolean {
    if (this.balls.length !== MAX_BALLS) return false;
    const first = this.balls[0].colorIndex;
    return this.balls.every(b => b.colorIndex === first);
  }

  removeBall(): Ball | null {
    return this.balls.pop() || null;
  }

  addBall(ball: Ball) {
    this.balls.push(ball);
    const by = this.y + TUBE_HEIGHT - 22 - (this.balls.length - 1) * BALL_SPACING;
    ball.setPosition(this.x, by);
  }

  getBallTargetY(index: number): number {
    return this.y + TUBE_HEIGHT - 22 - index * BALL_SPACING;
  }

  showCompleted() {
    if (this.completedEffect) return;
    this.completedEffect = this.scene.add.graphics();
    this.completedEffect.lineStyle(3, 0x2ecc71, 0.8);
    this.completedEffect.strokeRoundedRect(
      this.x - TUBE_WIDTH / 2 - 2, this.y - 2,
      TUBE_WIDTH + 4, TUBE_HEIGHT + 4,
      { tl: 6, tr: 6, bl: 14, br: 14 }
    );

    // Checkmark
    this.scene.add.text(this.x, this.y - 14, '✓', {
      fontSize: '16px',
      color: '#2ecc71',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);
  }

  destroy() {
    this.balls.forEach(b => b.destroy());
    this.graphics.destroy();
    this.hitZone.destroy();
    this.completedEffect?.destroy();
  }
}
