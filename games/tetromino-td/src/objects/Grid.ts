import Phaser from 'phaser';
import { TowerType, TOWER_COLORS } from '../config/tetrominos';

export const GRID_COLS = 10;
export const GRID_ROWS = 20;
export const CELL_SIZE = 32;

export type CellState = null | TowerType;

export interface GridCell {
  type: CellState;
  level: number;
}

export class Grid {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private cellGraphics: Phaser.GameObjects.Graphics;
  public offsetX: number;
  public offsetY: number;

  // [row][col]
  private cells: GridCell[][];

  constructor(scene: Phaser.Scene, offsetX: number, offsetY: number) {
    this.scene = scene;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    this.cells = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      this.cells[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        this.cells[r][c] = { type: null, level: 1 };
      }
    }

    this.graphics = scene.add.graphics();
    this.cellGraphics = scene.add.graphics();
    this.drawGrid();
  }

  private drawGrid(): void {
    this.graphics.clear();
    // Background
    this.graphics.fillStyle(0x111111, 1);
    this.graphics.fillRect(
      this.offsetX,
      this.offsetY,
      GRID_COLS * CELL_SIZE,
      GRID_ROWS * CELL_SIZE
    );

    // Grid lines
    this.graphics.lineStyle(1, 0x222222, 1);
    for (let r = 0; r <= GRID_ROWS; r++) {
      this.graphics.lineBetween(
        this.offsetX,
        this.offsetY + r * CELL_SIZE,
        this.offsetX + GRID_COLS * CELL_SIZE,
        this.offsetY + r * CELL_SIZE
      );
    }
    for (let c = 0; c <= GRID_COLS; c++) {
      this.graphics.lineBetween(
        this.offsetX + c * CELL_SIZE,
        this.offsetY,
        this.offsetX + c * CELL_SIZE,
        this.offsetY + GRID_ROWS * CELL_SIZE
      );
    }

    // Border
    this.graphics.lineStyle(2, 0x444444, 1);
    this.graphics.strokeRect(
      this.offsetX,
      this.offsetY,
      GRID_COLS * CELL_SIZE,
      GRID_ROWS * CELL_SIZE
    );
  }

  redrawCells(): void {
    this.cellGraphics.clear();
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cell = this.cells[r][c];
        if (cell.type !== null) {
          this.drawCell(r, c, TOWER_COLORS[cell.type], cell.level);
        }
      }
    }
  }

  private drawCell(row: number, col: number, color: number, level: number): void {
    const x = this.offsetX + col * CELL_SIZE;
    const y = this.offsetY + row * CELL_SIZE;
    const pad = 2;

    this.cellGraphics.fillStyle(color, 0.85);
    this.cellGraphics.fillRect(x + pad, y + pad, CELL_SIZE - pad * 2, CELL_SIZE - pad * 2);

    // Level indicator dots
    if (level > 1) {
      this.cellGraphics.fillStyle(0xffffff, 0.9);
      const dotSize = 3;
      for (let i = 0; i < Math.min(level - 1, 3); i++) {
        this.cellGraphics.fillRect(
          x + pad + 3 + i * 5,
          y + CELL_SIZE - pad - 5,
          dotSize,
          dotSize
        );
      }
    }
  }

  isCellEmpty(row: number, col: number): boolean {
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return false;
    return this.cells[row][col].type === null;
  }

  isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
  }

  getCellType(row: number, col: number): CellState {
    if (!this.isInBounds(row, col)) return null;
    return this.cells[row][col].type;
  }

  getCellLevel(row: number, col: number): number {
    if (!this.isInBounds(row, col)) return 1;
    return this.cells[row][col].level;
  }

  setCellTower(row: number, col: number, type: TowerType, level: number = 1): void {
    if (!this.isInBounds(row, col)) return;
    this.cells[row][col] = { type, level };
  }

  clearCell(row: number, col: number): void {
    if (!this.isInBounds(row, col)) return;
    this.cells[row][col] = { type: null, level: 1 };
  }

  isRowFull(row: number): boolean {
    for (let c = 0; c < GRID_COLS; c++) {
      if (this.cells[row][c].type === null) return false;
    }
    return true;
  }

  // Returns array of full row indices
  getFullRows(): number[] {
    const full: number[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      if (this.isRowFull(r)) full.push(r);
    }
    return full;
  }

  // Returns types of all towers in a row (for line-clear attack)
  getRowTowerTypes(row: number): TowerType[] {
    const types: TowerType[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const t = this.cells[row][c].type;
      if (t !== null) types.push(t);
    }
    return types;
  }

  clearRow(row: number): void {
    for (let c = 0; c < GRID_COLS; c++) {
      this.cells[row][c] = { type: null, level: 1 };
    }
    // Shift rows down
    for (let r = row; r > 0; r--) {
      for (let c = 0; c < GRID_COLS; c++) {
        this.cells[r][c] = { ...this.cells[r - 1][c] };
      }
    }
    // Clear top row
    for (let c = 0; c < GRID_COLS; c++) {
      this.cells[0][c] = { type: null, level: 1 };
    }
  }

  // Returns adjacent cells of the same type for level-up checks
  getAdjacentSameColor(row: number, col: number): Array<[number, number]> {
    const type = this.getCellType(row, col);
    if (type === null) return [];

    const visited = new Set<string>();
    const result: Array<[number, number]> = [];
    const queue: Array<[number, number]> = [[row, col]];

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const key = `${r},${c}`;
      if (visited.has(key)) continue;
      visited.add(key);
      result.push([r, c]);

      const neighbors: Array<[number, number]> = [
        [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
      ];
      for (const [nr, nc] of neighbors) {
        if (this.isInBounds(nr, nc) && !visited.has(`${nr},${nc}`) && this.getCellType(nr, nc) === type) {
          queue.push([nr, nc]);
        }
      }
    }
    return result;
  }

  // Build a 2D walkability map for pathfinding (0=walkable, 1=blocked)
  buildWalkableMatrix(): number[][] {
    const matrix: number[][] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      matrix[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        matrix[r][c] = this.cells[r][c].type !== null ? 1 : 0;
      }
    }
    return matrix;
  }

  worldToGrid(worldX: number, worldY: number): [number, number] {
    const col = Math.floor((worldX - this.offsetX) / CELL_SIZE);
    const row = Math.floor((worldY - this.offsetY) / CELL_SIZE);
    return [row, col];
  }

  gridToWorld(row: number, col: number): [number, number] {
    const x = this.offsetX + col * CELL_SIZE + CELL_SIZE / 2;
    const y = this.offsetY + row * CELL_SIZE + CELL_SIZE / 2;
    return [x, y];
  }

  getCells(): GridCell[][] {
    return this.cells;
  }

  getDepth(): number {
    return this.graphics.depth;
  }

  setDepth(d: number): void {
    this.graphics.setDepth(d);
    this.cellGraphics.setDepth(d + 1);
  }

  destroy(): void {
    this.graphics.destroy();
    this.cellGraphics.destroy();
  }
}
