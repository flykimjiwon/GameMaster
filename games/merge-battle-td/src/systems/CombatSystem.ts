import Phaser from 'phaser';
import { Tower } from '../entities/Tower';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { TOWER_STATS, CELL_SIZE, AOE_RADIUS } from '../config';

export class CombatSystem {
  projectiles: Projectile[] = [];

  constructor(private scene: Phaser.Scene) {}

  update(time: number, delta: number, towers: Tower[], enemies: Enemy[]): void {
    // Tower targeting & firing
    for (const tower of towers) {
      const stats = TOWER_STATS[tower.towerType];
      const tierIdx = tower.tier - 1;
      const rangePx = stats.range[tierIdx] * CELL_SIZE;
      const attackInterval = stats.speed[tierIdx] * 1000;

      if (time - tower.lastAttackTime < attackInterval) continue;

      // Find target (First — most progress along path)
      let target: Enemy | null = null;

      for (const enemy of enemies) {
        if (enemy.isDead || enemy.hasEscaped) continue;
        const dx = enemy.x - tower.x;
        const dy = enemy.y - tower.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= rangePx) {
          // "First" = most distance traveled
          if (!target || enemy.distanceTraveled > target.distanceTraveled) {
            target = enemy;
          }
        }
      }

      if (target) {
        tower.lastAttackTime = time;
        const dmg = stats.dmg[tierIdx];
        const options: { isAoe?: boolean; aoeRadius?: number; slowPct?: number; slowDuration?: number } = {};

        if (stats.special === 'aoe') {
          options.isAoe = true;
          options.aoeRadius = AOE_RADIUS;
        }
        if (stats.special === 'slow' && stats.slowPct) {
          options.slowPct = stats.slowPct[tierIdx];
          options.slowDuration = 2;
        }

        const proj = new Projectile(this.scene, tower.x, tower.y, target, dmg, options);
        this.projectiles.push(proj);
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(time, delta);

      if (proj.hasReachedTarget()) {
        // Apply damage
        if (!proj.target.isDead && !proj.target.hasEscaped) {
          if (proj.isAoe) {
            // AOE damage
            for (const enemy of enemies) {
              if (enemy.isDead || enemy.hasEscaped) continue;
              const dx = enemy.x - proj.target.x;
              const dy = enemy.y - proj.target.y;
              if (Math.sqrt(dx * dx + dy * dy) <= proj.aoeRadius) {
                enemy.takeDamage(proj.damage);
                if (enemy.isDead) {
                  this.playDeathEffect(enemy);
                }
              }
            }
          } else {
            proj.target.takeDamage(proj.damage);
            if (proj.target.isDead) {
              this.playDeathEffect(proj.target);
            }
          }

          // Apply slow
          if (proj.slowPct > 0) {
            proj.target.applySlow(proj.slowPct, proj.slowDuration);
          }

          // Hit effect
          this.playHitEffect(proj.x, proj.y, proj.isAoe);
        }

        if (!proj.scene) {
          // Already destroyed
        } else {
          proj.destroy();
        }
        this.projectiles.splice(i, 1);
      }
    }
  }

  private playDeathEffect(enemy: Enemy): void {
    const x = enemy.x;
    const y = enemy.y;
    // Fade out
    this.scene.tweens.add({
      targets: enemy,
      alpha: 0,
      scale: 0.3,
      duration: 300,
      onComplete: () => enemy.destroy(),
    });

    // Particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dot = this.scene.add.circle(x, y, 2, 0xff6644).setDepth(30);
      this.scene.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * 25,
        y: y + Math.sin(angle) * 25,
        alpha: 0,
        duration: 300,
        onComplete: () => dot.destroy(),
      });
    }
  }

  private playHitEffect(x: number, y: number, isAoe: boolean = false): void {
    const flash = this.scene.add.circle(x, y, isAoe ? 12 : 6, 0xffffff, 0.8).setDepth(30);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: isAoe ? 4 : 2,
      duration: isAoe ? 300 : 150,
      onComplete: () => flash.destroy(),
    });

    if (isAoe) {
      // AOE ring
      const ring = this.scene.add.circle(x, y, 10, undefined, 0).setDepth(30);
      ring.setStrokeStyle(2, 0xff8844, 0.8);
      this.scene.tweens.add({
        targets: ring,
        scaleX: 5,
        scaleY: 5,
        alpha: 0,
        duration: 400,
        onComplete: () => ring.destroy(),
      });
    }
  }

  destroy(): void {
    for (const proj of this.projectiles) {
      if (proj.scene) proj.destroy();
    }
    this.projectiles = [];
  }
}
