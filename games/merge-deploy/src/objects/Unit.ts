import Phaser from 'phaser';
import { UnitType, UnitStats, UNIT_COLORS, TIER_COLORS } from '../config/units';

export class Unit extends Phaser.GameObjects.Container {
  unitType: UnitType;
  tier: number;
  stats: UnitStats;
  currentHp: number;
  lastAttackTime: number;
  target: Phaser.GameObjects.Container | null;
  isDeployed: boolean;
  gridCol: number;
  gridRow: number;

  private body_gfx: Phaser.GameObjects.Graphics;
  private icon_gfx: Phaser.GameObjects.Graphics;
  hpBar: Phaser.GameObjects.Graphics;
  private tierLabel: Phaser.GameObjects.Text;
  private attackCooldown: number;

  constructor(scene: Phaser.Scene, x: number, y: number, unitType: UnitType, tier: number, stats: UnitStats) {
    super(scene, x, y);

    this.unitType = unitType;
    this.tier = tier;
    this.stats = stats;
    this.currentHp = stats.hp;
    this.lastAttackTime = 0;
    this.target = null;
    this.isDeployed = false;
    this.gridCol = -1;
    this.gridRow = -1;
    this.attackCooldown = 1000 / stats.attackSpeed;

    this.body_gfx = scene.add.graphics();
    this.icon_gfx = scene.add.graphics();
    this.hpBar = scene.add.graphics();
    this.tierLabel = scene.add.text(0, 0, '', {
      fontSize: '9px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);

    this.add([this.body_gfx, this.icon_gfx, this.hpBar, this.tierLabel]);
    this.drawUnit();
    scene.add.existing(this);
  }

  drawUnit(): void {
    const radius = 18;
    const color = UNIT_COLORS[this.unitType];
    const tierColor = TIER_COLORS[this.tier - 1];

    this.body_gfx.clear();
    // Tier glow ring
    this.body_gfx.lineStyle(3, tierColor, 1);
    this.body_gfx.fillStyle(color, 1);
    this.body_gfx.beginPath();
    this.body_gfx.arc(0, 0, radius, 0, Math.PI * 2);
    this.body_gfx.closePath();
    this.body_gfx.fillPath();
    this.body_gfx.strokePath();

    this.icon_gfx.clear();
    this.icon_gfx.lineStyle(2, 0xffffff, 0.9);
    this.icon_gfx.fillStyle(0xffffff, 0.9);

    if (this.unitType === 'warrior') {
      // Sword icon
      this.icon_gfx.beginPath();
      this.icon_gfx.moveTo(0, -10);
      this.icon_gfx.lineTo(0, 8);
      this.icon_gfx.strokePath();
      this.icon_gfx.beginPath();
      this.icon_gfx.moveTo(-5, -2);
      this.icon_gfx.lineTo(5, -2);
      this.icon_gfx.strokePath();
      this.icon_gfx.fillRect(-2, -12, 4, 4);
    } else if (this.unitType === 'archer') {
      // Bow icon
      this.icon_gfx.beginPath();
      this.icon_gfx.arc(3, 0, 8, -Math.PI * 0.6, Math.PI * 0.6);
      this.icon_gfx.strokePath();
      this.icon_gfx.beginPath();
      this.icon_gfx.moveTo(3, -6);
      this.icon_gfx.lineTo(3, 6);
      this.icon_gfx.strokePath();
      // Arrow
      this.icon_gfx.beginPath();
      this.icon_gfx.moveTo(-6, 0);
      this.icon_gfx.lineTo(5, 0);
      this.icon_gfx.strokePath();
      this.icon_gfx.fillTriangle(6, 0, 3, -2, 3, 2);
    } else {
      // Staff icon
      this.icon_gfx.beginPath();
      this.icon_gfx.moveTo(0, -11);
      this.icon_gfx.lineTo(0, 10);
      this.icon_gfx.strokePath();
      // Orb
      this.icon_gfx.lineStyle(2, 0xffffff, 0.9);
      this.icon_gfx.strokeCircle(0, -13, 4);
      this.icon_gfx.fillStyle(0xAADDFF, 0.9);
      this.icon_gfx.fillCircle(0, -13, 3);
    }

    // Tier number
    this.tierLabel.setText(`T${this.tier}`);
    this.tierLabel.setPosition(12, -14);
    this.tierLabel.setStyle({ color: `#${tierColor.toString(16).padStart(6, '0')}`, fontSize: '9px' });

    this.updateHpBar();
  }

  updateHpBar(): void {
    this.hpBar.clear();
    const w = 32;
    const h = 4;
    const pct = Math.max(0, this.currentHp / this.stats.hp);
    this.hpBar.fillStyle(0x333333, 0.8);
    this.hpBar.fillRect(-w / 2, 22, w, h);
    const barColor = pct > 0.5 ? 0x44ff44 : pct > 0.25 ? 0xffaa00 : 0xff4444;
    this.hpBar.fillStyle(barColor, 1);
    this.hpBar.fillRect(-w / 2, 22, w * pct, h);
  }

  takeDamage(amount: number): boolean {
    this.currentHp -= amount;
    this.updateHpBar();
    if (this.currentHp <= 0) {
      this.currentHp = 0;
      return true;
    }
    // Flash red
    this.scene.tweens.add({
      targets: this.body_gfx,
      alpha: { from: 0.3, to: 1 },
      duration: 120,
      ease: 'Linear',
    });
    return false;
  }

  canAttack(time: number): boolean {
    return time - this.lastAttackTime >= this.attackCooldown;
  }

  playAttack(time: number): void {
    this.lastAttackTime = time;
    if (!this.stats.isRanged) {
      // Lunge forward
      const origX = this.x;
      this.scene.tweens.add({
        targets: this,
        x: this.x + 12,
        duration: 80,
        yoyo: true,
        ease: 'Sine.easeOut',
        onComplete: () => { this.x = origX; },
      });
    } else {
      // Scale pulse
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 80,
        yoyo: true,
        ease: 'Sine.easeOut',
      });
    }
  }

  playDeploy(targetX: number, targetY: number): void {
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      scaleX: { from: 1.4, to: 1 },
      scaleY: { from: 1.4, to: 1 },
      duration: 400,
      ease: 'Back.easeOut',
    });
  }

  playMerge(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
