import Phaser from 'phaser';
import { WEAPON_CONFIG } from '../config';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';

interface Orb {
  gfx: Phaser.GameObjects.Arc;
  angle: number;
}

export class OrbWeapon {
  private scene: Phaser.Scene;
  private player: Player;
  private orbs: Orb[] = [];
  public orbCount: number = 1;
  public damage: number = WEAPON_CONFIG.orb.damage;
  private hitCooldowns: Map<Enemy, number> = new Map();

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.createOrbs();
  }

  private createOrbs(): void {
    // Remove existing
    this.orbs.forEach(o => o.gfx.destroy());
    this.orbs = [];

    for (let i = 0; i < this.orbCount; i++) {
      const angle = (Math.PI * 2 / this.orbCount) * i;
      const gfx = this.scene.add.circle(0, 0, WEAPON_CONFIG.orb.radius, WEAPON_CONFIG.orb.color, 1);
      this.scene.physics.add.existing(gfx);
      (gfx.body as Phaser.Physics.Arcade.Body).setCircle(WEAPON_CONFIG.orb.radius);
      this.orbs.push({ gfx, angle });
    }
  }

  addOrb(): void {
    this.orbCount++;
    this.createOrbs();
  }

  update(delta: number): void {
    const rotSpeed = Phaser.Math.DegToRad(WEAPON_CONFIG.orb.rotationSpeed);

    for (const orb of this.orbs) {
      orb.angle += rotSpeed * (delta / 1000);
      orb.gfx.x = this.player.x + Math.cos(orb.angle) * WEAPON_CONFIG.orb.orbitRadius;
      orb.gfx.y = this.player.y + Math.sin(orb.angle) * WEAPON_CONFIG.orb.orbitRadius;
    }

    // Clear expired cooldowns
    const now = this.scene.time.now;
    for (const [enemy, time] of this.hitCooldowns) {
      if (now - time > 300) this.hitCooldowns.delete(enemy);
    }
  }

  checkCollisions(enemies: Phaser.Physics.Arcade.Group): Enemy[] {
    const killed: Enemy[] = [];
    const now = this.scene.time.now;

    for (const orb of this.orbs) {
      for (const obj of enemies.getChildren()) {
        const enemy = obj as Enemy;
        if (!enemy.active) continue;
        if (this.hitCooldowns.has(enemy)) continue;

        const dist = Phaser.Math.Distance.Between(orb.gfx.x, orb.gfx.y, enemy.x, enemy.y);
        if (dist < WEAPON_CONFIG.orb.radius + 14) {
          this.hitCooldowns.set(enemy, now);
          const dead = enemy.takeDamage(this.damage);
          if (dead) killed.push(enemy);
        }
      }
    }
    return killed;
  }

  getOrbs(): Phaser.GameObjects.Arc[] {
    return this.orbs.map(o => o.gfx);
  }
}
