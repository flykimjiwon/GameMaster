import { Monster } from '../objects/Monster';
import { MonsterType, MONSTER_TYPES } from '../config/monsters';
import { MERGE_REQUIRED, MAX_GRADE } from '../config/dungeon';

export interface MergeCandidate {
  type: MonsterType;
  grade: number;
  monsters: Monster[];
  canMerge: boolean;
}

export function findMergeCandidates(monsters: Monster[]): MergeCandidate[] {
  const candidates: MergeCandidate[] = [];

  for (const type of MONSTER_TYPES) {
    for (let grade = 1; grade < MAX_GRADE; grade++) {
      const matching = monsters.filter(
        m => m.type === type && m.grade === grade && !m.deployed
      );
      candidates.push({
        type,
        grade,
        monsters: matching,
        canMerge: matching.length >= MERGE_REQUIRED,
      });
    }
  }

  return candidates.filter(c => c.monsters.length >= 1);
}

export function performMerge(
  monsters: Monster[],
  type: MonsterType,
  grade: number
): { success: boolean; newMonster: Monster | null; removedIds: number[] } {
  if (grade >= MAX_GRADE) {
    return { success: false, newMonster: null, removedIds: [] };
  }

  const matching = monsters.filter(
    m => m.type === type && m.grade === grade && !m.deployed
  );

  if (matching.length < MERGE_REQUIRED) {
    return { success: false, newMonster: null, removedIds: [] };
  }

  const toRemove = matching.slice(0, MERGE_REQUIRED);
  const removedIds = toRemove.map(m => m.id);

  // Average level of merged monsters, rounded up
  const avgLevel = Math.ceil(
    toRemove.reduce((sum, m) => sum + m.level, 0) / MERGE_REQUIRED
  );

  const newMonster = new Monster(type, avgLevel, grade + 1);

  return { success: true, newMonster, removedIds };
}
