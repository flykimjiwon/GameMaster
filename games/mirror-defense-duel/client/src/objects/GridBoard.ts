import Phaser from "phaser";
import {
  GRID_SIZE,
  ENTRY_Y,
  BASE_Y,
  BASE_X,
  PLACEMENT_ROW_MIN,
  PLACEMENT_ROW_MAX,
} from "../config/balance";

export class GridBoard extends Phaser.GameObjects.Container {
  private cellSize: number;
  private gridGraphics: Phaser.GameObjects.Graphics;
  private overlayGraphics: Phaser.GameObjects.Graphics;
  private cells: Map<string, number> = new Map(); // "x,y" → color

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    cellSize: number,
    private interactive: boolean = false
  ) {
    super(scene, x, y);
    this.cellSize = cellSize;

    this.gridGraphics = scene.add.graphics();
    this.overlayGraphics = scene.add.graphics();
    this.add(this.gridGraphics);
    this.add(this.overlayGraphics);

    this.drawGrid();
    scene.add.existing(this);
  }

  private drawGrid(): void {
    const g = this.gridGraphics;
    g.clear();

    const totalSize = GRID_SIZE * this.cellSize;

    // Background
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(0, 0, totalSize, totalSize);

    // Entry zone (row 0)
    g.fillStyle(0x00c853, 0.15);
    g.fillRect(0, 0, totalSize, this.cellSize);

    // Base zone (row 9)
    g.fillStyle(0xff1744, 0.15);
    g.fillRect(0, BASE_Y * this.cellSize, totalSize, this.cellSize);

    // Placement zone highlight
    g.fillStyle(0xffffff, 0.03);
    g.fillRect(
      0,
      PLACEMENT_ROW_MIN * this.cellSize,
      totalSize,
      (PLACEMENT_ROW_MAX - PLACEMENT_ROW_MIN + 1) * this.cellSize
    );

    // Grid lines
    g.lineStyle(1, 0x333366, 0.5);
    for (let i = 0; i <= GRID_SIZE; i++) {
      g.moveTo(i * this.cellSize, 0);
      g.lineTo(i * this.cellSize, totalSize);
      g.moveTo(0, i * this.cellSize);
      g.lineTo(totalSize, i * this.cellSize);
    }
    g.strokePath();

    // Entry marker
    g.fillStyle(0x00e676, 0.6);
    g.fillTriangle(
      BASE_X * this.cellSize + this.cellSize / 2,
      2,
      BASE_X * this.cellSize + 4,
      this.cellSize - 4,
      (BASE_X + 1) * this.cellSize - 4,
      this.cellSize - 4
    );

    // Base marker
    g.fillStyle(0xff5252, 0.8);
    const bx = BASE_X * this.cellSize + this.cellSize / 2;
    const by = BASE_Y * this.cellSize + this.cellSize / 2;
    g.fillCircle(bx, by, this.cellSize / 3);
  }

  setCell(gridX: number, gridY: number, color: number, alpha: number = 0.6): void {
    const key = `${gridX},${gridY}`;
    this.cells.set(key, color);
    this.redrawOverlay();
  }

  clearCell(gridX: number, gridY: number): void {
    this.cells.delete(`${gridX},${gridY}`);
    this.redrawOverlay();
  }

  clearAllCells(): void {
    this.cells.clear();
    this.redrawOverlay();
  }

  private redrawOverlay(): void {
    const g = this.overlayGraphics;
    g.clear();

    for (const [key, color] of this.cells) {
      const [x, y] = key.split(",").map(Number);
      g.fillStyle(color, 0.6);
      g.fillRect(
        x * this.cellSize + 1,
        y * this.cellSize + 1,
        this.cellSize - 2,
        this.cellSize - 2
      );
    }
  }

  drawPath(path: number[][], color: number = 0x00e676): void {
    const g = this.overlayGraphics;
    // Draw path dots
    for (const [px, py] of path) {
      g.fillStyle(color, 0.3);
      g.fillCircle(
        px * this.cellSize + this.cellSize / 2,
        py * this.cellSize + this.cellSize / 2,
        this.cellSize / 6
      );
    }
  }

  worldToGrid(worldX: number, worldY: number): { gridX: number; gridY: number } | null {
    const localX = worldX - this.x;
    const localY = worldY - this.y;
    const gridX = Math.floor(localX / this.cellSize);
    const gridY = Math.floor(localY / this.cellSize);

    if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) {
      return null;
    }
    return { gridX, gridY };
  }

  gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: this.x + gridX * this.cellSize + this.cellSize / 2,
      y: this.y + gridY * this.cellSize + this.cellSize / 2,
    };
  }

  getCellSize(): number {
    return this.cellSize;
  }

  getTotalSize(): number {
    return GRID_SIZE * this.cellSize;
  }
}
