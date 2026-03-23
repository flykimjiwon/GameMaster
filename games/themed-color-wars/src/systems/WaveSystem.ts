import { EnemyType } from '../config';

export interface WaveEntry {
  type: EnemyType;
}

export class WaveSystem {
  private queue: WaveEntry[] = [];
  private spawnTimer: number = 0;
  private spawnInterval: number = 0.8; // seconds
  private currentIndex: number = 0;
  spawning: boolean = false;
  allSpawned: boolean = false;

  constructor() {
    this.buildWaves();
  }

  private buildWaves(): void {
    // Wave 1: 고블린 x5
    for (let i = 0; i < 5; i++) this.queue.push({ type: 'goblin' });
    // Wave 2: 늑대 x3
    for (let i = 0; i < 3; i++) this.queue.push({ type: 'wolf' });
    // Wave 3: 혼합 x7 (고블린5 + 늑대2)
    for (let i = 0; i < 5; i++) this.queue.push({ type: 'goblin' });
    for (let i = 0; i < 2; i++) this.queue.push({ type: 'wolf' });
    // Wave 4: 트롤 x2
    for (let i = 0; i < 2; i++) this.queue.push({ type: 'troll' });
    // Wave 5: 전체 혼합 x10 (mixed)
    const mixed: EnemyType[] = ['goblin', 'wolf', 'goblin', 'troll', 'wolf', 'goblin', 'wolf', 'goblin', 'troll', 'wolf'];
    // Adjust to get exactly 3 remaining to hit 30 total
    // Current: 5+3+7+2 = 17, need 13 more
    for (let i = 0; i < 13; i++) {
      this.queue.push({ type: mixed[i % mixed.length] });
    }
  }

  start(): void {
    this.spawning = true;
    this.currentIndex = 0;
    this.spawnTimer = 0;
  }

  update(delta: number): WaveEntry | null {
    if (!this.spawning || this.allSpawned) return null;

    this.spawnTimer += delta / 1000;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer -= this.spawnInterval;
      if (this.currentIndex < this.queue.length) {
        const entry = this.queue[this.currentIndex];
        this.currentIndex++;
        if (this.currentIndex >= this.queue.length) {
          this.allSpawned = true;
        }
        return entry;
      }
    }
    return null;
  }

  getTotalEnemies(): number {
    return this.queue.length;
  }
}
