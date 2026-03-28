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
    const cfg = ENEMY_CONFIG[this.enemyType];

    switch (this.enemyType) {
      case 'slime': {
        const slimeCfg = ENEMY_CONFIG.slime;
        this.gfx.fillStyle(slimeCfg.color, 1);
        this.gfx.fillCircle(0, 0, slimeCfg.radius);
        break;
      }
      case 'bat': {
        const batCfg = ENEMY_CONFIG.bat;
        this.gfx.fillStyle(batCfg.color, 1);
        const r = batCfg.radius;
        this.gfx.fillTriangle(0, -r, -r, r, r, r);
        break;
      }
      case 'golem': {
        const s = ENEMY_CONFIG.golem.size;
        this.gfx.fillStyle(cfg.color, 1);
        this.gfx.fillRect(-s / 2, -s / 2, s, s);
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
