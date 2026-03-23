import Phaser from 'phaser';
import { GRID_OFFSET_X, GRID_OFFSET_Y, CELL_SIZE, GRID_COLS, GRID_ROWS } from '../config';

export class PathSystem {
  waypoints: Phaser.Math.Vector2[] = [];
  pathCells: Set<string> = new Set();
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
    this.buildSPath();
  }

  private buildSPath(): void {
    // S-shaped path that winds through the grid area
    // Path goes: top-right → top-left → bottom-left → bottom-right
    const gridLeft = GRID_OFFSET_X;
    const gridRight = GRID_OFFSET_X + GRID_COLS * CELL_SIZE;
    const gridTop = GRID_OFFSET_Y;
    const gridBottom = GRID_OFFSET_Y + GRID_ROWS * CELL_SIZE;
    // Entry from top-right
    this.waypoints = [
      new Phaser.Math.Vector2(gridRight + 40, gridTop - 30),
      new Phaser.Math.Vector2(gridRight - 20, gridTop + 20),
      new Phaser.Math.Vector2(gridLeft + 20, gridTop + 20),
      new Phaser.Math.Vector2(gridLeft + 20, gridTop + CELL_SIZE + 40),
      new Phaser.Math.Vector2(gridRight - 20, gridTop + CELL_SIZE + 40),
      new Phaser.Math.Vector2(gridRight - 20, gridBottom - 20),
      new Phaser.Math.Vector2(gridLeft + 20, gridBottom - 20),
      new Phaser.Math.Vector2(gridLeft - 40, gridBottom + 30),
    ];

    // Mark cells near the path
    this.computePathCells();
  }

  private computePathCells(): void {
    // Sample points along path segments and mark nearby cells
    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const a = this.waypoints[i];
      const b = this.waypoints[i + 1];
      const dist = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      const steps = Math.ceil(dist / 10);
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const px = a.x + (b.x - a.x) * t;
        const py = a.y + (b.y - a.y) * t;
        const col = Math.floor((px - GRID_OFFSET_X) / CELL_SIZE);
        const row = Math.floor((py - GRID_OFFSET_Y) / CELL_SIZE);
        if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
          this.pathCells.add(`${col},${row}`);
        }
      }
    }
  }

  draw(): void {
    this.graphics.clear();
    this.graphics.lineStyle(4, 0xcccccc, 0.6);
    this.graphics.beginPath();
    this.graphics.moveTo(this.waypoints[0].x, this.waypoints[0].y);
    for (let i = 1; i < this.waypoints.length; i++) {
      this.graphics.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }
    this.graphics.strokePath();

    // Draw entry/exit markers
    const entry = this.waypoints[0];
    const exit = this.waypoints[this.waypoints.length - 1];

    this.graphics.fillStyle(0x44cc44, 0.8);
    this.graphics.fillTriangle(
      entry.x + 10, entry.y - 10,
      entry.x + 10, entry.y + 10,
      entry.x - 5, entry.y,
    );

    this.graphics.fillStyle(0xcc4444, 0.8);
    this.graphics.fillTriangle(
      exit.x - 10, exit.y - 10,
      exit.x - 10, exit.y + 10,
      exit.x + 5, exit.y,
    );
  }

  getPositionAtProgress(progress: number): Phaser.Math.Vector2 {
    // progress: 0..1 along entire path
    const totalLength = this.getTotalLength();
    let targetDist = progress * totalLength;
    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const a = this.waypoints[i];
      const b = this.waypoints[i + 1];
      const segLen = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      if (targetDist <= segLen) {
        const t = targetDist / segLen;
        return new Phaser.Math.Vector2(
          a.x + (b.x - a.x) * t,
          a.y + (b.y - a.y) * t,
        );
      }
      targetDist -= segLen;
    }
    return this.waypoints[this.waypoints.length - 1].clone();
  }

  getTotalLength(): number {
    let total = 0;
    for (let i = 0; i < this.waypoints.length - 1; i++) {
      total += Phaser.Math.Distance.Between(
        this.waypoints[i].x, this.waypoints[i].y,
        this.waypoints[i + 1].x, this.waypoints[i + 1].y,
      );
    }
    return total;
  }
}
