import PF from 'pathfinding';
import { Grid, GRID_COLS, GRID_ROWS, CELL_SIZE } from '../objects/Grid';

export interface PathResult {
  found: boolean;
  path: Array<[number, number]>; // pixel coordinates
  gridPath: Array<[number, number]>; // grid coordinates [row, col]
}

export class PathSystem {
  private grid: Grid;
  private offsetX: number;
  private offsetY: number;

  // Entry rows (left side) and exit rows (right side)
  // Enemies enter from column 0, exit at column GRID_COLS-1
  // We allow multiple entry rows — find all open rows on left edge
  private finder: PF.AStarFinder;

  constructor(grid: Grid, offsetX: number, offsetY: number) {
    this.grid = grid;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.finder = new PF.AStarFinder({
      allowDiagonal: false,
      dontCrossCorners: true,
    } as PF.FinderOptions);
  }

  // Check if the grid allows at least one path from left to right
  hasValidPath(): boolean {
    const matrix = this.grid.buildWalkableMatrix();

    // Try each row as entry point
    for (let entryRow = 0; entryRow < GRID_ROWS; entryRow++) {
      if (matrix[entryRow][0] !== 0) continue; // entry must be open

      // Try each row as exit point
      for (let exitRow = 0; exitRow < GRID_ROWS; exitRow++) {
        if (matrix[exitRow][GRID_COLS - 1] !== 0) continue;

        const pfGrid = new PF.Grid(GRID_COLS, GRID_ROWS, matrix);
        // PF.Grid takes matrix[y][x], so we pass [col] as x and [row] as y
        const path = this.finder.findPath(0, entryRow, GRID_COLS - 1, exitRow, pfGrid);
        if (path.length > 0) return true;
      }
    }
    return false;
  }

  // Test if placing a specific set of cells would still allow a path
  wouldBlockPath(cells: Array<[number, number]>): boolean {
    const matrix = this.grid.buildWalkableMatrix();

    // Temporarily set the cells as blocked
    for (const [r, c] of cells) {
      if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
        matrix[r][c] = 1;
      }
    }

    // Check if any path exists
    for (let entryRow = 0; entryRow < GRID_ROWS; entryRow++) {
      if (matrix[entryRow][0] !== 0) continue;

      for (let exitRow = 0; exitRow < GRID_ROWS; exitRow++) {
        if (matrix[exitRow][GRID_COLS - 1] !== 0) continue;

        const pfGrid = new PF.Grid(GRID_COLS, GRID_ROWS, matrix);
        const path = this.finder.findPath(0, entryRow, GRID_COLS - 1, exitRow, pfGrid);
        if (path.length > 0) return false; // path exists, not blocked
      }
    }
    return true; // all paths blocked
  }

  // Calculate the best path from left to right for an enemy
  calculatePath(preferredEntryRow?: number): PathResult {
    const matrix = this.grid.buildWalkableMatrix();

    let bestPath: number[][] = [];
    let bestEntryRow = 0;

    // Find longest bottom path (prefer lower rows for enemies)
    const rowsToTry: number[] = [];
    if (preferredEntryRow !== undefined && matrix[preferredEntryRow]?.[0] === 0) {
      rowsToTry.push(preferredEntryRow);
    }
    // Add rows from bottom to top
    for (let r = GRID_ROWS - 1; r >= 0; r--) {
      if (!rowsToTry.includes(r)) rowsToTry.push(r);
    }

    for (const entryRow of rowsToTry) {
      if (matrix[entryRow][0] !== 0) continue;

      for (let exitRow = GRID_ROWS - 1; exitRow >= 0; exitRow--) {
        if (matrix[exitRow][GRID_COLS - 1] !== 0) continue;

        const pfGrid = new PF.Grid(GRID_COLS, GRID_ROWS, matrix);
        const path = this.finder.findPath(0, entryRow, GRID_COLS - 1, exitRow, pfGrid);

        if (path.length > 0) {
          if (bestPath.length === 0 || entryRow > bestEntryRow) {
            bestPath = path;
            bestEntryRow = entryRow;
          }
          break;
        }
      }
      if (bestPath.length > 0) break;
    }

    if (bestPath.length === 0) {
      return { found: false, path: [], gridPath: [] };
    }

    // Convert grid [col, row] pairs to pixel coordinates
    // PF returns [col, row] (x, y) pairs
    const gridPath: Array<[number, number]> = bestPath.map(([col, row]) => [row, col]);
    const pixelPath: Array<[number, number]> = bestPath.map(([col, row]) => [
      this.offsetX + col * CELL_SIZE + CELL_SIZE / 2,
      this.offsetY + row * CELL_SIZE + CELL_SIZE / 2,
    ]);

    // Add exit waypoint just off screen
    const lastPixel = pixelPath[pixelPath.length - 1];
    pixelPath.push([lastPixel[0] + CELL_SIZE * 3, lastPixel[1]]);
    gridPath.push([gridPath[gridPath.length - 1][0], GRID_COLS + 2]);

    return { found: true, path: pixelPath, gridPath };
  }

  // Get all open entry rows on the left edge
  getEntryRows(): number[] {
    const matrix = this.grid.buildWalkableMatrix();
    const rows: number[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      if (matrix[r][0] === 0) rows.push(r);
    }
    return rows;
  }

  // Get spawn world position for an entry row
  getSpawnPosition(row: number): [number, number] {
    return [
      this.offsetX - CELL_SIZE,
      this.offsetY + row * CELL_SIZE + CELL_SIZE / 2,
    ];
  }
}
