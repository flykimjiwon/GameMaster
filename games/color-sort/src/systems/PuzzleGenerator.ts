import type { LevelDef } from '../config/levels';

/**
 * Generate a solvable puzzle by creating the solved state and shuffling.
 * The shuffle only makes valid reverse-moves, guaranteeing solvability.
 */
export function generatePuzzle(def: LevelDef, seed: number): number[][] {
  const { colors, emptyTubes, ballsPerTube } = def;

  // Create solved state: each tube has 4 balls of one color
  const state: number[][] = [];
  for (let c = 0; c < colors; c++) {
    const tube: number[] = [];
    for (let b = 0; b < ballsPerTube; b++) {
      tube.push(c);
    }
    state.push(tube);
  }
  // Add empty tubes
  for (let e = 0; e < emptyTubes; e++) {
    state.push([]);
  }

  // Shuffle by making random valid reverse-moves
  const rng = mulberry32(seed);
  const shuffleMoves = colors * ballsPerTube * 8; // plenty of shuffling

  for (let i = 0; i < shuffleMoves; i++) {
    // Pick a random source tube that has balls
    const nonEmpty = state.map((t, idx) => ({ t, idx })).filter(x => x.t.length > 0);
    if (nonEmpty.length === 0) break;

    const srcEntry = nonEmpty[Math.floor(rng() * nonEmpty.length)];
    const srcIdx = srcEntry.idx;

    // Pick a random destination tube that is not full and not source
    const validDests = state.map((t, idx) => ({ t, idx }))
      .filter(x => x.idx !== srcIdx && x.t.length < ballsPerTube);

    if (validDests.length === 0) continue;

    const dstEntry = validDests[Math.floor(rng() * validDests.length)];
    const dstIdx = dstEntry.idx;

    // Move top ball from src to dst
    const ball = state[srcIdx].pop()!;
    state[dstIdx].push(ball);
  }

  // Verify it's actually shuffled (not still solved)
  const isSolved = state.every(tube => {
    if (tube.length === 0) return true;
    if (tube.length !== ballsPerTube) return false;
    return tube.every(b => b === tube[0]);
  });

  // If still solved (unlikely), do a few forced swaps
  if (isSolved && colors > 1) {
    // Swap top balls between first two tubes
    const a = state[0].pop()!;
    const b = state[1].pop()!;
    state[0].push(b);
    state[1].push(a);
  }

  return state;
}

// Deterministic PRNG (Mulberry32)
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
