import Phaser from 'phaser';
import { ENEMY_CONFIG, type EnemyType } from '../config';

export class Enemy extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;
  public hp: number = 0;
  public maxHp: number = 0;
  public speed: number = 0;
  public damage: number = 0;
  public xpValue: number = 0;
  public enemyType: EnemyType = 'slime';

  private gfx: Phaser.GameObjects.Graphics;
  private hpBarGfx: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.gfx = scene.add.graphics();
    this.hpBarGfx = scene.add.graphics();
    this.add(this.gfx);
    this.add(this.hpBarGfx);
  }

  init(type: EnemyType, x: number, y: number): void {
    this.enemyType = type;
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.setAlpha(1);
    this.setScale(1);

    const cfg = ENEMY_CONFIG[type];
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.speed = cfg.speed;
    this.damage = cfg.damage;
    this.xpValue = cfg.xp;

    const radius = type === 'golem' ? ENEMY_CONFIG.golem.size / 2 : type === 'slime' ? ENEMY_CONFIG.slime.radius : ENEMY_CONFIG.bat.radius;
    this.body.setCircle(radius, -radius, -radius);

    this.drawShape();
    this.drawHpBar();
  }

  private drawShape(): void {
    this.gfx.clear();

    switch (this.enemyType) {
      case 'slime': {
        // 코로나 바이러스: 구형 몸체 + 방사형 스파이크 8개 + 네온 그린 발광
        const r = ENEMY_CONFIG.slime.radius;

        // Outer neon glow
        this.gfx.fillStyle(0x39FF14, 0.18);
        this.gfx.fillCircle(0, 0, r + 6);
        this.gfx.lineStyle(2, 0x39FF14, 0.6);
        this.gfx.strokeCircle(0, 0, r + 3);

        // Spike돌기 8개 (보라색 0xBF00FF)
        const spikeCount = 8;
        for (let i = 0; i < spikeCount; i++) {
          const angle = (Math.PI * 2 / spikeCount) * i;
          const sx = Math.cos(angle);
          const sy = Math.sin(angle);
          const baseW = 2.5;
          // spike as thin triangle
          this.gfx.fillStyle(0xBF00FF, 1);
          this.gfx.fillTriangle(
            sx * r + -sy * baseW, sy * r + sx * baseW,
            sx * r + sy * baseW,  sy * r + -sx * baseW,
            sx * (r + 7),          sy * (r + 7)
          );
          // tip dot
          this.gfx.fillStyle(0xE040FB, 1);
          this.gfx.fillCircle(sx * (r + 7), sy * (r + 7), 2);
        }

        // Body
        this.gfx.fillStyle(0x1B5E20, 1);
        this.gfx.fillCircle(0, 0, r);
        this.gfx.fillStyle(0x39FF14, 0.55);
        this.gfx.fillCircle(0, 0, r * 0.7);
        break;
      }
      case 'bat': {
        // 대장균: 캡슐형 몸체(노란) + 뒤쪽 편모 3개(주황)
        const r = ENEMY_CONFIG.bat.radius;
        const bodyW = r * 1.6;
        const bodyH = r;

        // Flagella 편모 — drawn behind body
        this.gfx.lineStyle(1.5, 0xFF6D00, 0.9);
        for (let i = -1; i <= 1; i++) {
          const startX = bodyW * 0.4;
          const startY = i * (bodyH * 0.3);
          // wavy tail: 3-segment approximation
          this.gfx.beginPath();
          this.gfx.moveTo(startX, startY);
          this.gfx.lineTo(startX + 4, startY + i * 2);
          this.gfx.lineTo(startX + 8, startY - i * 2);
          this.gfx.lineTo(startX + 12, startY + i * 3);
          this.gfx.strokePath();
        }

        // Body glow
        this.gfx.fillStyle(0xFFD600, 0.2);
        this.gfx.fillEllipse(0, 0, bodyW + 6, bodyH + 6);

        // Capsule body
        this.gfx.fillStyle(0xFFD600, 1);
        this.gfx.fillEllipse(0, 0, bodyW, bodyH);

        // Highlight
        this.gfx.fillStyle(0xFFFF8D, 0.5);
        this.gfx.fillEllipse(-bodyW * 0.15, -bodyH * 0.2, bodyW * 0.5, bodyH * 0.4);
        break;
      }
      case 'golem': {
        // 암세포: 울퉁불퉁 불규칙 형태(검정) + 빨간 균열선(0xFF1744)
        const s = ENEMY_CONFIG.golem.size;
        const r2 = s / 2;

        // Outer red glow
        this.gfx.fillStyle(0xFF1744, 0.15);
        this.gfx.fillCircle(0, 0, r2 + 6);

        // Irregular lumpy body — 12-point star with random radii baked in
        const lumps = 12;
        const radii = [1.0, 0.82, 1.12, 0.75, 1.08, 0.88, 1.15, 0.78, 1.05, 0.90, 1.10, 0.80];
        this.gfx.fillStyle(0x1A0005, 1);
        this.gfx.beginPath();
        for (let i = 0; i < lumps; i++) {
          const angle = (Math.PI * 2 / lumps) * i - Math.PI / 2;
          const pr = r2 * radii[i];
          if (i === 0) this.gfx.moveTo(Math.cos(angle) * pr, Math.sin(angle) * pr);
          else this.gfx.lineTo(Math.cos(angle) * pr, Math.sin(angle) * pr);
        }
        this.gfx.closePath();
        this.gfx.fillPath();

        // Red crack lines (균열선)
        this.gfx.lineStyle(2, 0xFF1744, 1);
        // crack 1
        this.gfx.beginPath();
        this.gfx.moveTo(-r2 * 0.3, -r2 * 0.5);
        this.gfx.lineTo(0, -r2 * 0.1);
        this.gfx.lineTo(r2 * 0.4, r2 * 0.3);
        this.gfx.strokePath();
        // crack 2
        this.gfx.beginPath();
        this.gfx.moveTo(r2 * 0.1, -r2 * 0.4);
        this.gfx.lineTo(-r2 * 0.2, r2 * 0.1);
        this.gfx.lineTo(-r2 * 0.5, r2 * 0.4);
        this.gfx.strokePath();

        // Red glow outline
        this.gfx.lineStyle(3, 0xFF1744, 0.5);
        this.gfx.strokeCircle(0, 0, r2 * 0.95);
        break;
      }
    }
  }

  private drawHpBar(): void {
    this.hpBarGfx.clear();
    if (this.hp >= this.maxHp) return;
    const w = 24;
    const h = 3;
    const yOff = this.enemyType === 'golem' ? -ENEMY_CONFIG.golem.size / 2 - 6 : -16;
    this.hpBarGfx.fillStyle(0x333333, 1);
    this.hpBarGfx.fillRect(-w / 2, yOff, w, h);
    this.hpBarGfx.fillStyle(0xff4444, 1);
    this.hpBarGfx.fillRect(-w / 2, yOff, w * (this.hp / this.maxHp), h);
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.drawHpBar();
    return this.hp <= 0;
  }

  followTarget(target: Phaser.GameObjects.Container): void {
    if (!this.active || !target.active) return;
    this.scene.physics.moveToObject(this, target, this.speed);
  }

  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
    this.body.setVelocity(0, 0);
  }
}
