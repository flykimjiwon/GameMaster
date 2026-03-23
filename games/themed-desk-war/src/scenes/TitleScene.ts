import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const cx = GAME_CONFIG.WIDTH / 2;
    const cy = GAME_CONFIG.HEIGHT / 2;

    this.add.rectangle(cx, cy, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT, 0x0d0d1a);

    this.add.text(cx, cy - 80, 'SURVIVOR\nDEFENSE', {
      fontSize: '48px', color: '#00ff88', fontFamily: 'monospace',
      fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 20, 'Move: WASD / Touch', {
      fontSize: '14px', color: '#888888', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const btn = this.add.rectangle(cx, cy + 80, 200, 50, 0x238636).setInteractive({ useHandCursor: true });
    this.add.text(cx, cy + 80, 'START', {
      fontSize: '24px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x2ea043));
    btn.on('pointerout', () => btn.setFillStyle(0x238636));
    btn.on('pointerdown', () => this.scene.start('GameScene'));
  }
}
