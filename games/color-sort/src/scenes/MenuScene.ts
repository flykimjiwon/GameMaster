import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/levels';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Background
    const gfx = this.add.graphics();
    gfx.fillGradientStyle(0x0f0f1a, 0x0f0f1a, 0x1a1030, 0x1a1030, 1);
    gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Decorative circles
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6, 0xe67e22];
    for (let i = 0; i < 20; i++) {
      const c = colors[i % colors.length];
      const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const y = Phaser.Math.Between(100, GAME_HEIGHT - 100);
      const circle = this.add.circle(x, y, Phaser.Math.Between(8, 20), c, 0.12);
      this.tweens.add({
        targets: circle,
        y: y + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 200, '🧪', {
      fontSize: '64px',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 280, '컬러 소팅', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 320, '같은 색끼리 정렬하세요!', {
      fontSize: '16px',
      color: '#888',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    // Start button
    const btnBg = this.add.rectangle(GAME_WIDTH / 2, 420, 200, 56, 0x6c5ce7, 1)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(GAME_WIDTH / 2, 420, '게임 시작', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
      targets: [btnBg, btnText],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x7c6cf7));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x6c5ce7));
    btnBg.on('pointerup', () => this.scene.start('GameScene', { level: 1 }));

    // Level select button
    const selectBg = this.add.rectangle(GAME_WIDTH / 2, 490, 160, 42, 0x333355, 1)
      .setInteractive({ useHandCursor: true });

    this.add.text(GAME_WIDTH / 2, 490, '스테이지 선택', {
      fontSize: '16px',
      color: '#aaa',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    selectBg.on('pointerover', () => selectBg.setFillStyle(0x444466));
    selectBg.on('pointerout', () => selectBg.setFillStyle(0x333355));
    selectBg.on('pointerup', () => this.scene.start('LevelSelect'));
  }
}
