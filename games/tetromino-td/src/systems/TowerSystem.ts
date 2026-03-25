import Phaser from 'phaser';
import { TowerType } from '../config/tetrominos';
import { TOWER_CONFIGS, LEVEL_MULTIPLIERS } from '../config/towers';
import { Tower } from '../objects/Tower';
import { Enemy } from '../objects/Enemy';
import { Grid, CELL_SIZE, GRID_COLS, GRID_ROWS } from '../objects/Grid';

export class TowerSystem {
  private scene: Phaser.Scene;
  private grid: Grid;
  private offsetX: number;
  private offsetY: number;

  public towers: Tower[] = [];

  constructor(scene: Phaser.Scene, grid: Grid, offsetX: number, offsetY: number) {
    this.scene = scene;
    this.grid = grid;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  addTower(row: number, col: number, type: TowerType, level: number = 1): Tower {
    const tower = new Tower(this.scene, row, col, type, level);
    this.towers.push(tower);
    return tower;
  }

  removeTower(row: number, col: number): void {
    const idx = this.towers.findIndex(t => t.gridRow === row && t.gridCol === col);
    if (idx >= 0) {
      this.towers[idx].destroy();
      this.towers.splice(idx, 1);
    }
  }

  getTower(row: number, col: number): Tower | undefined {
    return this.towers.find(t => t.gridRow === row && t.gridCol === col);
  }

  // After placing cells, check for level-up merges
  checkMerge(cells: Array<[number, number]>): void {
    const visited = new Set<string>();

    for (const [r, c] of cells) {
      const key = `${r},${c}`;
      if (visited.has(key)) continue;

      const group = this.grid.getAdjacentSameColor(r, c);
      if (group.length >= 4) {
        // Level up all cells in group
        const newLevel = Math.min(
          Math.floor(group.length / 4) + 1,
          LEVEL_MULTIPLIERS.maxLevel
        );

        for (const [gr, gc] of group) {
          visited.add(`${gr},${gc}`);
          const tower = this.getTower(gr, gc);
          if (tower) {
            tower.level = newLevel;
            tower.updateStats();
          }
          this.grid.setCellTower(gr, gc, this.grid.getCellType(gr, gc)!, newLevel);
        }
      }
    }
  }

  updateAll(delta: number, enemies: Enemy[]): void {
    const liveEnemies = enemies.filter(e => e.alive);

    for (const tower of this.towers) {
      tower.tick(delta);

      if (!tower.isReady()) continue;

      const [tx, ty] = tower.getWorldPos(this.offsetX, this.offsetY);
      const rangePixels = tower.range * CELL_SIZE;
      const config = TOWER_CONFIGS[tower.type];

      // Find enemies in range
      const inRange = liveEnemies.filter(e => {
        const dx = e.x - tx;
        const dy = e.y - ty;
        return Math.sqrt(dx * dx + dy * dy) <= rangePixels;
      });

      if (inRange.length === 0) continue;

      tower.resetCooldown();

      // Sort by distance to end (closest to exit first)
      inRange.sort((a, b) => a.getDistanceToEnd() - b.getDistanceToEnd());
      const primary = inRange[0];

      switch (config.special) {
        case 'aoe': {
          // Hit all in range
          tower.drawAoeEffect(tx, ty, tower.range);
          for (const e of inRange) {
            e.takeDamage(tower.damage);
          }
          break;
        }
        case 'slow': {
          tower.drawAttackEffect(tx, ty, primary.x, primary.y);
          for (const e of inRange) {
            e.takeDamage(tower.damage);
            e.applyStatus({
              type: 'slow',
              duration: config.slowDuration ?? 2,
              value: config.slowAmount ?? 0.5,
            });
          }
          break;
        }
        case 'dot': {
          tower.drawAttackEffect(tx, ty, primary.x, primary.y);
          primary.takeDamage(tower.damage);
          primary.applyStatus({
            type: 'poison',
            duration: config.dotDuration ?? 5,
            value: config.dotDamage ?? 2,
          });
          break;
        }
        case 'pierce': {
          // Hit all enemies in a line from tower toward primary target
          const angle = Math.atan2(primary.y - ty, primary.x - tx);
          const pierced = liveEnemies.filter(e => {
            const dx = e.x - tx;
            const dy = e.y - ty;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > rangePixels) return false;
            // Check angle alignment
            const eAngle = Math.atan2(dy, dx);
            const diff = Math.abs(eAngle - angle);
            const normalized = Math.min(diff, 2 * Math.PI - diff);
            return normalized < Math.PI / 6; // 30 degree cone
          });
          if (pierced.length === 0) {
            tower.drawAttackEffect(tx, ty, primary.x, primary.y);
            primary.takeDamage(tower.damage);
          } else {
            for (const e of pierced) {
              tower.drawAttackEffect(tx, ty, e.x, e.y);
              e.takeDamage(tower.damage);
            }
          }
          break;
        }
      }
    }
  }

  // Line-clear: all towers in a row fire a massive screen-wide attack
  fireLineClear(row: number, enemies: Enemy[], canvasWidth: number): number {
    let totalDamage = 0;
    const rowTowers = this.towers.filter(t => t.gridRow === row);

    const liveEnemies = enemies.filter(e => e.alive);
    const rowY = this.offsetY + row * CELL_SIZE + CELL_SIZE / 2;

    for (const tower of rowTowers) {
      const [tx, ty] = tower.getWorldPos(this.offsetX, this.offsetY);
      tower.drawLineClearEffect(tx, ty, canvasWidth, canvasWidth);

      const lineDamage = tower.damage * 5;
      for (const e of liveEnemies) {
        e.takeDamage(lineDamage);
        totalDamage += lineDamage;
      }
      void rowY;
    }

    return totalDamage;
  }

  removeTowersInRow(row: number): void {
    const rowTowers = this.towers.filter(t => t.gridRow === row);
    for (const tower of rowTowers) {
      tower.destroy();
    }
    this.towers = this.towers.filter(t => t.gridRow !== row);

    // After line clear, shift towers down
    for (const tower of this.towers) {
      if (tower.gridRow < row) {
        tower.gridRow++;
      }
    }
  }

  destroy(): void {
    for (const tower of this.towers) {
      tower.destroy();
    }
    this.towers = [];
  }
}
