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
    const r = BOSS_CONFIG.radius;

    // 슈퍼박테리아 (Resistor Prime)
    // 3px outer glow
    this.gfx.fillStyle(0xFF6D00, 0.12);
    this.gfx.fillCircle(0, 0, r + 12);
    this.gfx.lineStyle(3, 0xFF6D00, 0.7);
    this.gfx.strokeCircle(0, 0, r + 6);
    this.gfx.lineStyle(2, 0xFF6D00, 0.4);
    this.gfx.strokeCircle(0, 0, r + 10);

    // Outer membrane — dark base
    this.gfx.fillStyle(0x7A2500, 1);
    this.gfx.fillCircle(0, 0, r);

    // Inner body
    this.gfx.fillStyle(BOSS_CONFIG.color, 0.9);
    this.gfx.fillCircle(0, 0, r * 0.82);

    // 이중 외막: 육각형 패턴 (hexagonal resistance shield, 0xFFD600)
    const hexCount = 8;
    const hexR = r * 0.88;
    for (let i = 0; i < hexCount; i++) {
      const angle = (Math.PI * 2 / hexCount) * i;
      const hx = Math.cos(angle) * hexR * 0.55;
      const hy = Math.sin(angle) * hexR * 0.55;
      this.gfx.lineStyle(1.5, 0xFFD600, 0.75);
      // Draw small hexagon at each position
      this.gfx.beginPath();
      const hs = 9;
      for (let j = 0; j < 6; j++) {
        const ha = (Math.PI / 3) * j;
        const px = hx + Math.cos(ha) * hs;
        const py = hy + Math.sin(ha) * hs;
        if (j === 0) this.gfx.moveTo(px, py);
        else this.gfx.lineTo(px, py);
      }
      this.gfx.closePath();
      this.gfx.strokePath();
      this.gfx.fillStyle(0xFFD600, 0.12);
      this.gfx.fillPath();
    }
    // Outer hexagon ring outline
    this.gfx.lineStyle(2, 0xFFD600, 0.45);
    this.gfx.strokeCircle(0, 0, r * 0.88);

    // 유출 펌프 돌출부 (efflux pump protrusions, 0xFF3D00) — 6 bumps
    const pumpCount = 6;
    for (let i = 0; i < pumpCount; i++) {
      const angle = (Math.PI * 2 / pumpCount) * i + Math.PI / pumpCount;
      const px = Math.cos(angle) * (r - 4);
      const py = Math.sin(angle) * (r - 4);
      this.gfx.fillStyle(0xFF3D00, 1);
      this.gfx.fillCircle(px, py, 6);
      this.gfx.lineStyle(1.5, 0xFFD600, 0.8);
      this.gfx.strokeCircle(px, py, 6);
      // pump channel line
      this.gfx.lineStyle(1, 0xFF3D00, 0.6);
      this.gfx.lineBetween(Math.cos(angle) * r * 0.4, Math.sin(angle) * r * 0.4, px, py);
    }

    // Core highlight
    this.gfx.fillStyle(0xFFAA44, 0.35);
    this.gfx.fillCircle(-r * 0.2, -r * 0.2, r * 0.25);
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
