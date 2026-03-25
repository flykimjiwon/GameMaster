import Phaser from 'phaser';
import { Enemy } from '../objects/Enemy';
import { EnemyType, generateWave } from '../config/enemies';
import { PathSystem } from './PathSystem';
import { GRID_ROWS } from '../objects/Grid';

interface SpawnQueueItem {
  type: EnemyType;
  delay: number; // seconds until spawn
}

export class WaveSystem {
  private scene: Phaser.Scene;
  private pathSystem: PathSystem;

  public currentWave: number = 0;
  public enemies: Enemy[] = [];
  public waveActive: boolean = false;
  public waveTimer: number = 0;      // seconds until next wave
  public readonly WAVE_INTERVAL = 30; // seconds between waves

  private spawnQueue: SpawnQueueItem[] = [];
  private spawnTimer: number = 0;

  public onEnemyKilled: ((reward: number) => void) | null = null;
  public onEnemyReachedEnd: (() => void) | null = null;
  public onWaveComplete: ((wave: number) => void) | null = null;
  public onWaveStart: ((wave: number) => void) | null = null;

  constructor(scene: Phaser.Scene, pathSystem: PathSystem) {
    this.scene = scene;
    this.pathSystem = pathSystem;
    this.waveTimer = 8; // First wave starts after 8 seconds
  }

  update(delta: number): void {
    const dt = delta / 1000;

    // Update all enemies
    for (const enemy of this.enemies) {
      if (enemy.alive) {
        enemy.update(delta);

        if (enemy.reachedEnd) {
          if (this.onEnemyReachedEnd) this.onEnemyReachedEnd();
        }
      }
    }

    // Remove dead/finished enemies
    const toRemove = this.enemies.filter(e => !e.alive);
    for (const e of toRemove) {
      if (!e.reachedEnd && e.hp <= 0) {
        // Killed by towers
        if (this.onEnemyKilled) this.onEnemyKilled(e.reward);
      }
      e.destroy();
    }
    this.enemies = this.enemies.filter(e => e.alive);

    // Handle spawn queue
    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const next = this.spawnQueue.shift()!;
        this.spawnEnemy(next.type);
        this.spawnTimer = this.spawnQueue.length > 0 ? this.spawnQueue[0].delay : 0;
      }
    }

    // Check wave complete
    if (this.waveActive && this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.waveActive = false;
      if (this.onWaveComplete) this.onWaveComplete(this.currentWave);
      this.waveTimer = this.WAVE_INTERVAL;
    }

    // Wave countdown
    if (!this.waveActive) {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.startNextWave();
      }
    }
  }

  startNextWave(): void {
    this.currentWave++;
    this.waveActive = true;
    this.waveTimer = 0;

    const config = generateWave(this.currentWave);

    // Build spawn queue from wave config
    this.spawnQueue = [];
    for (const spawn of config.spawns) {
      for (let i = 0; i < spawn.count; i++) {
        this.spawnQueue.push({ type: spawn.type, delay: spawn.delay });
      }
    }

    this.spawnTimer = 0.5; // short delay before first spawn

    if (this.onWaveStart) this.onWaveStart(this.currentWave);
  }

  private spawnEnemy(type: EnemyType): void {
    const entryRows = this.pathSystem.getEntryRows();
    if (entryRows.length === 0) return;

    // Pick a random entry row
    const entryRow = entryRows[Math.floor(Math.random() * entryRows.length)];
    const [spawnX, spawnY] = this.pathSystem.getSpawnPosition(entryRow);

    const enemy = new Enemy(this.scene, type, spawnX, spawnY);

    // Calculate path for this enemy
    const result = this.pathSystem.calculatePath(entryRow);
    if (result.found) {
      enemy.setPath(result.path);
    } else {
      // No path — enemy still exists but can't move
      // In this case just don't add it
      enemy.destroy();
      return;
    }

    this.enemies.push(enemy);
  }

  // Force start wave immediately (for testing/player skip)
  skipToNextWave(): void {
    this.waveTimer = 0;
  }

  // Recalculate all active enemy paths (call after block placement)
  recalculateEnemyPaths(): void {
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      // Find closest path from current position
      const result = this.pathSystem.calculatePath();
      if (result.found) {
        // Find the best waypoint to resume from
        let closestIdx = 0;
        let closestDist = Infinity;
        for (let i = 0; i < result.path.length; i++) {
          const [px, py] = result.path[i];
          const dx = px - enemy.x;
          const dy = py - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        }
        const newPath = result.path.slice(closestIdx);
        enemy.setPath(newPath);
      }
    }
  }

  getLivingEnemyCount(): number {
    return this.enemies.filter(e => e.alive).length;
  }

  destroy(): void {
    for (const e of this.enemies) {
      e.destroy();
    }
    this.enemies = [];
  }
}
