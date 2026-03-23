import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { Boss } from '../entities/Boss';
import type { GameScene } from '../scenes/GameScene';

export class WaveSystem {
  private scene: GameScene;
  public boss: Boss | null = null;
  private bossSpawned: boolean = false;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  update(elapsed: number): void {
    if (elapsed >= 170 && !this.bossSpawned) {
      this.spawnBoss();
    }

    if (elapsed >= GAME_CONFIG.GAME_DURATION && !this.boss) {
      this.scene.endGame(false);
    }
  }

  private spawnBoss(): void {
    this.bossSpawned = true;
    const player = this.scene.player;
    const angle = Math.random() * Math.PI * 2;
    const dist = 400;
    const x = player.x + Math.cos(angle) * dist;
    const y = player.y + Math.sin(angle) * dist;

    this.boss = new Boss(this.scene, x, y);
    this.scene.cameras.main.flash(500, 255, 0, 0);
    this.scene.events.emit('bossSpawned');
  }

  checkBossCollision(playerX: number, playerY: number, playerRadius: number): number {
    if (!this.boss || !this.boss.active) return 0;
    const dist = Phaser.Math.Distance.Between(playerX, playerY, this.boss.x, this.boss.y);
    if (dist < playerRadius + 40) {
      return this.boss.damage;
    }
    return 0;
  }

  damageBoss(amount: number): boolean {
    if (!this.boss) return false;
    const dead = this.boss.takeDamage(amount);
    if (dead) {
      this.scene.cameras.main.shake(500, 0.02);
      this.scene.tweens.add({
        targets: this.boss,
        scaleX: 0, scaleY: 0, alpha: 0,
        duration: 500,
        onComplete: () => {
          this.boss?.destroy();
          this.boss = null;
        },
      });
      return true;
    }
    return false;
  }
}
