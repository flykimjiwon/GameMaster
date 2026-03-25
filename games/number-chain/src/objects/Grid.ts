import Phaser from 'phaser';
import { Tile } from './Tile';
import {
  GRID_COLS, GRID_ROWS, TILE_SIZE, TILE_GAP,
  GRID_OFFSET_X, GRID_OFFSET_Y,
} from '../config/gameConfig';

export interface GridPos {
  col: number;
  row: number;
}

export class Grid {
  scene: Phaser.Scene;
  tiles: (Tile | null)[][];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.tiles = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        this.tiles[row][col] = this.createTile(col, row);
      }
    }
  }

  createTile(col: number, row: number): Tile {
    const { x, y } = this.gridToWorld(col, row);
    const value = Phaser.Math.Between(1, 9);
    const tile = new Tile(this.scene, x, y, value, col, row);
    tile.setDepth(1);
    return tile;
  }

  getTile(col: number, row: number): Tile | null {
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return null;
    return this.tiles[row][col];
  }

  removeTiles(positions: GridPos[]): void {
    for (const { col, row } of positions) {
      const tile = this.tiles[row][col];
      if (tile) {
        tile.destroy();
        this.tiles[row][col] = null;
      }
    }
  }

  async dropTiles(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (let col = 0; col < GRID_COLS; col++) {
      let emptyRow = GRID_ROWS - 1;
      for (let row = GRID_ROWS - 1; row >= 0; row--) {
        if (this.tiles[row][col] !== null) {
          if (row !== emptyRow) {
            const tile = this.tiles[row][col]!;
            this.tiles[emptyRow][col] = tile;
            this.tiles[row][col] = null;
            tile.gridRow = emptyRow;
            const { y } = this.gridToWorld(col, emptyRow);
            promises.push(tile.playDrop(y));
          }
          emptyRow--;
        }
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  async fillEmpty(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (let col = 0; col < GRID_COLS; col++) {
      let spawnOffset = 0;
      for (let row = GRID_ROWS - 1; row >= 0; row--) {
        if (this.tiles[row][col] === null) {
          spawnOffset++;
          const { x, y } = this.gridToWorld(col, row);
          const spawnY = GRID_OFFSET_Y - spawnOffset * (TILE_SIZE + TILE_GAP);
          const value = Phaser.Math.Between(1, 9);
          const tile = new Tile(this.scene, x, spawnY, value, col, row);
          tile.setDepth(1);
          this.tiles[row][col] = tile;
          promises.push(tile.playDrop(y));
        }
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  getAdjacentPositions(col: number, row: number): GridPos[] {
    const positions: GridPos[] = [];
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (dc === 0 && dr === 0) continue;
        const nc = col + dc;
        const nr = row + dr;
        if (nc >= 0 && nc < GRID_COLS && nr >= 0 && nr < GRID_ROWS) {
          positions.push({ col: nc, row: nr });
        }
      }
    }
    return positions;
  }

  hasValidMoves(): boolean {
    // BFS/DFS from each tile — check if any reachable path sums to multiple of 10
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (this.tiles[row][col] === null) continue;
        if (this.dfsHasValidMove(col, row, 0, new Set<string>())) {
          return true;
        }
      }
    }
    return false;
  }

  private dfsHasValidMove(
    col: number,
    row: number,
    currentSum: number,
    visited: Set<string>,
  ): boolean {
    const tile = this.tiles[row][col];
    if (!tile) return false;

    const key = `${col},${row}`;
    if (visited.has(key)) return false;

    visited.add(key);
    const newSum = currentSum + tile.value;

    // If visited has more than 1 element, we have a chain of 2+
    if (visited.size >= 2 && newSum % 10 === 0) {
      return true;
    }

    // Prune: if sum already exceeds 9*GRID_COLS*GRID_ROWS we can't get more multiples
    // Max meaningful sum to check: any multiple of 10 up to total possible
    if (newSum > 90) {
      // Still might find lower multiples on other paths — don't prune sum
    }

    const adjacent = this.getAdjacentPositions(col, row);
    for (const { col: nc, row: nr } of adjacent) {
      if (!visited.has(`${nc},${nr}`) && this.tiles[nr][nc] !== null) {
        if (this.dfsHasValidMove(nc, nr, newSum, new Set(visited))) {
          return true;
        }
      }
    }

    return false;
  }

  worldToGrid(x: number, y: number): GridPos | null {
    const col = Math.round((x - GRID_OFFSET_X) / (TILE_SIZE + TILE_GAP));
    const row = Math.round((y - GRID_OFFSET_Y) / (TILE_SIZE + TILE_GAP));
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return null;
    return { col, row };
  }

  gridToWorld(col: number, row: number): { x: number; y: number } {
    return {
      x: GRID_OFFSET_X + col * (TILE_SIZE + TILE_GAP),
      y: GRID_OFFSET_Y + row * (TILE_SIZE + TILE_GAP),
    };
  }
}
