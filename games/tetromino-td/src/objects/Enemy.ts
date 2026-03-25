import Phaser from 'phaser';
import { EnemyType, ENEMY_CONFIGS } from '../config/enemies';
import { CELL_SIZE } from './Grid';

export interface StatusEffect {
  type: 'slow' | 'poison';
  duration: number;   // seconds remaining
  value: number;      // slow fraction or dot damage/s
}

export class Enemy {
  public scene: Phaser.Scene;
  public type: EnemyType;
  public hp: number;
  public maxHp: number;
  public baseSpeed: number;  // cells per second
  public reward: number;
  public alive: boolean = true;
  public reachedEnd: boolean = false;
  public id: number;

  private graphics: Phaser.GameObjects.Graphics;
  private hpBarGraphics: Phaser.GameObjects.Graphics;

  // World position (pixels)
  public x: number;
  public y: number;

  // Path: array of [pixelX, pixelY] waypoints
  public path: Array<[number, number]> = [];
  private pathIndex: number = 0;

  public statusEffects: StatusEffect[] = [];

  private static idCounter = 0;

  constructor(scene: Phaser.Scene, type: EnemyType, startX: number, startY: number) {
    this.id = ++Enemy.idCounter;
    this.scene = scene;
    this.type = type;
    this.x = startX;
    this.y = startY;

    const config = ENEMY_CONFIGS[type];
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.baseSpeed = config.speed;
    this.reward = config.reward;

    this.graphics = scene.add.graphics();
    this.hpBarGraphics = scene.add.graphics();
    this.graphics.setDepth(20);
    this.hpBarGraphics.setDepth(21);

    this.draw();
  }

  setPath(path: Array<[number, number]>): void {
    this.path = path;
    this.pathIndex = 0;
  }

  getCurrentSpeed(): number {
    let speed = this.baseSpeed;
    for (const eff of this.statusEffects) {
      if (eff.type === 'slow') {
        speed *= (1 - eff.value);
      }
    }
    return Math.max(speed, 0.1);
  }

  update(delta: number): void {
    if (!this.alive) return;

    const dt = delta / 1000;

    // Update status effects
    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
      const eff = this.statusEffects[i];
      eff.duration -= dt;
      if (eff.type === 'poison') {
        this.hp -= eff.value * dt;
        if (this.hp <= 0) {
          this.die();
          return;
        }
      }
      if (eff.duration <= 0) {
        this.statusEffects.splice(i, 1);
      }
    }

    // Move along path
    if (this.pathIndex >= this.path.length) {
      this.reachedEnd = true;
      this.alive = false;
      this.draw();
      return;
    }

    const [tx, ty] = this.path[this.pathIndex];
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveAmount = this.getCurrentSpeed() * CELL_SIZE * dt;

    if (dist <= moveAmount) {
      this.x = tx;
      this.y = ty;
      this.pathIndex++;
    } else {
      this.x += (dx / dist) * moveAmount;
      this.y += (dy / dist) * moveAmount;
    }

    this.draw();
  }

  takeDamage(amount: number): void {
    if (!this.alive) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.die();
    } else {
      this.draw();
    }
  }

  applyStatus(effect: StatusEffect): void {
    if (!this.alive) return;
    // Replace existing same-type effect if new one is stronger/longer
    const existing = this.statusEffects.findIndex(e => e.type === effect.type);
    if (existing >= 0) {
      this.statusEffects[existing].duration = Math.max(
        this.statusEffects[existing].duration,
        effect.duration
      );
    } else {
      this.statusEffects.push({ ...effect });
    }
  }

  die(): void {
    this.alive = false;
    this.hp = 0;
    this.graphics.clear();
    this.hpBarGraphics.clear();
  }

  private draw(): void {
    if (!this.alive) {
      this.graphics.clear();
      this.hpBarGraphics.clear();
      return;
    }

    const config = ENEMY_CONFIGS[this.type];
    this.graphics.clear();

    // Check if slowed (blue tint) or poisoned (green tint)
    let color = config.color;
    const hasSlow = this.statusEffects.some(e => e.type === 'slow');
    const hasPoison = this.statusEffects.some(e => e.type === 'poison');
    if (hasPoison) color = 0x88ff88;
    else if (hasSlow) color = 0x88aaff;

    this.graphics.fillStyle(color, 1);
    this.graphics.fillCircle(this.x, this.y, config.size);

    // Dark outline
    this.graphics.lineStyle(1, 0x000000, 0.8);
    this.graphics.strokeCircle(this.x, this.y, config.size);

    // Boss crown
    if (this.type === 'boss') {
      this.graphics.fillStyle(0xffdd00, 1);
      this.graphics.fillTriangle(
        this.x - 8, this.y - config.size - 2,
        this.x, this.y - config.size - 8,
        this.x + 8, this.y - config.size - 2
      );
    }

    // HP bar
    this.hpBarGraphics.clear();
    const barW = config.size * 2 + 4;
    const barH = 4;
    const barX = this.x - barW / 2;
    const barY = this.y - config.size - 8;
    const hpFrac = Math.max(0, this.hp / this.maxHp);

    this.hpBarGraphics.fillStyle(0x333333, 0.9);
    this.hpBarGraphics.fillRect(barX, barY, barW, barH);

    const hpColor = hpFrac > 0.5 ? 0x00ff00 : hpFrac > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBarGraphics.fillStyle(hpColor, 1);
    this.hpBarGraphics.fillRect(barX, barY, barW * hpFrac, barH);
  }

  getDistanceToEnd(): number {
    if (this.pathIndex >= this.path.length) return 0;
    let dist = 0;
    let px = this.x;
    let py = this.y;
    for (let i = this.pathIndex; i < this.path.length; i++) {
      const [tx, ty] = this.path[i];
      dist += Math.sqrt((tx - px) * (tx - px) + (ty - py) * (ty - py));
      px = tx;
      py = ty;
    }
    return dist;
  }

  destroy(): void {
    this.graphics.destroy();
    this.hpBarGraphics.destroy();
  }
}
