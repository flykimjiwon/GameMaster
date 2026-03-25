import Phaser from 'phaser';
import { TowerType, TOWER_COLORS, TETROMINO_SHAPES, TetrominoName } from '../config/tetrominos';
import { Grid, CELL_SIZE, GRID_COLS, GRID_ROWS } from './Grid';

export class Tetromino {
  private scene: Phaser.Scene;
  private grid: Grid;
  private graphics: Phaser.GameObjects.Graphics;
  private ghostGraphics: Phaser.GameObjects.Graphics;

  public name: TetrominoName;
  public towerType: TowerType;
  public rotationIndex: number = 0;

  // Top-left of the bounding box in grid coordinates
  public gridRow: number = 0;
  public gridCol: number = 0;

  private locked: boolean = false;

  constructor(
    scene: Phaser.Scene,
    grid: Grid,
    name: TetrominoName,
    towerType: TowerType
  ) {
    this.scene = scene;
    this.grid = grid;
    this.name = name;
    this.towerType = towerType;
    this.rotationIndex = 0;

    // Spawn at top center
    const shape = TETROMINO_SHAPES[name];
    const cells = shape.rotations[0];
    const maxCol = Math.max(...cells.map(([, c]) => c));
    this.gridCol = Math.floor((GRID_COLS - maxCol - 1) / 2);
    this.gridRow = 0;

    this.graphics = scene.add.graphics();
    this.ghostGraphics = scene.add.graphics();
    this.graphics.setDepth(10);
    this.ghostGraphics.setDepth(9);

    this.draw();
  }

  getCells(): Array<[number, number]> {
    const shape = TETROMINO_SHAPES[this.name];
    const rotation = shape.rotations[this.rotationIndex];
    return rotation.map(([dr, dc]) => [this.gridRow + dr, this.gridCol + dc]);
  }

  private getGhostRow(): number {
    let ghostRow = this.gridRow;
    while (this.canPlace(ghostRow + 1, this.gridCol, this.rotationIndex)) {
      ghostRow++;
    }
    return ghostRow;
  }

  canPlace(row: number, col: number, rotIndex: number): boolean {
    const shape = TETROMINO_SHAPES[this.name];
    const rotation = shape.rotations[rotIndex];
    for (const [dr, dc] of rotation) {
      const r = row + dr;
      const c = col + dc;
      if (c < 0 || c >= GRID_COLS) return false;
      if (r >= GRID_ROWS) return false;
      if (r >= 0 && !this.grid.isCellEmpty(r, c)) return false;
    }
    return true;
  }

  moveLeft(): boolean {
    if (this.locked) return false;
    if (this.canPlace(this.gridRow, this.gridCol - 1, this.rotationIndex)) {
      this.gridCol--;
      this.draw();
      return true;
    }
    return false;
  }

  moveRight(): boolean {
    if (this.locked) return false;
    if (this.canPlace(this.gridRow, this.gridCol + 1, this.rotationIndex)) {
      this.gridCol++;
      this.draw();
      return true;
    }
    return false;
  }

  moveDown(): boolean {
    if (this.locked) return false;
    if (this.canPlace(this.gridRow + 1, this.gridCol, this.rotationIndex)) {
      this.gridRow++;
      this.draw();
      return true;
    }
    return false;
  }

  rotateClockwise(): boolean {
    if (this.locked) return false;
    const nextRot = (this.rotationIndex + 1) % 4;

    // SRS wall kicks: try offsets
    const kicks: Array<[number, number]> = [
      [0, 0], [0, -1], [0, 1], [-1, 0], [1, 0],
      [0, -2], [0, 2], [-1, -1], [-1, 1],
    ];
    for (const [dr, dc] of kicks) {
      if (this.canPlace(this.gridRow + dr, this.gridCol + dc, nextRot)) {
        this.rotationIndex = nextRot;
        this.gridRow += dr;
        this.gridCol += dc;
        this.draw();
        return true;
      }
    }
    return false;
  }

  rotateCounterClockwise(): boolean {
    if (this.locked) return false;
    const nextRot = (this.rotationIndex + 3) % 4;

    const kicks: Array<[number, number]> = [
      [0, 0], [0, 1], [0, -1], [-1, 0], [1, 0],
    ];
    for (const [dr, dc] of kicks) {
      if (this.canPlace(this.gridRow + dr, this.gridCol + dc, nextRot)) {
        this.rotationIndex = nextRot;
        this.gridRow += dr;
        this.gridCol += dc;
        this.draw();
        return true;
      }
    }
    return false;
  }

  hardDrop(): void {
    if (this.locked) return;
    while (this.canPlace(this.gridRow + 1, this.gridCol, this.rotationIndex)) {
      this.gridRow++;
    }
    this.draw();
  }

  isAtBottom(): boolean {
    return !this.canPlace(this.gridRow + 1, this.gridCol, this.rotationIndex);
  }

  draw(): void {
    this.graphics.clear();
    this.ghostGraphics.clear();

    const color = TOWER_COLORS[this.towerType];
    const ghostRow = this.getGhostRow();
    const shape = TETROMINO_SHAPES[this.name];
    const rotation = shape.rotations[this.rotationIndex];

    // Draw ghost
    this.ghostGraphics.lineStyle(1, color, 0.35);
    for (const [dr, dc] of rotation) {
      const r = ghostRow + dr;
      const c = this.gridCol + dc;
      if (r >= 0) {
        const [wx, wy] = this.grid.gridToWorld(r, c);
        const x = wx - CELL_SIZE / 2;
        const y = wy - CELL_SIZE / 2;
        this.ghostGraphics.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }
    }

    // Draw actual piece
    this.graphics.fillStyle(color, 0.9);
    this.graphics.lineStyle(1, 0xffffff, 0.3);
    for (const [dr, dc] of rotation) {
      const r = this.gridRow + dr;
      const c = this.gridCol + dc;
      if (r >= 0) {
        const [wx, wy] = this.grid.gridToWorld(r, c);
        const x = wx - CELL_SIZE / 2;
        const y = wy - CELL_SIZE / 2;
        this.graphics.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        this.graphics.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }
    }
  }

  lock(): void {
    this.locked = true;
    this.graphics.clear();
    this.ghostGraphics.clear();
  }

  destroy(): void {
    this.graphics.destroy();
    this.ghostGraphics.destroy();
  }

  // Draw preview in a given pixel area (for next/hold panels)
  static drawPreview(
    graphics: Phaser.GameObjects.Graphics,
    name: TetrominoName,
    towerType: TowerType,
    centerX: number,
    centerY: number,
    cellSize: number = 16
  ): void {
    const shape = TETROMINO_SHAPES[name];
    const rotation = shape.rotations[0];
    const color = TOWER_COLORS[towerType];

    const rows = rotation.map(([r]) => r);
    const cols = rotation.map(([, c]) => c);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    const h = maxRow - minRow + 1;
    const w = maxCol - minCol + 1;

    const startX = centerX - (w * cellSize) / 2;
    const startY = centerY - (h * cellSize) / 2;

    graphics.fillStyle(color, 0.9);
    for (const [dr, dc] of rotation) {
      const x = startX + (dc - minCol) * cellSize;
      const y = startY + (dr - minRow) * cellSize;
      graphics.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
    }
  }
}
