import Phaser from 'phaser';

export class Castle extends Phaser.GameObjects.Container {
  private wallGraphics: Phaser.GameObjects.Graphics;
  private towerGraphics: Phaser.GameObjects.Graphics;
  private hpBar: Phaser.GameObjects.Graphics;
  private hpText: Phaser.GameObjects.Text;

  maxHp: number;
  hp: number;

  // Shooting tip position (top of the main tower)
  shootOriginX: number;
  shootOriginY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, maxHp: number) {
    super(scene, x, y);
    this.maxHp = maxHp;
    this.hp = maxHp;

    this.wallGraphics = scene.add.graphics();
    this.towerGraphics = scene.add.graphics();
    this.hpBar = scene.add.graphics();
    this.hpText = scene.add.text(0, 0, '', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });

    this.add([this.wallGraphics, this.towerGraphics, this.hpBar, this.hpText]);
    scene.add.existing(this);

    this.drawCastle();

    // Shoot origin: top-right of the main tower
    this.shootOriginX = x + 50;
    this.shootOriginY = y - 120;
  }

  private drawCastle(): void {
    const g = this.wallGraphics;
    g.clear();

    // Main wall base
    g.fillStyle(0x4a3728, 1);
    g.fillRect(-20, -60, 100, 80);

    // Stone pattern on wall
    g.fillStyle(0x5a4535, 1);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const offset = row % 2 === 0 ? 0 : 10;
        g.fillRect(-20 + col * 20 + offset, -55 + row * 18, 18, 14);
      }
    }

    // Battlements (top row of wall)
    g.fillStyle(0x4a3728, 1);
    for (let i = 0; i < 5; i++) {
      g.fillRect(-20 + i * 22, -80, 14, 22);
    }

    // Gate arch
    g.fillStyle(0x1a0f0a, 1);
    g.fillRect(10, -20, 30, 40);

    // Gate arc top (approximate with ellipse)
    g.fillEllipse(25, -20, 30, 20);

    // Gate reinforcement
    g.lineStyle(2, 0x8B6914, 1);
    g.strokeRect(10, -20, 30, 40);

    const t = this.towerGraphics;
    t.clear();

    // Main tower (left side, taller)
    t.fillStyle(0x3a2a1e, 1);
    t.fillRect(-50, -140, 70, 100);

    // Tower stone details
    t.fillStyle(0x4a3525, 1);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        const offset = row % 2 === 0 ? 0 : 12;
        t.fillRect(-50 + col * 24 + offset, -135 + row * 18, 20, 14);
      }
    }

    // Tower battlements
    t.fillStyle(0x3a2a1e, 1);
    for (let i = 0; i < 4; i++) {
      t.fillRect(-50 + i * 18, -158, 12, 20);
    }

    // Flag on tower
    t.fillStyle(0xcc2222, 1);
    t.fillTriangle(-10, -165, -10, -145, 10, -155);

    // Flag pole
    t.lineStyle(2, 0x8B4513, 1);
    t.lineBetween(-10, -170, -10, -130);

    // Arrow slit (window on tower)
    t.fillStyle(0x0a0a0a, 1);
    t.fillRect(-25, -110, 6, 18);
    t.fillRect(-5, -110, 6, 18);

    // Torch effect (orange glow near gate)
    t.fillStyle(0xff8800, 0.9);
    t.fillCircle(14, -30, 4);
    t.fillStyle(0xffff00, 0.7);
    t.fillCircle(14, -32, 2);
  }

  drawHpBar(): void {
    const g = this.hpBar;
    g.clear();

    const barW = 120;
    const barH = 10;
    const bx = -30;
    const by = -190;

    // Background
    g.fillStyle(0x330000, 1);
    g.fillRect(bx, by, barW, barH);

    // HP fill
    const ratio = Math.max(0, this.hp / this.maxHp);
    const fillColor = ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff2222;
    g.fillStyle(fillColor, 1);
    g.fillRect(bx, by, Math.floor(barW * ratio), barH);

    // Border
    g.lineStyle(1, 0x888888, 1);
    g.strokeRect(bx, by, barW, barH);

    this.hpText.setText(`${this.hp} / ${this.maxHp}`);
    this.hpText.setPosition(bx + barW / 2 - this.hpText.width / 2, by - 14);
  }

  takeDamage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);
    this.drawHpBar();

    // Flash red
    this.scene.tweens.add({
      targets: this.wallGraphics,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 1,
    });

    return this.hp <= 0;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.drawHpBar();
  }

  setMaxHp(newMax: number): void {
    this.maxHp = newMax;
    this.drawHpBar();
  }

  update(): void {
    this.drawHpBar();
  }
}
