import Phaser from 'phaser';
import { EnemySpawnConfig } from '../config/stages';

const ENEMY_COLORS: Record<string, number> = {
  grunt:  0x884444,
  runner: 0x884488,
  brute:  0x448844,
  boss:   0xAA2222,
};

const ENEMY_SIZE: Record<string, number> = {
  grunt:  14,
  runner: 12,
  brute:  22,
  boss:   32,
};

export class Enemy extends Phaser.GameObjects.Container {
  enemyType: string;
  hp: number;
  maxHp: number;
  attack: number;
  speed: number;
  lastAttackTime: number;
  target: Phaser.GameObjects.Container | null;
  attackRange: number;
  attackCooldown: number;
  reward: number;

  private body_gfx: Phaser.GameObjects.Graphics;
  hpBar: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, config: EnemySpawnConfig) {
    super(scene, x, y);

    this.enemyType = config.type;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.attack = config.attack;
    this.speed = config.speed;
    this.lastAttackTime = 0;
    this.target = null;
    this.attackRange = this.enemyType === 'runner' ? 35 : 45;
    this.attackCooldown = this.enemyType === 'brute' ? 1200 : this.enemyType === 'boss' ? 1500 : 900;
    this.reward = this.enemyType === 'boss' ? 5 : this.enemyType === 'brute' ? 3 : 1;

    this.body_gfx = scene.add.graphics();
    this.hpBar = scene.add.graphics();

    this.add([this.body_gfx, this.hpBar]);
    this.drawEnemy();
    scene.add.existing(this);
  }

  drawEnemy(): void {
    const radius = ENEMY_SIZE[this.enemyType] ?? 14;
    const color = ENEMY_COLORS[this.enemyType] ?? 0x884444;

    this.body_gfx.clear();
    this.body_gfx.lineStyle(2, 0x222222, 1);
    this.body_gfx.fillStyle(color, 1);

    if (this.enemyType === 'brute') {
      // Square
      this.body_gfx.fillRect(-radius, -radius, radius * 2, radius * 2);
      this.body_gfx.strokeRect(-radius, -radius, radius * 2, radius * 2);
    } else if (this.enemyType === 'boss') {
      // Pentagon-ish
      this.body_gfx.fillStyle(color, 1);
      this.body_gfx.lineStyle(3, 0xff0000, 1);
      this.body_gfx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) this.body_gfx.moveTo(px, py);
        else this.body_gfx.lineTo(px, py);
      }
      this.body_gfx.closePath();
      this.body_gfx.fillPath();
      this.body_gfx.strokePath();
      // Eyes
      this.body_gfx.fillStyle(0xffff00, 1);
      this.body_gfx.fillCircle(-8, -6, 4);
      this.body_gfx.fillCircle(8, -6, 4);
      this.body_gfx.fillStyle(0x000000, 1);
      this.body_gfx.fillCircle(-8, -6, 2);
      this.body_gfx.fillCircle(8, -6, 2);
    } else if (this.enemyType === 'runner') {
      // Diamond
      this.body_gfx.beginPath();
      this.body_gfx.moveTo(0, -radius);
      this.body_gfx.lineTo(radius, 0);
      this.body_gfx.lineTo(0, radius);
      this.body_gfx.lineTo(-radius, 0);
      this.body_gfx.closePath();
      this.body_gfx.fillPath();
      this.body_gfx.strokePath();
    } else {
      // Circle grunt
      this.body_gfx.beginPath();
      this.body_gfx.arc(0, 0, radius, 0, Math.PI * 2);
      this.body_gfx.closePath();
      this.body_gfx.fillPath();
      this.body_gfx.strokePath();
      // Simple face
      this.body_gfx.fillStyle(0x000000, 1);
      this.body_gfx.fillCircle(-4, -3, 2);
      this.body_gfx.fillCircle(4, -3, 2);
      this.body_gfx.lineStyle(1, 0x000000, 1);
      this.body_gfx.beginPath();
      this.body_gfx.moveTo(-4, 4);
      this.body_gfx.lineTo(4, 4);
      this.body_gfx.strokePath();
    }

    this.updateHpBar();
  }

  updateHpBar(): void {
    this.hpBar.clear();
    const w = (ENEMY_SIZE[this.enemyType] ?? 14) * 2 + 4;
    const h = 4;
    const halfW = w / 2;
    const topY = -(ENEMY_SIZE[this.enemyType] ?? 14) - 8;
    const pct = Math.max(0, this.hp / this.maxHp);
    this.hpBar.fillStyle(0x333333, 0.8);
    this.hpBar.fillRect(-halfW, topY, w, h);
    this.hpBar.fillStyle(0xff4444, 1);
    this.hpBar.fillRect(-halfW, topY, w * pct, h);
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.updateHpBar();
    if (this.hp <= 0) {
      this.hp = 0;
      return true;
    }
    this.scene.tweens.add({
      targets: this.body_gfx,
      alpha: { from: 0.3, to: 1 },
      duration: 100,
      ease: 'Linear',
    });
    return false;
  }

  canAttack(time: number): boolean {
    return time - this.lastAttackTime >= this.attackCooldown;
  }

  playAttack(time: number): void {
    this.lastAttackTime = time;
    this.scene.tweens.add({
      targets: this,
      x: this.x - 10,
      duration: 80,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
