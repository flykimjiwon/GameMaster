import Phaser from 'phaser';
import { PROJECTILE_SPEED, PROJECTILE_RADIUS } from '../config';
import { Enemy } from './Enemy';

export class Projectile extends Phaser.GameObjects.Arc {
  target: Enemy;
  damage: number;
  isAoe: boolean;
  aoeRadius: number;
  slowPct: number;
  slowDuration: number;
  alive: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Enemy,
    damage: number,
    options: { isAoe?: boolean; aoeRadius?: number; slowPct?: number; slowDuration?: number } = {},
  ) {
    super(scene, x, y, PROJECTILE_RADIUS, 0, 360, false, 0xffffff, 0.9);
    this.target = target;
    this.damage = damage;
    this.isAoe = options.isAoe || false;
    this.aoeRadius = options.aoeRadius || 0;
    this.slowPct = options.slowPct || 0;
    this.slowDuration = options.slowDuration || 0;
    this.setDepth(25);
    scene.add.existing(this);
  }

  update(_time: number, delta: number): void {
    if (!this.alive) return;

    if (this.target.isDead || this.target.hasEscaped) {
      this.alive = false;
      this.destroy();
      return;
    }

    const speed = PROJECTILE_SPEED * (delta / 1000);
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= speed + 5) {
      // Hit
      this.alive = false;
      this.destroy();
      return; // Damage handled by CombatSystem
    }

    this.x += (dx / dist) * speed;
    this.y += (dy / dist) * speed;
  }

  hasReachedTarget(): boolean {
    if (!this.alive || this.target.isDead || this.target.hasEscaped) return true;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) < 10;
  }
}
