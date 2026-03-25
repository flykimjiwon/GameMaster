import Phaser from "phaser";

export class BaseSprite extends Phaser.GameObjects.Container {
  private gfx: Phaser.GameObjects.Graphics;
  private hpText: Phaser.GameObjects.Text;
  private hpBarGfx: Phaser.GameObjects.Graphics;
  private maxHp: number;
  private currentHp: number;
  private baseColor: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    size: number,
    color: number,
    hp: number
  ) {
    super(scene, x, y);
    this.maxHp = hp;
    this.currentHp = hp;
    this.baseColor = color;

    this.gfx = scene.add.graphics();
    this.hpBarGfx = scene.add.graphics();
    this.add(this.gfx);
    this.add(this.hpBarGfx);

    // Draw base (pentagon/hexagon shape)
    this.gfx.fillStyle(color, 0.8);
    const r = size / 2;
    const points: Phaser.Geom.Point[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push(new Phaser.Geom.Point(
        Math.cos(angle) * r,
        Math.sin(angle) * r
      ));
    }
    this.gfx.fillPoints(points, true);
    this.gfx.lineStyle(2, 0xffffff, 0.5);
    this.gfx.strokePoints(points, true);

    // Inner glow
    this.gfx.fillStyle(0xffffff, 0.2);
    this.gfx.fillCircle(0, 0, r * 0.4);

    // HP text
    this.hpText = scene.add.text(0, r + 8, `${hp}`, {
      fontSize: "14px",
      fontFamily: "monospace",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.add(this.hpText);

    this.drawHpBar(r);
    scene.add.existing(this);
  }

  private drawHpBar(radius: number): void {
    const g = this.hpBarGfx;
    g.clear();

    const barWidth = radius * 3;
    const barHeight = 6;
    const yOff = radius + 22;
    const ratio = Math.max(0, this.currentHp / this.maxHp);

    g.fillStyle(0x333333, 0.8);
    g.fillRect(-barWidth / 2, yOff, barWidth, barHeight);

    const hpColor = ratio > 0.5 ? 0x4caf50 : ratio > 0.25 ? 0xffeb3b : 0xf44336;
    g.fillStyle(hpColor, 0.9);
    g.fillRect(-barWidth / 2, yOff, barWidth * ratio, barHeight);

    g.lineStyle(1, 0xffffff, 0.2);
    g.strokeRect(-barWidth / 2, yOff, barWidth, barHeight);
  }

  updateHp(hp: number): void {
    this.currentHp = hp;
    this.hpText.setText(`${Math.ceil(hp)}`);

    const r = 16;
    this.drawHpBar(r);

    // Flash effect on damage
    if (hp < this.maxHp) {
      this.scene.tweens.add({
        targets: this.gfx,
        alpha: 0.4,
        duration: 100,
        yoyo: true,
      });
    }
  }
}
