import Phaser from 'phaser';
import { BOSS_CONFIG } from '../config';
import type { GameScene } from '../scenes/GameScene';

export class Boss extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;
  public hp: number;
  public maxHp: number;
  public damage: number;
  public speed: number;
  private hasSplit: boolean = false;
  private gfx: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = BOSS_CONFIG.hp;
    this.maxHp = BOSS_CONFIG.hp;
    this.damage = BOSS_CONFIG.damage;
    this.speed = BOSS_CONFIG.speed;

    this.body.setCircle(BOSS_CONFIG.radius, -BOSS_CONFIG.radius, -BOSS_CONFIG.radius);

    this.gfx = scene.add.graphics();
    this.add(this.gfx);
    this.draw();
  }

  private draw(): void {
    this.gfx.clear();
    // Outer glow
    this.gfx.fillStyle(0xff0000, 0.2);
    this.gfx.fillCircle(0, 0, BOSS_CONFIG.radius + 8);
    // Body
    this.gfx.fillStyle(BOSS_CONFIG.color, 1);
    this.gfx.fillCircle(0, 0, BOSS_CONFIG.radius);
    // Eyes
    this.gfx.fillStyle(0xffffff, 1);
    this.gfx.fillCircle(-12, -8, 6);
    this.gfx.fillCircle(12, -8, 6);
    this.gfx.fillStyle(0x000000, 1);
    this.gfx.fillCircle(-10, -8, 3);
    this.gfx.fillCircle(14, -8, 3);
    // Crown
    this.gfx.fillStyle(0xffdd00, 1);
    this.gfx.fillTriangle(-15, -BOSS_CONFIG.radius + 5, -10, -BOSS_CONFIG.radius - 10, -5, -BOSS_CONFIG.radius + 5);
    this.gfx.fillTriangle(-5, -BOSS_CONFIG.radius + 5, 0, -BOSS_CONFIG.radius - 15, 5, -BOSS_CONFIG.radius + 5);
    this.gfx.fillTriangle(5, -BOSS_CONFIG.radius + 5, 10, -BOSS_CONFIG.radius - 10, 15, -BOSS_CONFIG.radius + 5);
  }

  followTarget(target: Phaser.GameObjects.Container): void {
    if (!this.active || !target.active) return;
    this.scene.physics.moveToObject(this, target, this.speed);
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;

    // Split at 50% HP
    if (!this.hasSplit && this.hp <= this.maxHp * BOSS_CONFIG.splitThreshold) {
      this.hasSplit = true;
      this.splitSpawn();
    }

    return this.hp <= 0;
  }

  private splitSpawn(): void {
    const gameScene = this.scene as GameScene;
    for (let i = 0; i < BOSS_CONFIG.splitCount; i++) {
      const angle = (Math.PI * 2 / BOSS_CONFIG.splitCount) * i;
      const dist = 60;
      const enemy = gameScene.spawner?.spawnEnemy('slime');
      if (enemy) {
        enemy.setPosition(
          this.x + Math.cos(angle) * dist,
          this.y + Math.sin(angle) * dist
        );
      }
    }
    // Camera shake
    this.scene.cameras.main.shake(300, 0.01);
  }
}
