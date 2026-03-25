import Phaser from "phaser";
import { WALL_RENDER } from "../config/towers";

export class WallSprite extends Phaser.GameObjects.Container {
  readonly gridX: number;
  readonly gridY: number;
  private gfx: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    size: number,
    gridX: number,
    gridY: number
  ) {
    super(scene, x, y);
    this.gridX = gridX;
    this.gridY = gridY;

    this.gfx = scene.add.graphics();
    this.add(this.gfx);

    const half = size / 2 - 1;
    // Brick pattern
    this.gfx.fillStyle(WALL_RENDER.color, 0.9);
    this.gfx.fillRect(-half, -half, half * 2, half * 2);

    // Brick lines
    this.gfx.lineStyle(1, 0x455a64, 0.6);
    this.gfx.moveTo(-half, 0);
    this.gfx.lineTo(half, 0);
    this.gfx.moveTo(0, -half);
    this.gfx.lineTo(0, 0);
    this.gfx.moveTo(-half + half, 0);
    this.gfx.lineTo(-half + half, half);
    this.gfx.strokePath();

    // Border
    this.gfx.lineStyle(1, 0x90a4ae, 0.5);
    this.gfx.strokeRect(-half, -half, half * 2, half * 2);

    scene.add.existing(this);
  }
}
