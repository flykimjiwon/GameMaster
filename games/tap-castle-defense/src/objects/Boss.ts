import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

export class Boss extends Enemy {
  private bossGfx: Phaser.GameObjects.Graphics;
  private crownGfx: Phaser.GameObjects.Graphics;
  private bossHpText: Phaser.GameObjects.Text;
  private phase: number = 1;
  private chargeTimer: number = 8000;
  private isCharging: boolean = false;
  private pulseTimer: number = 0;
  private baseSpeed: number;

  constructor(scene: Phaser.Scene, config: EnemyConfig) {
    super(scene, config);
    this.baseSpeed = this.speed;

    this.bossGfx = scene.add.graphics();
    this.crownGfx = scene.add.graphics();
    this.bossHpText = scene.add.text(0, 0, 'BOSS', {
      fontSize: '14px',
      color: '#ff44ff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });

    this.add([this.bossGfx, this.crownGfx, this.bossHpText]);
    this.drawBoss();
  }

  protected drawBody(): void {
    // Override with boss-specific drawing after bossGfx is created
    if (this.bossGfx) this.drawBoss();
  }

  private drawBoss(): void {
    const g = this.bossGfx;
    if (!g) return;
    g.clear();
    const r = this.spec.size;

    // Aura glow
    g.fillStyle(0x8B008B, 0.25);
    g.fillCircle(0, 0, r + 12);

    // Body
    g.fillStyle(this.spec.bodyColor, 1);
    g.fillCircle(0, 0, r);

    // Head
    g.fillStyle(this.spec.bodyColor, 1);
    g.fillCircle(0, -r - 12, r * 0.75);

    // Eyes (glowing red)
    g.fillStyle(0xff0000, 1);
    g.fillCircle(-6, -r - 14, 4);
    g.fillCircle(6, -r - 14, 4);
    g.fillStyle(0xff8800, 1);
    g.fillCircle(-6, -r - 14, 2);
    g.fillCircle(6, -r - 14, 2);

    // Armor plates
    g.fillStyle(0x4a4a8a, 1);
    g.fillRect(-r * 0.7, -r * 0.3, r * 1.4, r * 0.6);

    // Armor rivets
    g.fillStyle(0x8888cc, 1);
    for (let i = -1; i <= 1; i++) {
      g.fillCircle(i * r * 0.5, 0, 4);
    }

    // Shoulder pads
    g.fillStyle(0x5555aa, 1);
    g.fillCircle(-r - 4, -r * 0.2, 8);
    g.fillCircle(r + 4, -r * 0.2, 8);

    // Weapon (big axe)
    g.fillStyle(0x888888, 1);
    g.fillRect(r + 8, -r - 8, 6, r * 2);
    g.fillStyle(0xbbbbbb, 1);
    g.fillTriangle(r + 8, -r - 8, r + 22, -r - 4, r + 8, -r + 8);

    // Outline
    g.lineStyle(3, 0xff00ff, 0.8);
    g.strokeCircle(0, 0, r);
    g.strokeCircle(0, -r - 12, r * 0.75);

    // Charge indicator
    if (this.isCharging) {
      g.fillStyle(0xff8800, 0.5);
      g.fillCircle(0, 0, r + 18);
    }

    // Crown
    const c = this.crownGfx;
    if (!c) return;
    c.clear();
    const topY = -r - 12 - r * 0.75 - 2;
    c.fillStyle(0xffdd00, 1);
    c.fillRect(-18, topY - 12, 36, 12);
    // Crown spikes
    c.fillTriangle(-18, topY - 12, -12, topY - 22, -6, topY - 12);
    c.fillTriangle(-6, topY - 12, 0, topY - 26, 6, topY - 12);
    c.fillTriangle(6, topY - 12, 12, topY - 22, 18, topY - 12);
    // Gems
    c.fillStyle(0xff4444, 1);
    c.fillCircle(-12, topY - 6, 3);
    c.fillStyle(0x44ff44, 1);
    c.fillCircle(0, topY - 6, 3);
    c.fillStyle(0x4444ff, 1);
    c.fillCircle(12, topY - 6, 3);

    if (this.bossHpText) {
      this.bossHpText.setPosition(-20, -r - 12 - r * 0.75 - 38);
    }
  }

  update(delta: number): void {
    super.update(delta);
    if (!this.alive) return;

    // Phase transition at 50% HP
    if (this.hp < this.maxHp * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.speed = this.baseSpeed * 1.4;
      // Rage effect
      this.scene.cameras.main.shake(300, 0.01);
    }

    // Charge attack every 8s
    this.chargeTimer -= delta;
    if (this.chargeTimer <= 0) {
      this.chargeTimer = 8000;
      this.startCharge();
    }

    // Pulse aura
    this.pulseTimer += delta;
    if (this.pulseTimer > 500) {
      this.pulseTimer = 0;
      this.drawBoss();
    }
  }

  private startCharge(): void {
    if (!this.alive) return;
    this.isCharging = true;
    const origSpeed = this.speed;
    this.speed = origSpeed * 3;
    this.drawBoss();

    this.scene.time.delayedCall(1200, () => {
      if (!this.alive) return;
      this.isCharging = false;
      this.speed = origSpeed;
      this.drawBoss();
    });
  }

  destroy(fromScene?: boolean): void {
    this.bossGfx?.destroy();
    this.crownGfx?.destroy();
    this.bossHpText?.destroy();
    super.destroy(fromScene);
  }
}
