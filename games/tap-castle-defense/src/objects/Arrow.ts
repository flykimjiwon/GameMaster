import Phaser from 'phaser';
import { WeaponType, WeaponSpec, WEAPON_SPECS } from '../config/weapons';

export interface ArrowConfig {
  weaponType: WeaponType;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  damage: number;
  isCritical: boolean;
  speedMultiplier: number;
  onHit?: (arrow: Arrow, hitX: number, hitY: number) => void;
  onComplete?: (arrow: Arrow) => void;
}

export class Arrow extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  private trail: { x: number; y: number }[] = [];
  private trailGraphics: Phaser.GameObjects.Graphics;

  readonly weaponType: WeaponType;
  readonly spec: WeaponSpec;
  readonly damage: number;
  readonly isCritical: boolean;
  readonly onHit?: (arrow: Arrow, hitX: number, hitY: number) => void;
  readonly onComplete?: (arrow: Arrow) => void;

  private startX: number;
  private startY: number;
  private targetX: number;
  private targetY: number;
  private totalDist: number;
  private travelledDist: number = 0;
  private arrowSpeed: number;
  private travelAngle: number;
  private alive: boolean = true;
  private pierceCount: number;

  constructor(scene: Phaser.Scene, config: ArrowConfig) {
    super(scene, config.startX, config.startY);

    this.weaponType = config.weaponType;
    this.spec = WEAPON_SPECS[config.weaponType];
    this.damage = config.damage;
    this.isCritical = config.isCritical;
    this.onHit = config.onHit;
    this.onComplete = config.onComplete;
    this.startX = config.startX;
    this.startY = config.startY;
    this.targetX = config.targetX;
    this.targetY = config.targetY;
    this.arrowSpeed = this.spec.speed * config.speedMultiplier;
    this.pierceCount = this.spec.piercePower ?? 0;

    const dx = config.targetX - config.startX;
    const dy = config.targetY - config.startY;
    this.totalDist = Math.sqrt(dx * dx + dy * dy);
    this.travelAngle = Math.atan2(dy, dx);

    this.trailGraphics = scene.add.graphics();
    this.graphics = scene.add.graphics();
    this.add([this.trailGraphics, this.graphics]);

    scene.add.existing(this);
    this.drawArrow();
  }

  private drawArrow(): void {
    const g = this.graphics;
    g.clear();

    const len = 22;
    const headLen = 8;
    const halfW = 2;

    // Arrow shaft
    g.lineStyle(3, this.spec.color, 1);
    g.lineBetween(-len / 2, 0, len / 2 - headLen, 0);

    // Arrow head (triangle)
    g.fillStyle(this.spec.color, 1);
    g.fillTriangle(
      len / 2, 0,
      len / 2 - headLen, -halfW * 2,
      len / 2 - headLen, halfW * 2,
    );

    // Fletching
    g.lineStyle(2, 0xffffff, 0.6);
    g.lineBetween(-len / 2, 0, -len / 2 + 6, -4);
    g.lineBetween(-len / 2, 0, -len / 2 + 6, 4);

    // Critical glow
    if (this.isCritical) {
      g.lineStyle(6, this.spec.color, 0.3);
      g.strokeCircle(0, 0, 10);
    }

    // Special weapon markers
    if (this.weaponType === 'fire') {
      g.fillStyle(0xff6600, 0.8);
      g.fillCircle(len / 2 - 4, 0, 4);
    } else if (this.weaponType === 'ice') {
      g.fillStyle(0xaaddff, 0.9);
      // Draw a small diamond for ice marker
      const ix = len / 2 - 4;
      g.fillTriangle(ix, -4, ix - 3, 0, ix, 4);
      g.fillTriangle(ix, -4, ix + 3, 0, ix, 4);
    } else if (this.weaponType === 'lightning') {
      g.lineStyle(3, 0xffff88, 1);
      g.lineBetween(-4, -6, 0, 0);
      g.lineBetween(0, 0, 4, -6);
    } else if (this.weaponType === 'poison') {
      g.fillStyle(0x44ff44, 0.8);
      g.fillCircle(-len / 2 + 4, 0, 4);
    }
  }

  private updateTrail(worldX: number, worldY: number): void {
    this.trail.push({ x: worldX, y: worldY });
    if (this.trail.length > 12) this.trail.shift();

    const tg = this.trailGraphics;
    tg.clear();

    for (let i = 1; i < this.trail.length; i++) {
      const alpha = (i / this.trail.length) * 0.6;
      const width = (i / this.trail.length) * 3;
      tg.lineStyle(width, this.spec.trailColor, alpha);
      tg.lineBetween(
        this.trail[i - 1].x - this.x,
        this.trail[i - 1].y - this.y,
        this.trail[i].x - this.x,
        this.trail[i].y - this.y,
      );
    }
  }

  update(delta: number): void {
    if (!this.alive) return;

    const step = (this.arrowSpeed * delta) / 1000;
    this.travelledDist += step;

    const progress = Math.min(this.travelledDist / this.totalDist, 1);

    // Parabolic arc: y offset based on progress
    const arcHeight = Math.min(this.totalDist * 0.25, 120);
    const arcOffset = -Math.sin(progress * Math.PI) * arcHeight;

    const newX = this.startX + Math.cos(this.travelAngle) * this.travelledDist;
    const newY = this.startY + Math.sin(this.travelAngle) * this.travelledDist + arcOffset;

    // Rotate arrow to face direction of travel
    const prevX = this.x;
    const prevY = this.y;
    this.setPosition(newX, newY);

    const dx = newX - prevX;
    const dy = newY - prevY;
    if (Math.abs(dx) + Math.abs(dy) > 0.01) {
      this.setRotation(Math.atan2(dy, dx));
    }

    this.updateTrail(newX, newY);

    if (progress >= 1) {
      this.onComplete?.(this);
      this.destroy();
    }
  }

  registerHit(): boolean {
    if (!this.alive) return false;
    this.onHit?.(this, this.x, this.y);
    if (this.pierceCount > 0) {
      this.pierceCount--;
      return false; // don't destroy yet
    }
    this.alive = false;
    return true;
  }

  isAlive(): boolean {
    return this.alive;
  }

  destroy(fromScene?: boolean): void {
    this.trailGraphics.destroy();
    this.graphics.destroy();
    super.destroy(fromScene);
  }
}
