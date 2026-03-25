import Phaser from 'phaser';
import { EnemyType, EnemySpec, ENEMY_SPECS } from '../config/enemies';

export interface EnemyConfig {
  type: EnemyType;
  x: number;
  y: number;
  hpScale: number;
  speedScale: number;
  onReachCastle: (damage: number) => void;
  onDeath: (enemy: Enemy) => void;
}

export class Enemy extends Phaser.GameObjects.Container {
  readonly enemyType: EnemyType;
  readonly spec: EnemySpec;

  maxHp: number;
  hp: number;
  speed: number;

  private bodyGraphics: Phaser.GameObjects.Graphics;
  private hpBar: Phaser.GameObjects.Graphics;
  private statusText: Phaser.GameObjects.Text;

  protected onReachCastle: (damage: number) => void;
  protected onDeath: (enemy: Enemy) => void;

  private slowed: boolean = false;
  private slowFactor: number = 1.0;
  private slowTimer: number = 0;

  private poisoned: boolean = false;
  private poisonDamage: number = 0;
  private poisonTimer: number = 0;
  private poisonTick: number = 0;

  private frozen: boolean = false;

  alive: boolean = true;
  private castleX: number = 120; // target X (castle right edge)
  private castleReached: boolean = false;

  // For archer type: ranged attack
  private attackCooldown: number = 0;
  protected archerProjectiles: Phaser.GameObjects.Graphics[] = [];

  constructor(scene: Phaser.Scene, config: EnemyConfig) {
    super(scene, config.x, config.y);

    this.enemyType = config.type;
    this.spec = ENEMY_SPECS[config.type];
    this.maxHp = Math.floor(this.spec.hp * config.hpScale);
    this.hp = this.maxHp;
    this.speed = this.spec.speed * config.speedScale;
    this.onReachCastle = config.onReachCastle;
    this.onDeath = config.onDeath;

    this.bodyGraphics = scene.add.graphics();
    this.hpBar = scene.add.graphics();
    this.statusText = scene.add.text(0, 0, '', {
      fontSize: '9px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });

    this.add([this.bodyGraphics, this.hpBar, this.statusText]);
    scene.add.existing(this);

    this.drawBody();
    this.drawHpBar();
  }

  protected drawBody(): void {
    const g = this.bodyGraphics;
    g.clear();
    const r = this.spec.size;

    // Body (circle)
    g.fillStyle(this.spec.bodyColor, 1);
    g.fillCircle(0, 0, r);

    // Head (smaller circle above)
    g.fillStyle(this.spec.bodyColor, 1);
    g.fillCircle(0, -r - 8, r * 0.65);

    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-4, -r - 9, 3);
    g.fillCircle(4, -r - 9, 3);
    g.fillStyle(0x111111, 1);
    g.fillCircle(-4, -r - 9, 1.5);
    g.fillCircle(4, -r - 9, 1.5);

    // Type-specific details
    if (this.enemyType === 'archer') {
      // Bow detail
      g.lineStyle(2, 0x8B4513, 1);
      g.strokeEllipse(r + 4, 0, 8, 22);
    } else if (this.enemyType === 'shield') {
      // Shield on left side
      g.fillStyle(0x888888, 1);
      g.fillRect(-r - 12, -r * 0.8, 10, r * 1.6);
      g.fillStyle(0x666666, 1);
      g.fillRect(-r - 10, -r * 0.3, 6, r * 0.6);
      // Shield boss emblem
      g.fillStyle(0xddaa00, 1);
      g.fillCircle(-r - 7, 0, 3);
    }

    // Outline
    g.lineStyle(2, this.spec.color, 1);
    g.strokeCircle(0, 0, r);
    g.strokeCircle(0, -r - 8, r * 0.65);

    // Slow/freeze visual
    if (this.slowed) {
      g.fillStyle(0x44ccff, 0.35);
      g.fillCircle(0, 0, r + 4);
    }

    // Poison visual
    if (this.poisoned) {
      g.fillStyle(0x44ff44, 0.25);
      g.fillCircle(0, 0, r + 3);
    }
  }

  drawHpBar(): void {
    const g = this.hpBar;
    g.clear();
    const r = this.spec.size;
    const barW = r * 3;
    const barH = 5;
    const bx = -barW / 2;
    const by = -r - 22;

    g.fillStyle(0x330000, 1);
    g.fillRect(bx, by, barW, barH);

    const ratio = Math.max(0, this.hp / this.maxHp);
    const col = ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff2222;
    g.fillStyle(col, 1);
    g.fillRect(bx, by, Math.floor(barW * ratio), barH);

    g.lineStyle(1, 0x666666, 0.8);
    g.strokeRect(bx, by, barW, barH);

    // Status icons
    let status = '';
    if (this.slowed) status += '❄';
    if (this.poisoned) status += '☠';
    this.statusText.setText(status);
    this.statusText.setPosition(-this.statusText.width / 2, by - 14);
  }

  takeDamage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);
    this.drawHpBar();

    // Flash white
    this.scene.tweens.add({
      targets: this.bodyGraphics,
      alpha: 0.2,
      duration: 60,
      yoyo: true,
    });

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  applySlow(factor: number, duration: number): void {
    this.slowed = true;
    this.slowFactor = factor;
    this.slowTimer = duration;
    this.drawBody();
    this.drawHpBar();
  }

  applyPoison(dps: number, duration: number): void {
    this.poisoned = true;
    this.poisonDamage = dps;
    this.poisonTimer = duration;
    this.poisonTick = 500;
    this.drawBody();
    this.drawHpBar();
  }

  protected die(): void {
    if (!this.alive) return;
    this.alive = false;

    // Death particles
    for (let i = 0; i < 8; i++) {
      const px = this.x;
      const py = this.y;
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.graphics();
      particle.fillStyle(this.spec.bodyColor, 1);
      particle.fillCircle(0, 0, 4);
      particle.setPosition(px, py);
      this.scene.tweens.add({
        targets: particle,
        x: px + Math.cos(angle) * 40,
        y: py + Math.sin(angle) * 40,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }

    this.onDeath(this);
    this.destroy();
  }

  update(delta: number): void {
    if (!this.alive || this.castleReached) return;

    // Status timers
    if (this.slowed) {
      this.slowTimer -= delta;
      if (this.slowTimer <= 0) {
        this.slowed = false;
        this.slowFactor = 1.0;
        this.drawBody();
      }
    }

    if (this.poisoned) {
      this.poisonTimer -= delta;
      this.poisonTick -= delta;
      if (this.poisonTick <= 0) {
        this.poisonTick = 500;
        this.takeDamage(this.poisonDamage);
        if (!this.alive) return;
      }
      if (this.poisonTimer <= 0) {
        this.poisoned = false;
        this.drawBody();
      }
    }

    // Move left toward castle
    const effectiveSpeed = this.slowed ? this.speed * this.slowFactor : this.speed;
    this.x -= effectiveSpeed * (delta / 1000);

    // Slight vertical wobble for movement feel
    this.y += Math.sin(this.x * 0.05) * 0.3;

    // Check castle reach
    if (this.x <= this.castleX) {
      this.castleReached = true;
      this.onReachCastle(this.spec.damage);
      this.destroy();
    }

    // Archer ranged attack
    if (this.enemyType === 'archer' && this.spec.attackRange && this.spec.attackRate) {
      this.attackCooldown -= delta;
      if (this.attackCooldown <= 0) {
        this.attackCooldown = this.spec.attackRate;
        // Archer attacks the castle (visual only — damage handled by reach)
        this.fireArcherArrow();
      }
    }
  }

  private fireArcherArrow(): void {
    if (!this.scene || !this.alive) return;
    // Visual archer arrow going left
    const arrow = this.scene.add.graphics();
    arrow.lineStyle(2, 0x8B4513, 1);
    arrow.lineBetween(0, 0, -15, 0);
    arrow.fillStyle(0x8B4513, 1);
    arrow.fillTriangle(-15, 0, -10, -3, -10, 3);
    arrow.setPosition(this.x, this.y);

    this.scene.tweens.add({
      targets: arrow,
      x: this.castleX,
      y: this.y + Phaser.Math.Between(-20, 20),
      duration: 600,
      ease: 'Linear',
      onComplete: () => {
        // Archer arrow hitting castle deals damage via event
        this.scene?.events.emit('archerHitCastle', this.spec.arrowDamage ?? 5);
        arrow.destroy();
      },
    });
  }

  destroy(fromScene?: boolean): void {
    this.archerProjectiles.forEach(p => p.destroy());
    super.destroy(fromScene);
  }
}
