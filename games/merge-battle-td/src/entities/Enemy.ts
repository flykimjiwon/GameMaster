import Phaser from 'phaser';
import { ENEMY_STATS, EnemyType } from '../config';

let enemyIdCounter = 0;

export class Enemy extends Phaser.GameObjects.Container {
  id: string;
  enemyType: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  distanceTraveled: number = 0;
  slowFactor: number = 1;
  slowTimer: number = 0;
  isDead: boolean = false;
  hasEscaped: boolean = false;

  private bodyGfx: Phaser.GameObjects.Graphics;
  private hpBarBg: Phaser.GameObjects.Graphics;
  private hpBarFill: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType) {
    super(scene, x, y);
    this.id = `enemy_${enemyIdCounter++}`;
    this.enemyType = type;
    const stats = ENEMY_STATS[type];
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.speed = stats.speed;

    this.bodyGfx = scene.add.graphics();
    this.hpBarBg = scene.add.graphics();
    this.hpBarFill = scene.add.graphics();

    this.add([this.bodyGfx, this.hpBarBg, this.hpBarFill]);
    this.drawBody();
    this.drawHpBar();

    this.setDepth(20);
    scene.add.existing(this);
  }

  private drawBody(): void {
    const stats = ENEMY_STATS[this.enemyType];
    const r = stats.radius;
    this.bodyGfx.clear();

    if (stats.shape === 'triangle') {
      // Wolf — triangle
      this.bodyGfx.fillStyle(stats.color, 0.9);
      this.bodyGfx.fillTriangle(0, -r, -r, r, r, r);
      this.bodyGfx.lineStyle(1, 0xffffff, 0.4);
      this.bodyGfx.strokeTriangle(0, -r, -r, r, r, r);
    } else {
      // Circle (goblin, troll)
      this.bodyGfx.fillStyle(stats.color, 0.9);
      this.bodyGfx.fillCircle(0, 0, r);
      this.bodyGfx.lineStyle(1, 0xffffff, 0.3);
      this.bodyGfx.strokeCircle(0, 0, r);
    }
  }

  drawHpBar(): void {
    const w = 24;
    const h = 4;
    const y = -ENEMY_STATS[this.enemyType].radius - 8;

    this.hpBarBg.clear();
    this.hpBarBg.fillStyle(0x333333, 0.8);
    this.hpBarBg.fillRect(-w / 2, y, w, h);

    this.hpBarFill.clear();
    const ratio = Math.max(0, this.hp / this.maxHp);
    const color = ratio > 0.5 ? 0x44cc44 : ratio > 0.25 ? 0xcccc44 : 0xcc4444;
    this.hpBarFill.fillStyle(color, 0.9);
    this.hpBarFill.fillRect(-w / 2, y, w * ratio, h);
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.drawHpBar();
    if (this.hp <= 0) {
      this.isDead = true;
      return true;
    }
    return false;
  }

  applySlow(percent: number, duration: number): void {
    this.slowFactor = 1 - percent / 100;
    this.slowTimer = duration;
  }

  updateMovement(delta: number): void {
    // Update slow timer
    if (this.slowTimer > 0) {
      this.slowTimer -= delta / 1000;
      if (this.slowTimer <= 0) {
        this.slowFactor = 1;
      }
    }
  }
}
