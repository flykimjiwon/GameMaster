import Phaser from 'phaser';
import { TILE_SIZE, NUMBER_COLORS } from '../config/gameConfig';

export class Tile extends Phaser.GameObjects.Container {
  value: number;
  gridCol: number;
  gridRow: number;
  bg: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  selected: boolean = false;
  isExploding: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number, col: number, row: number) {
    super(scene, x, y);

    this.value = value;
    this.gridCol = col;
    this.gridRow = row;

    const color = NUMBER_COLORS[value] ?? 0xFFFFFF;

    // Background rounded rect
    this.bg = scene.add.graphics();
    this.drawBg(color, false);
    this.add(this.bg);

    // Number label
    this.label = scene.add.text(0, 0, String(value), {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial',
      color: '#ffffff',
      stroke: '#00000066',
      strokeThickness: 3,
    });
    this.label.setOrigin(0.5, 0.5);
    this.add(this.label);

    scene.add.existing(this);
    this.setSize(TILE_SIZE, TILE_SIZE);
    this.setInteractive();
  }

  private drawBg(color: number, selected: boolean): void {
    this.bg.clear();
    const s = TILE_SIZE;
    const r = 12;

    if (selected) {
      // Glow shadow
      this.bg.fillStyle(color, 0.4);
      this.bg.fillRoundedRect(-s / 2 - 6, -s / 2 - 6, s + 12, s + 12, r + 4);
    }

    // Main tile
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-s / 2, -s / 2, s, s, r);

    // Highlight
    this.bg.fillStyle(0xFFFFFF, 0.15);
    this.bg.fillRoundedRect(-s / 2 + 4, -s / 2 + 4, s - 8, s / 3, r - 4);
  }

  setSelected(selected: boolean): void {
    this.selected = selected;
    const color = NUMBER_COLORS[this.value] ?? 0xFFFFFF;
    this.drawBg(color, selected);

    if (selected) {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 80,
        ease: 'Back.easeOut',
      });
    } else {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 80,
        ease: 'Back.easeIn',
      });
    }
  }

  playExplosion(): Promise<void> {
    this.isExploding = true;
    return new Promise((resolve) => {
      // Create particle burst
      const color = NUMBER_COLORS[this.value] ?? 0xFFFFFF;
      this.createParticleBurst(color);

      // Scale up + fade out
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.6,
        scaleY: 1.6,
        alpha: 0,
        duration: 280,
        ease: 'Power2.easeOut',
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  private createParticleBurst(color: number): void {
    const numParticles = 8;
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const speed = Phaser.Math.Between(60, 140);
      const particle = this.scene.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, Phaser.Math.Between(4, 8));
      particle.setPosition(this.x, this.y);
      particle.setDepth(10);

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: particle,
        x: this.x + vx,
        y: this.y + vy,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 400,
        ease: 'Power2.easeOut',
        onComplete: () => {
          particle.destroy();
        },
      });
    }

    // Flash ring
    const ring = this.scene.add.graphics();
    ring.lineStyle(3, color, 0.9);
    ring.strokeCircle(0, 0, TILE_SIZE / 2);
    ring.setPosition(this.x, this.y);
    ring.setDepth(10);

    this.scene.tweens.add({
      targets: ring,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 350,
      ease: 'Power2.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  playDrop(targetY: number): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        y: targetY,
        duration: 220,
        ease: 'Bounce.easeOut',
        onComplete: () => resolve(),
      });
    });
  }
}
