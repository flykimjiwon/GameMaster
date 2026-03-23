import Phaser from 'phaser';
import { GRID_COLS, GRID_ROWS, CELL_SIZE, GRID_OFFSET_X, GRID_OFFSET_Y, CellState } from '../config';

export interface GridCell {
  col: number;
  row: number;
  state: CellState;
  towerId: string | null;
  worldX: number;
  worldY: number;
}

export class GridSystem {
  cells: GridCell[][] = [];
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
    this.initGrid();
  }

  private initGrid(): void {
    for (let row = 0; row < GRID_ROWS; row++) {
      this.cells[row] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        const { x, y } = this.cellToWorld(col, row);
        this.cells[row][col] = {
          col,
          row,
          state: 'empty',
          towerId: null,
          worldX: x,
          worldY: y,
        };
      }
    }
  }

  cellToWorld(col: number, row: number): { x: number; y: number } {
    return {
      x: GRID_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2,
      y: GRID_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2,
    };
  }

  worldToCell(x: number, y: number): { col: number; row: number } | null {
    const col = Math.floor((x - GRID_OFFSET_X) / CELL_SIZE);
    const row = Math.floor((y - GRID_OFFSET_Y) / CELL_SIZE);
    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      return { col, row };
    }
    return null;
  }

  getCell(col: number, row: number): GridCell | null {
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
      return this.cells[row][col];
    }
    return null;
  }

  setCellState(col: number, row: number, state: CellState, towerId: string | null = null): void {
    const cell = this.getCell(col, row);
    if (cell) {
      cell.state = state;
      cell.towerId = towerId;
    }
  }

  draw(pathCells: Set<string>): void {
    this.graphics.clear();
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = GRID_OFFSET_X + col * CELL_SIZE;
        const y = GRID_OFFSET_Y + row * CELL_SIZE;
        const key = `${col},${row}`;

        if (pathCells.has(key)) {
          this.graphics.fillStyle(0xcccccc, 0.3);
          this.cells[row][col].state = 'path';
        } else {
          this.graphics.fillStyle(0x2a3a2a, 0.5);
        }
        this.graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        this.graphics.lineStyle(1, 0x4a5a4a, 0.8);
        this.graphics.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  highlightCell(col: number, row: number, color: number): void {
    const x = GRID_OFFSET_X + col * CELL_SIZE;
    const y = GRID_OFFSET_Y + row * CELL_SIZE;
    this.graphics.fillStyle(color, 0.4);
    this.graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);
  }
}
