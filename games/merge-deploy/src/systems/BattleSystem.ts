import Phaser from 'phaser';
import { Unit } from '../objects/Unit';
import { Enemy } from '../objects/Enemy';
import { BattleLane } from '../objects/BattleLane';

export class BattleSystem {
  scene: Phaser.Scene;
  lane: BattleLane;

  private scoreCallback: ((reward: number) => void) | null = null;

  constructor(scene: Phaser.Scene, lane: BattleLane) {
    this.scene = scene;
    this.lane = lane;
  }

  setScoreCallback(cb: (reward: number) => void): void {
    this.scoreCallback = cb;
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000;

    // Update units
    for (let i = this.lane.units.length - 1; i >= 0; i--) {
      const unit = this.lane.units[i];
      if (!unit || !unit.active) continue;

      // Find nearest enemy in range
      const nearestEnemy = this.findNearestEnemy(unit);

      if (nearestEnemy) {
        // In range — attack if cooldown ready
        if (unit.canAttack(time)) {
          this.processUnitAttack(unit, nearestEnemy, time);
        }
      } else {
        // Check if reached enemy base
        const distToBase = this.lane.laneEndX - 80 - unit.x;
        if (distToBase <= unit.stats.range) {
          // Attack base
          if (unit.canAttack(time)) {
            unit.playAttack(time);
            this.lane.damageBase(unit.stats.attack);
            this.showDamageText(unit.x + 20, unit.y, unit.stats.attack, 0xffaa00);
          }
        } else {
          // Move right
          unit.x += unit.stats.moveSpeed * dt;
        }
      }
    }

    // Update enemies
    for (let i = this.lane.enemies.length - 1; i >= 0; i--) {
      const enemy = this.lane.enemies[i];
      if (!enemy || !enemy.active) continue;

      const nearestUnit = this.findNearestUnit(enemy);

      if (nearestUnit) {
        // Attack if ready
        if (enemy.canAttack(time)) {
          this.processEnemyAttack(enemy, nearestUnit, time);
        }
      } else {
        // Move left
        enemy.x -= enemy.speed * dt;

        // If enemy reaches left edge — game over signal handled in GameScene
        if (enemy.x < this.lane.laneStartX + 20) {
          enemy.x = this.lane.laneStartX + 20;
        }
      }
    }
  }

  private findNearestEnemy(unit: Unit): Enemy | null {
    let nearest: Enemy | null = null;
    let minDist = unit.stats.range;

    for (const enemy of this.lane.enemies) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(unit.x, unit.y, enemy.x, enemy.y);
      if (dist <= minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }
    return nearest;
  }

  private findNearestUnit(enemy: Enemy): Unit | null {
    let nearest: Unit | null = null;
    let minDist = enemy.attackRange;

    for (const unit of this.lane.units) {
      if (!unit.active) continue;
      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, unit.x, unit.y);
      if (dist <= minDist) {
        minDist = dist;
        nearest = unit;
      }
    }
    return nearest;
  }

  private processUnitAttack(unit: Unit, target: Enemy, time: number): void {
    unit.playAttack(time);

    if (unit.stats.isRanged) {
      this.createProjectile(unit.x, unit.y, target.x, target.y, 0xffffff, () => {
        if (!target.active) return;
        if (unit.stats.aoe) {
          // AoE damage
          const radius = unit.stats.aoeRadius ?? 60;
          for (let i = this.lane.enemies.length - 1; i >= 0; i--) {
            const e = this.lane.enemies[i];
            if (!e.active) continue;
            const d = Phaser.Math.Distance.Between(target.x, target.y, e.x, e.y);
            if (d <= radius) {
              this.applyDamageToEnemy(e, unit.stats.attack);
            }
          }
          // AoE ring
          const ring = this.scene.add.graphics();
          ring.lineStyle(2, 0x4488FF, 0.8);
          ring.strokeCircle(target.x, target.y, radius);
          ring.setDepth(30);
          this.scene.tweens.add({
            targets: ring,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => ring.destroy(),
          });
        } else {
          this.applyDamageToEnemy(target, unit.stats.attack);
        }
      });
    } else {
      this.applyDamageToEnemy(target, unit.stats.attack);
    }
  }

  private processEnemyAttack(enemy: Enemy, target: Unit, time: number): void {
    enemy.playAttack(time);
    const dead = target.takeDamage(enemy.attack);
    this.showDamageText(target.x, target.y - 25, enemy.attack, 0xff6666);

    if (dead) {
      target.target = null;
      this.lane.removeDeadUnit(target);
    }
  }

  private applyDamageToEnemy(enemy: Enemy, damage: number): void {
    const dead = enemy.takeDamage(damage);
    this.showDamageText(enemy.x, enemy.y - 30, damage, 0xffff44);

    if (dead) {
      const reward = enemy.reward;
      this.lane.removeDeadEnemy(enemy);
      if (this.scoreCallback) this.scoreCallback(reward);
    }
  }

  createProjectile(
    fromX: number, fromY: number,
    toX: number, toY: number,
    color: number,
    onHit: () => void
  ): void {
    const proj = this.scene.add.graphics();
    proj.fillStyle(color, 1);
    proj.fillCircle(0, 0, 4);
    proj.setPosition(fromX, fromY);
    proj.setDepth(25);

    this.scene.tweens.add({
      targets: proj,
      x: toX,
      y: toY,
      duration: 200,
      ease: 'Linear',
      onComplete: () => {
        onHit();
        proj.destroy();
      },
    });
  }

  private showDamageText(x: number, y: number, damage: number, color: number): void {
    const colorHex = `#${color.toString(16).padStart(6, '0')}`;
    const txt = this.scene.add.text(x, y, `-${damage}`, {
      fontSize: '12px',
      color: colorHex,
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5).setDepth(40);

    this.scene.tweens.add({
      targets: txt,
      y: y - 30,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  destroy(): void {
    // Nothing to cleanup beyond scene lifecycle
  }
}
