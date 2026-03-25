declare module 'pathfinding' {
  export interface FinderOptions {
    allowDiagonal?: boolean;
    dontCrossCorners?: boolean;
    heuristic?: (dx: number, dy: number) => number;
    weight?: number;
  }

  export class Grid {
    constructor(width: number, height: number, matrix?: number[][]);
    setWalkableAt(x: number, y: number, walkable: boolean): void;
    isWalkableAt(x: number, y: number): boolean;
    clone(): Grid;
    width: number;
    height: number;
  }

  export class AStarFinder {
    constructor(options?: FinderOptions);
    findPath(startX: number, startY: number, endX: number, endY: number, grid: Grid): number[][];
  }

  export class BestFirstFinder {
    constructor(options?: FinderOptions);
    findPath(startX: number, startY: number, endX: number, endY: number, grid: Grid): number[][];
  }
}
