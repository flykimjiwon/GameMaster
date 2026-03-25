import Phaser from 'phaser';
import { BALL_RADIUS } from '../config/levels';

export class Ball {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  colorIndex: number;
  colorValue: number;

  constructor(scene: Phaser.Scene, x: number, y: number, colorIndex: number, colorValue: number) {
    this.scene = scene;
    this.colorIndex = colorIndex;
    this.colorValue = colorValue;

    this.container = scene.add.container(x, y);

    // Main circle
    const circle = scene.add.graphics();
    circle.fillStyle(colorValue, 1);
    circle.fillCircle(0, 0, BALL_RADIUS);

    // Highlight
    const highlight = scene.add.graphics();
    highlight.fillStyle(0xffffff, 0.25);
    highlight.fillCircle(-BALL_RADIUS * 0.25, -BALL_RADIUS * 0.25, BALL_RADIUS * 0.4);

    // Outline
    const outline = scene.add.graphics();
    outline.lineStyle(2, 0xffffff, 0.15);
    outline.strokeCircle(0, 0, BALL_RADIUS);

    this.container.add([circle, highlight, outline]);
  }

  setPosition(x: number, y: number) {
    this.container.setPosition(x, y);
  }

  getPosition(): { x: number; y: number } {
    return { x: this.container.x, y: this.container.y };
  }

  setDepth(d: number) {
    this.container.setDepth(d);
  }

  destroy() {
    this.container.destroy();
  }
}
