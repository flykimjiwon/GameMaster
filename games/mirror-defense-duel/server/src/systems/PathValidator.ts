import {
  GRID_SIZE,
  ENTRY_Y,
  BASE_Y,
  BASE_X,
  PLACEMENT_ROW_MIN,
  PLACEMENT_ROW_MAX,
} from "../config/balance.js";
import type { TowerPlacement, WallPlacement } from "../../../shared/types.js";

/**
 * A* pathfinding on 10x10 grid.
 * Validates that at least one path exists from entry to base.
 */

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

export function findPath(
  blocked: Set<string>,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): number[][] | null {
  const key = (x: number, y: number) => `${x},${y}`;

  const open: Node[] = [];
  const closed = new Set<string>();

  const startNode: Node = {
    x: startX,
    y: startY,
    g: 0,
    h: heuristic(startX, startY, endX, endY),
    f: heuristic(startX, startY, endX, endY),
    parent: null,
  };
  open.push(startNode);

  while (open.length > 0) {
    // Pick node with lowest f
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    const ck = key(current.x, current.y);

    if (current.x === endX && current.y === endY) {
      // Reconstruct path
      const path: number[][] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift([node.x, node.y]);
        node = node.parent;
      }
      return path;
    }

    closed.add(ck);

    // 4-directional neighbors
    const dirs = [
      [0, -1], [0, 1], [-1, 0], [1, 0],
    ];
    for (const [dx, dy] of dirs) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const nk = key(nx, ny);

      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) continue;
      if (closed.has(nk)) continue;
      if (blocked.has(nk)) continue;

      const g = current.g + 1;
      const h = heuristic(nx, ny, endX, endY);
      const existing = open.find((n) => n.x === nx && n.y === ny);

      if (existing) {
        if (g < existing.g) {
          existing.g = g;
          existing.f = g + h;
          existing.parent = current;
        }
      } else {
        open.push({ x: nx, y: ny, g, h, f: g + h, parent: current });
      }
    }
  }

  return null; // No path found
}

/**
 * Build a blocked-cell set from towers and walls.
 */
export function buildBlockedSet(
  towers: TowerPlacement[],
  walls: WallPlacement[]
): Set<string> {
  const blocked = new Set<string>();
  for (const t of towers) {
    blocked.add(`${t.gridX},${t.gridY}`);
  }
  for (const w of walls) {
    blocked.add(`${w.gridX},${w.gridY}`);
  }
  return blocked;
}

/**
 * Validate that a valid path exists from every entry column to the base.
 * At minimum, one path from any entry point to base must exist.
 */
export function validatePlacement(
  towers: TowerPlacement[],
  walls: WallPlacement[]
): { valid: boolean; path: number[][] | null; error?: string } {
  // Check placement bounds
  for (const t of towers) {
    if (
      t.gridX < 0 || t.gridX >= GRID_SIZE ||
      t.gridY < PLACEMENT_ROW_MIN || t.gridY > PLACEMENT_ROW_MAX
    ) {
      return { valid: false, path: null, error: `타워 위치 (${t.gridX},${t.gridY})가 배치 영역을 벗어났습니다.` };
    }
  }
  for (const w of walls) {
    if (
      w.gridX < 0 || w.gridX >= GRID_SIZE ||
      w.gridY < PLACEMENT_ROW_MIN || w.gridY > PLACEMENT_ROW_MAX
    ) {
      return { valid: false, path: null, error: `벽 위치 (${w.gridX},${w.gridY})가 배치 영역을 벗어났습니다.` };
    }
  }

  const blocked = buildBlockedSet(towers, walls);

  // Try to find a path from center entry to base
  const path = findPath(blocked, BASE_X, ENTRY_Y, BASE_X, BASE_Y);
  if (path) return { valid: true, path };

  // Try from every entry column
  for (let x = 0; x < GRID_SIZE; x++) {
    const p = findPath(blocked, x, ENTRY_Y, BASE_X, BASE_Y);
    if (p) return { valid: true, path: p };
  }

  return { valid: false, path: null, error: "경로가 완전히 막혔습니다. 최소 1개의 통로를 남겨주세요." };
}

/**
 * Find the shortest path for a unit given the defense layout.
 * Tries spawning from multiple entry columns and picks the shortest.
 */
export function findBestPath(
  towers: TowerPlacement[],
  walls: WallPlacement[],
  preferredX: number
): number[][] {
  const blocked = buildBlockedSet(towers, walls);

  // Try preferred entry first
  const preferred = findPath(blocked, preferredX, ENTRY_Y, BASE_X, BASE_Y);
  if (preferred) return preferred;

  // Fan out from preferred
  for (let offset = 1; offset < GRID_SIZE; offset++) {
    for (const dir of [-1, 1]) {
      const x = preferredX + offset * dir;
      if (x < 0 || x >= GRID_SIZE) continue;
      const p = findPath(blocked, x, ENTRY_Y, BASE_X, BASE_Y);
      if (p) return p;
    }
  }

  // Fallback: straight line (shouldn't happen if validation passed)
  return Array.from({ length: GRID_SIZE }, (_, i) => [BASE_X, i]);
}
