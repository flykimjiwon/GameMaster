import Phaser from 'phaser';
import { Unit } from './Unit';
import { UnitType, UNIT_STATS, UNIT_TYPES, MERGE_GRID_COLS, MERGE_GRID_ROWS } from '../config/units';

export class MergeGrid {
  scene: Phaser.Scene;
  cells: (Unit | null)[][];
  gridGraphics: Phaser.GameObjects.Graphics;
  offsetX: number;
  offsetY: number;
  cellSize: number;

  private readonly PADDING = 10;

  constructor(scene: Phaser.Scene, x: number, y: number, totalWidth: number, totalHeight: number) {
    this.scene = scene;
    this.cells = Array.from({ length: MERGE_GRID_ROWS }, () => Array(MERGE_GRID_COLS).fill(null));

    const availW = totalWidth - this.PADDING * 2;
    const availH = totalHeight - this.PADDING * 2;
    this.cellSize = Math.floor(Math.min(availW / MERGE_GRID_COLS, availH / MERGE_GRID_ROWS));

    const gridW = this.cellSize * MERGE_GRID_COLS;
    const gridH = this.cellSize * MERGE_GRID_ROWS;
    this.offsetX = x + Math.floor((totalWidth - gridW) / 2);
    this.offsetY = y + Math.floor((totalHeight - gridH) / 2);

    this.gridGraphics = scene.add.graphics();
    this.drawGrid();
  }

  drawGrid(): void {
    const g = this.gridGraphics;
    g.clear();

    const gridW = this.cellSize * MERGE_GRID_COLS;
    const gridH = this.cellSize * MERGE_GRID_ROWS;

    // Background
    g.fillStyle(0x111122, 0.95);
    g.fillRect(this.offsetX, this.offsetY, gridW, gridH);

    // Grid lines
    g.lineStyle(1, 0x334466, 0.8);
    for (let col = 0; col <= MERGE_GRID_COLS; col++) {
      const x = this.offsetX + col * this.cellSize;
      g.lineBetween(x, this.offsetY, x, this.offsetY + gridH);
    }
    for (let row = 0; row <= MERGE_GRID_ROWS; row++) {
      const y = this.offsetY + row * this.cellSize;
      g.lineBetween(this.offsetX, y, this.offsetX + gridW, y);
    }

    // Border
    g.lineStyle(2, 0x5566AA, 1);
    g.strokeRect(this.offsetX, this.offsetY, gridW, gridH);
  }

  highlightCell(col: number, row: number, color: number): void {
    const pos = this.gridToWorld(col, row);
    this.gridGraphics.fillStyle(color, 0.3);
    this.gridGraphics.fillRect(
      pos.x - this.cellSize / 2,
      pos.y - this.cellSize / 2,
      this.cellSize,
      this.cellSize
    );
  }

  clearHighlights(): void {
    this.drawGrid();
  }

  placeUnit(unit: Unit, col: number, row: number): void {
    this.cells[row][col] = unit;
    unit.gridCol = col;
    unit.gridRow = row;
    unit.isDeployed = false;
    const pos = this.gridToWorld(col, row);
    unit.setPosition(pos.x, pos.y);
    unit.setDepth(10);
  }

  removeUnit(col: number, row: number): Unit | null {
    const unit = this.cells[row][col];
    this.cells[row][col] = null;
    if (unit) {
      unit.gridCol = -1;
      unit.gridRow = -1;
    }
    return unit;
  }

  getUnit(col: number, row: number): Unit | null {
    if (row < 0 || row >= MERGE_GRID_ROWS || col < 0 || col >= MERGE_GRID_COLS) return null;
    return this.cells[row][col];
  }

  findEmptyCell(): { col: number; row: number } | null {
    for (let row = 0; row < MERGE_GRID_ROWS; row++) {
      for (let col = 0; col < MERGE_GRID_COLS; col++) {
        if (!this.cells[row][col]) return { col, row };
      }
    }
    return null;
  }

  worldToGrid(wx: number, wy: number): { col: number; row: number } | null {
    const col = Math.floor((wx - this.offsetX) / this.cellSize);
    const row = Math.floor((wy - this.offsetY) / this.cellSize);
    if (col < 0 || col >= MERGE_GRID_COLS || row < 0 || row >= MERGE_GRID_ROWS) return null;
    return { col, row };
  }

  gridToWorld(col: number, row: number): { x: number; y: number } {
    return {
      x: this.offsetX + col * this.cellSize + this.cellSize / 2,
      y: this.offsetY + row * this.cellSize + this.cellSize / 2,
    };
  }

  isFull(): boolean {
    return this.findEmptyCell() === null;
  }

  getUnitCount(): number {
    let count = 0;
    for (let row = 0; row < MERGE_GRID_ROWS; row++) {
      for (let col = 0; col < MERGE_GRID_COLS; col++) {
        if (this.cells[row][col]) count++;
      }
    }
    return count;
  }

  spawnRandom(upgradeMultipliers: { hp: number; attack: number }): Unit | null {
    const empty = this.findEmptyCell();
    if (!empty) return null;

    const typeIndex = Math.floor(Math.random() * UNIT_TYPES.length);
    const unitType: UnitType = UNIT_TYPES[typeIndex];
    const baseStats = UNIT_STATS[unitType][0];
    const stats = {
      ...baseStats,
      hp: Math.round(baseStats.hp * upgradeMultipliers.hp),
      attack: Math.round(baseStats.attack * upgradeMultipliers.attack),
    };

    const pos = this.gridToWorld(empty.col, empty.row);
    const unit = new Unit(this.scene, pos.x, pos.y, unitType, 1, stats);
    this.placeUnit(unit, empty.col, empty.row);

    // Spawn animation
    unit.setAlpha(0);
    unit.setScale(0.3);
    this.scene.tweens.add({
      targets: unit,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 250,
      ease: 'Back.easeOut',
    });

    return unit;
  }

  getAllUnits(): Unit[] {
    const units: Unit[] = [];
    for (let row = 0; row < MERGE_GRID_ROWS; row++) {
      for (let col = 0; col < MERGE_GRID_COLS; col++) {
        const u = this.cells[row][col];
        if (u) units.push(u);
      }
    }
    return units;
  }

  isInsideGrid(wx: number, wy: number): boolean {
    const gridW = this.cellSize * MERGE_GRID_COLS;
    const gridH = this.cellSize * MERGE_GRID_ROWS;
    return (
      wx >= this.offsetX &&
      wx <= this.offsetX + gridW &&
      wy >= this.offsetY &&
      wy <= this.offsetY + gridH
    );
  }
}
