import { Tower } from '../entities/Tower';
import { BuildScene } from '../scenes/BuildScene';
import { getTheme } from '../themes/ThemeSystem';

export class MergeSystem {
  constructor(private scene: BuildScene) {}

  merge(dragged: Tower, target: Tower, _col: number, _row: number): void {
    // Remove dragged tower from old cell
    if (dragged.isOnGrid) {
      this.scene.gridSystem.setCellState(dragged.gridCol, dragged.gridRow, 'empty', null);
      this.scene.towers.delete(dragged.id);
    }

    // Remove from panel if needed
    const panelIdx = this.scene.panelTowers.indexOf(dragged);
    if (panelIdx !== -1) {
      this.scene.panelTowers.splice(panelIdx, 1);
    }

    // Upgrade target
    const mergeType = target.towerType;
    target.upgradeTier();
    dragged.destroy();

    // Merge effects — pass tower type for color-aware particles
    this.playMergeEffect(target.x, target.y, mergeType);

    // Camera shake
    this.scene.cameras.main.shake(100, 0.005);
  }

  swap(dragged: Tower, target: Tower): void {
    if (dragged.isOnGrid && target.isOnGrid) {
      // Both on grid — swap positions
      const dCol = dragged.gridCol, dRow = dragged.gridRow;
      const tCol = target.gridCol, tRow = target.gridRow;

      const dPos = this.scene.gridSystem.cellToWorld(tCol, tRow);
      const tPos = this.scene.gridSystem.cellToWorld(dCol, dRow);

      // Update grid
      this.scene.gridSystem.setCellState(tCol, tRow, 'tower', dragged.id);
      this.scene.gridSystem.setCellState(dCol, dRow, 'tower', target.id);

      dragged.setGridPosition(tCol, tRow);
      target.setGridPosition(dCol, dRow);

      // Animate
      this.scene.tweens.add({ targets: dragged, x: dPos.x, y: dPos.y, duration: 200, ease: 'Power2' });
      this.scene.tweens.add({ targets: target, x: tPos.x, y: tPos.y, duration: 200, ease: 'Power2' });
    } else if (!dragged.isOnGrid && target.isOnGrid) {
      // Dragged from panel onto grid tower — place dragged, return target concept:
      // Actually swap: dragged goes to target's cell, target goes to panel?
      // Per spec: different tier → swap positions. If dragged is from panel, just place dragged and push target to panel
      const tCol = target.gridCol, tRow = target.gridRow;
      const pos = this.scene.gridSystem.cellToWorld(tCol, tRow);

      // Remove target from grid
      this.scene.gridSystem.setCellState(tCol, tRow, 'empty', null);
      this.scene.towers.delete(target.id);
      target.clearGridPosition();

      // Place dragged on grid
      this.scene.dragDropSystem.placeTower(dragged, tCol, tRow);

      // Move target to panel area
      const panelIdx = this.scene.panelTowers.length;
      const spacing = 80;
      const startX = (800 - 4 * spacing) / 2;
      const panelX = startX + panelIdx * spacing;
      const panelY = 550;
      target.x = pos.x;
      target.y = pos.y;
      this.scene.tweens.add({ targets: target, x: panelX, y: panelY, duration: 200, ease: 'Power2' });
      this.scene.panelTowers.push(target);
    } else {
      // Fallback: return to origin
      this.scene.dragDropSystem.returnToOrigin(dragged);
    }
  }

  private playMergeEffect(x: number, y: number, towerType?: Tower['towerType']): void {
    // Color-aware particle burst — use the tower's color palette
    const theme = getTheme();
    const towerColors: Record<string, number[]> = {
      archer: [0xFFEB3B, 0xFFC107, 0xF9A825],
      cannon: [0xFF1744, 0xD50000, 0xFF6D00],
      slow:   [0x448AFF, 0x1565C0, 0x82B1FF],
    };
    const colors = towerType && towerColors[towerType]
      ? towerColors[towerType]
      : theme.mergeParticleColors;

    // Outer burst — 12 particles flying outward
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const color = colors[i % colors.length];
      const dot = this.scene.add.circle(x, y, 4, color).setDepth(50);
      this.scene.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * 45,
        y: y + Math.sin(angle) * 45,
        alpha: 0,
        scale: 0.3,
        duration: 450,
        ease: 'Power2',
        onComplete: () => dot.destroy(),
      });
    }

    // Inner ring — smaller particles spiraling
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.2;
      const color = colors[(i + 1) % colors.length];
      const dot = this.scene.add.circle(x, y, 2, 0xFFFFFF).setDepth(51).setAlpha(0.9);
      this.scene.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20,
        alpha: 0,
        scale: 0,
        duration: 300,
        ease: 'Power1',
        onComplete: () => dot.destroy(),
      });
    }

    // Color deepening flash — a brief colored circle at center
    const flash = this.scene.add.circle(x, y, 18, colors[0], 0.6).setDepth(49);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2.5,
      duration: 350,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    // Scale pop on the merged tower
    const tower = this.findTowerAt(x, y);
    if (tower) {
      tower.setScale(0);
      this.scene.tweens.add({
        targets: tower,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
      });
    }
  }

  private findTowerAt(x: number, y: number): Tower | null {
    for (const tower of this.scene.towers.values()) {
      if (Math.abs(tower.x - x) < 5 && Math.abs(tower.y - y) < 5) {
        return tower;
      }
    }
    return null;
  }
}
