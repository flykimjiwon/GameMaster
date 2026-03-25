import Phaser from 'phaser';
import { Grid, GridPos } from '../objects/Grid';
import { ComboSystem } from './ComboSystem';

export class ExplosionSystem {
  private scene: Phaser.Scene;
  private grid: Grid;
  private comboSystem: ComboSystem;
  private isProcessing: boolean = false;

  constructor(scene: Phaser.Scene, grid: Grid, comboSystem: ComboSystem) {
    this.scene = scene;
    this.grid = grid;
    this.comboSystem = comboSystem;
  }

  get processing(): boolean {
    return this.isProcessing;
  }

  async explodeChain(positions: GridPos[]): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    this.comboSystem.incrementCombo();

    let chainLevel = 0;
    await this.doExplode(positions, chainLevel);

    this.isProcessing = false;
  }

  private async doExplode(positions: GridPos[], chainLevel: number): Promise<void> {
    if (positions.length === 0) return;

    // Compute sum before removing
    let sum = 0;
    for (const pos of positions) {
      const tile = this.grid.getTile(pos.col, pos.row);
      if (tile) sum += tile.value;
    }

    // Play explosion animations in parallel
    const animPromises: Promise<void>[] = [];
    for (const pos of positions) {
      const tile = this.grid.getTile(pos.col, pos.row);
      if (tile) {
        animPromises.push(tile.playExplosion());
      }
    }

    // Camera shake
    const cameras = this.scene.cameras.main;
    cameras.shake(200, 0.006);

    await Promise.all(animPromises);

    // Remove tiles from grid
    this.grid.removeTiles(positions);

    // Score
    this.comboSystem.addExplosion(positions.length, sum, this.comboSystem.currentCombo + chainLevel);

    // Wait a moment
    await this.delay(80);

    // Drop existing tiles
    await this.grid.dropTiles();

    await this.delay(60);

    // Fill empty spaces
    await this.grid.fillEmpty();

    await this.delay(120);

    // Check for chain reactions
    const reaction = this.checkChainReactions();
    if (reaction && reaction.length >= 2) {
      chainLevel++;
      this.comboSystem.incrementCombo();
      await this.doExplode(reaction, chainLevel);
    }
  }

  checkChainReactions(): GridPos[] | null {
    // Scan each tile, BFS for best adjacent path summing to multiple of 10
    let bestPath: GridPos[] | null = null;
    let bestScore = 0;

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        if (this.grid.getTile(col, row) === null) continue;
        const paths = this.findChainPaths(col, row);
        for (const path of paths) {
          const pathScore = this.scorePath(path);
          if (pathScore > bestScore) {
            bestScore = pathScore;
            bestPath = path;
          }
        }
      }
    }

    return bestPath;
  }

  private findChainPaths(startCol: number, startRow: number): GridPos[][] {
    const results: GridPos[][] = [];
    const visited = new Set<string>();

    const dfs = (col: number, row: number, currentPath: GridPos[], currentSum: number): void => {
      const key = `${col},${row}`;
      if (visited.has(key)) return;

      const tile = this.grid.getTile(col, row);
      if (!tile) return;

      visited.add(key);
      currentPath.push({ col, row });
      const newSum = currentSum + tile.value;

      if (currentPath.length >= 2 && newSum % 10 === 0) {
        results.push([...currentPath]);
      }

      // Limit DFS depth to avoid too-long chains in auto-reaction (keep it snappy)
      if (currentPath.length < 8) {
        const adjacent = this.grid.getAdjacentPositions(col, row);
        for (const next of adjacent) {
          if (!visited.has(`${next.col},${next.row}`)) {
            dfs(next.col, next.row, currentPath, newSum);
          }
        }
      }

      currentPath.pop();
      visited.delete(key);
    };

    dfs(startCol, startRow, [], 0);
    return results;
  }

  private scorePath(path: GridPos[]): number {
    let sum = 0;
    for (const pos of path) {
      const tile = this.grid.getTile(pos.col, pos.row);
      if (tile) sum += tile.value;
    }
    // Score = sum * length (prefer longer chains and bigger sums)
    return sum * path.length;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }
}
