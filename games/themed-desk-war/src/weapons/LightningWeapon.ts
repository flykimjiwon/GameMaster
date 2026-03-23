import Phaser from 'phaser';
import { WEAPON_CONFIG } from '../config';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';

export class LightningWeapon {
  private scene: Phaser.Scene;
  private player: Player;
  private timer: number = 0;
  public targetCount: number = 1;
  public damage: number = WEAPON_CONFIG.lightning.damage;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  addTarget(): void {
    this.targetCount++;
  }

  update(delta: number, enemies: Phaser.Physics.Arcade.Group): Enemy[] {
    const killed: Enemy[] = [];
    this.timer += delta;

    if (this.timer < WEAPON_CONFIG.lightning.interval) return killed;
    this.timer = 0;

    const activeEnemies = enemies.getChildren().filter(e => e.active) as Enemy[];
    if (activeEnemies.length === 0) return killed;

    // Sort by distance
    activeEnemies.sort((a, b) => {
      const distA = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
      const distB = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
      return distA - distB;
    });

    const targets = activeEnemies.slice(0, this.targetCount);

    for (const target of targets) {
      // Visual: lightning line
      const line = this.scene.add.graphics();
      line.lineStyle(3, WEAPON_CONFIG.lightning.color, 1);

      // Zigzag lightning
      const startX = this.player.x;
      const startY = this.player.y;
      const endX = target.x;
      const endY = target.y;
      const segments = 6;

      line.beginPath();
      line.moveTo(startX, startY);
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const mx = Phaser.Math.Linear(startX, endX, t) + Phaser.Math.FloatBetween(-15, 15);
        const my = Phaser.Math.Linear(startY, endY, t) + Phaser.Math.FloatBetween(-15, 15);
        line.lineTo(mx, my);
      }
      line.lineTo(endX, endY);
      line.strokePath();

      // Fade out
      this.scene.tweens.add({
        targets: line,
        alpha: 0,
        duration: 200,
        onComplete: () => line.destroy(),
      });

      // Damage
      const dead = target.takeDamage(this.damage);
      if (dead) killed.push(target);
    }

    return killed;
  }
}
