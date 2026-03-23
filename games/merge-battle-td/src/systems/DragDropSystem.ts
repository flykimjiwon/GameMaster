import Phaser from 'phaser';
import { Tower } from '../entities/Tower';
import { BuildScene } from '../scenes/BuildScene';
import { CELL_SIZE, GRID_OFFSET_X, GRID_OFFSET_Y } from '../config';

export class DragDropSystem {
  private enabled = true;
  private highlightGfx: Phaser.GameObjects.Graphics;
  private dragStartPos: { x: number; y: number } = { x: 0, y: 0 };

  constructor(private scene: BuildScene) {
    this.highlightGfx = scene.add.graphics().setDepth(5);
    this.setupDragEvents();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  makeDraggable(tower: Tower): void {
    tower.setInteractive({ draggable: true, useHandCursor: true });
    this.scene.input.setDraggable(tower);
  }

  private setupDragEvents(): void {
    this.scene.input.on('dragstart', (_pointer: Phaser.Input.Pointer, tower: Tower) => {
      if (!this.enabled) return;
      this.dragStartPos = { x: tower.x, y: tower.y };
      tower.setDepth(50);
      this.scene.hideStats();
    });

    this.scene.input.on('drag', (_pointer: Phaser.Input.Pointer, tower: Tower, dragX: number, dragY: number) => {
      if (!this.enabled) return;
      tower.x = dragX;
      tower.y = dragY;
      this.updateHighlight(tower);
    });

    this.scene.input.on('dragend', (_pointer: Phaser.Input.Pointer, tower: Tower) => {
      if (!this.enabled) return;
      tower.setDepth(10);
      this.highlightGfx.clear();
      this.handleDrop(tower);
    });

    // Click for stats
    this.scene.input.on('gameobjectdown', (_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
      if (obj instanceof Tower && obj.isOnGrid) {
        this.scene.showStats(obj);
      }
    });
  }

  private updateHighlight(tower: Tower): void {
    this.highlightGfx.clear();
    const cell = this.scene.gridSystem.worldToCell(tower.x, tower.y);
    if (!cell) return;

    const { col, row } = cell;
    const x = GRID_OFFSET_X + col * CELL_SIZE;
    const y = GRID_OFFSET_Y + row * CELL_SIZE;
    const gridCell = this.scene.gridSystem.getCell(col, row);
    if (!gridCell) return;

    if (gridCell.state === 'path') {
      // Red — can't place
      this.highlightGfx.fillStyle(0xcc4444, 0.4);
    } else if (gridCell.state === 'tower' && gridCell.towerId !== tower.id) {
      const targetTower = this.scene.towers.get(gridCell.towerId!);
      if (targetTower) {
        if (targetTower.towerType === tower.towerType && targetTower.tier === tower.tier && tower.tier < 3) {
          // Yellow — merge
          this.highlightGfx.fillStyle(0xcccc44, 0.4);
        } else {
          // Blue — swap
          this.highlightGfx.fillStyle(0x4488cc, 0.4);
        }
      }
    } else if (gridCell.state === 'empty' || gridCell.towerId === tower.id) {
      // Green — can place
      this.highlightGfx.fillStyle(0x44cc44, 0.4);
    }

    this.highlightGfx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
  }

  private handleDrop(tower: Tower): void {
    const cell = this.scene.gridSystem.worldToCell(tower.x, tower.y);

    if (!cell) {
      this.returnToOrigin(tower);
      return;
    }

    const { col, row } = cell;
    const gridCell = this.scene.gridSystem.getCell(col, row)!;

    if (gridCell.state === 'path') {
      this.returnToOrigin(tower);
      return;
    }

    if (gridCell.state === 'tower' && gridCell.towerId !== tower.id) {
      const targetTower = this.scene.towers.get(gridCell.towerId!)!;
      // Try merge or swap
      if (targetTower.towerType === tower.towerType && targetTower.tier === tower.tier && tower.tier < 3) {
        this.scene.mergeSystem.merge(tower, targetTower, col, row);
      } else {
        this.scene.mergeSystem.swap(tower, targetTower);
      }
      return;
    }

    // Place on empty cell (or same cell)
    this.placeTower(tower, col, row);
  }

  placeTower(tower: Tower, col: number, row: number): void {
    // Clear old cell
    if (tower.isOnGrid) {
      this.scene.gridSystem.setCellState(tower.gridCol, tower.gridRow, 'empty', null);
    }

    // Snap to cell with bounce
    const pos = this.scene.gridSystem.cellToWorld(col, row);
    tower.x = pos.x;
    tower.y = pos.y;
    tower.setGridPosition(col, row);

    // Bounce effect
    tower.setScale(0.5);
    this.scene.tweens.add({
      targets: tower,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });
    this.scene.gridSystem.setCellState(col, row, 'tower', tower.id);
    this.scene.towers.set(tower.id, tower);

    // Remove from panel
    const panelIdx = this.scene.panelTowers.indexOf(tower);
    if (panelIdx !== -1) {
      this.scene.panelTowers.splice(panelIdx, 1);
    }
  }

  returnToOrigin(tower: Tower): void {
    this.scene.tweens.add({
      targets: tower,
      x: this.dragStartPos.x,
      y: this.dragStartPos.y,
      duration: 200,
      ease: 'Back.easeOut',
    });
  }
}
