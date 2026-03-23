import Phaser from 'phaser';
import { GAME_CONFIG, type EnemyType } from '../config';
import { Enemy } from './Enemy';
import type { GameScene } from '../scenes/GameScene';

interface SpawnRule {
  minTime: number;
  maxTime: number;
  types: EnemyType[];
  interval: number;
}

const SPAWN_RULES: SpawnRule[] = [
  { minTime: 0, maxTime: 30, types: ['slime'], interval: 2000 },
  { minTime: 30, maxTime: 60, types: ['slime', 'bat'], interval: 1500 },
  { minTime: 60, maxTime: 120, types: ['slime', 'bat', 'golem'], interval: 1000 },
  { minTime: 120, maxTime: 170, types: ['slime', 'bat', 'golem'], interval: 500 },
];

const POOL_SIZE = 200;

export class EnemySpawner {
  private scene: GameScene;
  private pool: Enemy[] = [];
  private spawnTimer: number = 0;
  public bossSpawned: boolean = false;

  constructor(scene: GameScene) {
    this.scene = scene;

    for (let i = 0; i < POOL_SIZE; i++) {
      const enemy = new Enemy(scene, -100, -100);
      enemy.deactivate();
      scene.enemies.add(enemy);
      this.pool.push(enemy);
    }
  }

  getEnemy(): Enemy | null {
    return this.pool.find(e => !e.active) || null;
  }

  spawnEnemy(type: EnemyType): Enemy | null {
    const enemy = this.getEnemy();
    if (!enemy) return null;

    const { x, y } = this.getSpawnPosition();
    enemy.init(type, x, y);
    return enemy;
  }

  private getSpawnPosition(): { x: number; y: number } {
    const player = this.scene.player;
    const margin = 50;
    const spawnDist = 500;

    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    let x = player.x + Math.cos(angle) * spawnDist;
    let y = player.y + Math.sin(angle) * spawnDist;

    x = Phaser.Math.Clamp(x, margin, GAME_CONFIG.WORLD_WIDTH - margin);
    y = Phaser.Math.Clamp(y, margin, GAME_CONFIG.WORLD_HEIGHT - margin);

    return { x, y };
  }

  update(elapsed: number, delta: number): void {
    if (elapsed >= 170) return; // Stop spawning before boss

    this.spawnTimer += delta;

    const rule = SPAWN_RULES.find(r => elapsed >= r.minTime && elapsed < r.maxTime);
    if (!rule) return;

    if (this.spawnTimer >= rule.interval) {
      this.spawnTimer = 0;
      const type = Phaser.Utils.Array.GetRandom(rule.types);
      this.spawnEnemy(type);

      // Extra spawn at high intensity
      if (elapsed >= 120 && Math.random() > 0.5) {
        const type2 = Phaser.Utils.Array.GetRandom(rule.types);
        this.spawnEnemy(type2);
      }
    }
  }
}
