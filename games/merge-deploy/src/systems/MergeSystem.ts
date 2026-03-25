import Phaser from 'phaser';
import { Unit } from '../objects/Unit';
import { MergeGrid } from '../objects/MergeGrid';
import { UNIT_STATS, MAX_TIER } from '../config/units';

export class MergeSystem {
  scene: Phaser.Scene;
  grid: MergeGrid;
  dragUnit: Unit | null = null;
  dragStartCol: number = -1;
  dragStartRow: number = -1;
  private dragGhost: Phaser.GameObjects.Graphics | null = null;
  private upgradeMultipliers: { hp: number; attack: number };

  onMergeCallback: ((unit: Unit) => void) | null = null;

  constructor(scene: Phaser.Scene, grid: MergeGrid, upgradeMultipliers: { hp: number; attack: number }) {
    this.scene = scene;
    this.grid = grid;
    this.upgradeMultipliers = upgradeMultipliers;
    this.setupInput();
  }

  private setupInput(): void {
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('pointerup', this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    const cell = this.grid.worldToGrid(pointer.x, pointer.y);
    if (!cell) return;

    const unit = this.grid.getUnit(cell.col, cell.row);
    if (!unit) return;

    this.dragUnit = unit;
    this.dragStartCol = cell.col;
    this.dragStartRow = cell.row;

    // Ghost for drag visual
    this.dragGhost = this.scene.add.graphics();
    this.dragGhost.setDepth(100);
    this.drawDragGhost(pointer.x, pointer.y);

    unit.setAlpha(0.4);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.dragUnit || !pointer.isDown) return;
    this.drawDragGhost(pointer.x, pointer.y);

    // Highlight target cell
    this.grid.clearHighlights();
    const targetCell = this.grid.worldToGrid(pointer.x, pointer.y);
    if (targetCell) {
      const targetUnit = this.grid.getUnit(targetCell.col, targetCell.row);
      if (targetUnit && targetUnit !== this.dragUnit &&
          targetUnit.unitType === this.dragUnit.unitType &&
          targetUnit.tier === this.dragUnit.tier &&
          targetUnit.tier < MAX_TIER) {
        this.grid.highlightCell(targetCell.col, targetCell.row, 0x00ffff);
      } else if (targetUnit && targetUnit !== this.dragUnit) {
        this.grid.highlightCell(targetCell.col, targetCell.row, 0xffaa00);
      } else if (!targetUnit) {
        this.grid.highlightCell(targetCell.col, targetCell.row, 0x44ff44);
      }
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.dragUnit) return;

    const unit = this.dragUnit;
    const startCol = this.dragStartCol;
    const startRow = this.dragStartRow;

    this.dragUnit = null;
    this.dragStartCol = -1;
    this.dragStartRow = -1;

    if (this.dragGhost) {
      this.dragGhost.destroy();
      this.dragGhost = null;
    }
    this.grid.clearHighlights();

    unit.setAlpha(1);

    const targetCell = this.grid.worldToGrid(pointer.x, pointer.y);

    if (!targetCell) {
      // Dropped outside grid — return to original
      this.returnToCell(unit, startCol, startRow);
      return;
    }

    if (targetCell.col === startCol && targetCell.row === startRow) {
      // Same cell — no op
      return;
    }

    const targetUnit = this.grid.getUnit(targetCell.col, targetCell.row);

    if (targetUnit && targetUnit !== unit) {
      if (targetUnit.unitType === unit.unitType &&
          targetUnit.tier === unit.tier &&
          unit.tier < MAX_TIER) {
        // MERGE
        this.doMerge(unit, targetUnit, startCol, startRow, targetCell.col, targetCell.row);
      } else {
        // SWAP
        this.grid.removeUnit(startCol, startRow);
        this.grid.removeUnit(targetCell.col, targetCell.row);
        this.grid.placeUnit(unit, targetCell.col, targetCell.row);
        this.grid.placeUnit(targetUnit, startCol, startRow);
      }
    } else if (!targetUnit) {
      // MOVE to empty cell
      this.grid.removeUnit(startCol, startRow);
      this.grid.placeUnit(unit, targetCell.col, targetCell.row);
    } else {
      this.returnToCell(unit, startCol, startRow);
    }
  }

  private returnToCell(unit: Unit, col: number, row: number): void {
    const pos = this.grid.gridToWorld(col, row);
    this.scene.tweens.add({
      targets: unit,
      x: pos.x,
      y: pos.y,
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  private doMerge(
    src: Unit, dst: Unit,
    srcCol: number, srcRow: number,
    dstCol: number, dstRow: number
  ): void {
    const newTier = dst.tier + 1;
    const baseStats = UNIT_STATS[dst.unitType][newTier - 1];
    const newStats = {
      ...baseStats,
      hp: Math.round(baseStats.hp * this.upgradeMultipliers.hp),
      attack: Math.round(baseStats.attack * this.upgradeMultipliers.attack),
    };

    // Remove source
    this.grid.removeUnit(srcCol, srcRow);

    // Animate src flying to dst
    const dstPos = this.grid.gridToWorld(dstCol, dstRow);
    this.scene.tweens.add({
      targets: src,
      x: dstPos.x,
      y: dstPos.y,
      scaleX: 0,
      scaleY: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        src.destroy();
      },
    });

    // Upgrade dst in place
    this.scene.time.delayedCall(180, () => {
      this.grid.removeUnit(dstCol, dstRow);
      dst.destroy();

      const newPos = this.grid.gridToWorld(dstCol, dstRow);
      const newUnit = new Unit(this.scene, newPos.x, newPos.y, dst.unitType, newTier, newStats);
      this.grid.placeUnit(newUnit, dstCol, dstRow);
      newUnit.playMerge();

      this.playMergeEffect(newPos.x, newPos.y);

      // Auto-deploy on merge
      if (this.onMergeCallback) {
        this.onMergeCallback(newUnit);
      }
    });
  }

  playMergeEffect(x: number, y: number): void {
    const emitter = this.scene.add.particles(x, y, 'flares' as string, {
      speed: { min: 40, max: 120 },
      lifespan: 500,
      scale: { start: 0.4, end: 0 },
      quantity: 12,
      blendMode: 'ADD',
    });
    this.scene.time.delayedCall(600, () => emitter.destroy());

    // Fallback: manual sparkle rings
    const ring = this.scene.add.graphics();
    ring.lineStyle(2, 0xFFFFFF, 0.9);
    ring.strokeCircle(x, y, 5);
    ring.setDepth(50);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => ring.destroy(),
    });
  }

  private drawDragGhost(x: number, y: number): void {
    if (!this.dragGhost || !this.dragUnit) return;
    this.dragGhost.clear();
    this.dragGhost.lineStyle(2, 0xffffff, 0.6);
    this.dragGhost.strokeCircle(x, y, 22);
    this.dragGhost.fillStyle(0xffffff, 0.15);
    this.dragGhost.fillCircle(x, y, 22);
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    if (this.dragGhost) {
      this.dragGhost.destroy();
      this.dragGhost = null;
    }
  }
}
