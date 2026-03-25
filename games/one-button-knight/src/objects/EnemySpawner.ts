import Phaser from 'phaser';
import { SPAWNER, GAME_WIDTH } from '../config/gameConfig';
import { Enemy, EnemyType } from './Enemy';

export class EnemySpawner {
  private scene: Phaser.Scene;
  private enemies: Enemy[] = [];
  private timer: number = 0;
  private distance: number = 0;
  private interval: number = SPAWNER.BASE_INTERVAL;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  update(delta: number, distance: number): void {
    this.distance = distance;
    this.timer += delta;

    // Interval shrinks with distance
    this.interval = Math.max(
      SPAWNER.MIN_INTERVAL,
      SPAWNER.BASE_INTERVAL - distance * 0.8,
    );

    if (this.timer >= this.interval) {
      this.timer = 0;
      this.spawn();
    }

    // Update alive enemies, remove dead/offscreen
    this.enemies = this.enemies.filter(e => {
      if (e.isOffScreen()) {
        e.destroy();
        return false;
      }
      if (!e.alive) return false;
      e.update(delta);
      return true;
    });
  }

  private spawn(): void {
    const speedScale = Math.min(this.distance * SPAWNER.SPEED_SCALE, 3);
    const roll = Math.random();
    let type: EnemyType;

    if (roll < 0.45) {
      type = 'soldier';
    } else if (roll < 0.75) {
      type = 'bird';
    } else {
      type = 'shield';
    }

    const spawnX = GAME_WIDTH + 60;
    const enemy = new Enemy(this.scene, { type, x: spawnX, speedScale });
    this.enemies.push(enemy);
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  reset(): void {
    this.enemies.forEach(e => e.destroy());
    this.enemies = [];
    this.timer = 0;
    this.distance = 0;
    this.interval = SPAWNER.BASE_INTERVAL;
  }
}
