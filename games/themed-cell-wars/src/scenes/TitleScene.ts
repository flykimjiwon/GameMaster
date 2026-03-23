import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const cx = GAME_CONFIG.WIDTH / 2;
    const cy = GAME_CONFIG.HEIGHT / 2;

    // 배경: 어두운 혈관
    this.add.rectangle(cx, cy, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT, 0x0A0E1A);

    // Decorative neon glow rings
    const gfx = this.add.graphics();
    gfx.lineStyle(2, 0x00E5FF, 0.15);
    gfx.strokeCircle(cx, cy, 220);
    gfx.lineStyle(1, 0x00E5FF, 0.08);
    gfx.strokeCircle(cx, cy, 260);

    // 제목: "세포 전쟁" 한글 + "CELL WARS" 영문
    this.add.text(cx, cy - 100, '세포 전쟁', {
      fontSize: '52px', color: '#00E5FF', fontFamily: 'monospace',
      fontStyle: 'bold', align: 'center',
      stroke: '#004466', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 42, 'CELL WARS', {
      fontSize: '22px', color: '#00E5FF', fontFamily: 'monospace',
      fontStyle: 'bold', letterSpacing: 8,
    }).setOrigin(0.5).setAlpha(0.75);

    // Subtitle
    this.add.text(cx, cy + 10, '인체 내부의 면역 전쟁', {
      fontSize: '13px', color: '#448AFF', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 34, 'Move: WASD / Touch', {
      fontSize: '13px', color: '#446677', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Button
    const btn = this.add.rectangle(cx, cy + 90, 220, 52, 0x005566).setInteractive({ useHandCursor: true });
    this.add.graphics().lineStyle(2, 0x00E5FF, 0.8).strokeRect(cx - 110, cy + 64, 220, 52);
    this.add.text(cx, cy + 90, '▶  START', {
      fontSize: '22px', color: '#00E5FF', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x007799));
    btn.on('pointerout', () => btn.setFillStyle(0x005566));
    btn.on('pointerdown', () => this.scene.start('GameScene'));
  }
}
