import Phaser from 'phaser';
import { TOWER_COLORS, TOWER_COLOR_NAMES } from '../config/tetrominos';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2a, 0x1a0a2a, 1);
    bg.fillRect(0, 0, width, height);

    // Animated grid background
    const gridGfx = this.add.graphics();
    gridGfx.lineStyle(1, 0x222244, 0.4);
    for (let x = 0; x < width; x += 32) {
      gridGfx.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 32) {
      gridGfx.lineBetween(0, y, width, y);
    }

    // Title
    const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '52px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#8844ff',
      strokeThickness: 4,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#8844ff',
        blur: 12,
        fill: true,
      },
    };

    const title = this.add.text(width / 2, height / 2 - 160, 'TETROMINO TD', titleStyle);
    title.setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 - 100, 'Tetris meets Tower Defense', {
      fontSize: '18px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaacc',
    }).setOrigin(0.5);

    // Tower type legend
    const legendY = height / 2 - 50;
    const types: Array<{ label: string; color: string; desc: string }> = [
      { label: '■ FIRE', color: TOWER_COLOR_NAMES.fire, desc: 'AoE Damage' },
      { label: '■ ICE', color: TOWER_COLOR_NAMES.ice, desc: 'Slows Enemies' },
      { label: '■ POISON', color: TOWER_COLOR_NAMES.poison, desc: 'Damage over Time' },
      { label: '■ LIGHTNING', color: TOWER_COLOR_NAMES.lightning, desc: 'Piercing Attack' },
    ];

    this.add.text(width / 2, legendY, 'TOWER TYPES', {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#888899',
    }).setOrigin(0.5);

    types.forEach((t, i) => {
      const x = width / 2 - 170 + i * 90;
      this.add.text(x, legendY + 24, t.label, {
        fontSize: '14px',
        fontFamily: 'Courier New, monospace',
        color: t.color,
      }).setOrigin(0.5);
      this.add.text(x, legendY + 40, t.desc, {
        fontSize: '10px',
        fontFamily: 'Courier New, monospace',
        color: '#666677',
      }).setOrigin(0.5);
    });

    // Controls
    const controlsY = height / 2 + 10;
    const controls = [
      '← → : Move Piece',
      '↑ / Z : Rotate',
      'Space : Hard Drop',
      '↓ : Soft Drop',
      'Shift/C : Hold',
      'P : Pause',
    ];

    this.add.text(width / 2, controlsY, 'CONTROLS', {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#888899',
    }).setOrigin(0.5);

    controls.forEach((ctrl, i) => {
      this.add.text(
        width / 2,
        controlsY + 20 + i * 18,
        ctrl,
        {
          fontSize: '13px',
          fontFamily: 'Courier New, monospace',
          color: '#ccccdd',
        }
      ).setOrigin(0.5);
    });

    // Start button
    const btnY = height / 2 + 200;
    const btnBg = this.add.rectangle(width / 2, btnY, 220, 50, 0x4422aa, 1);
    btnBg.setStrokeStyle(2, 0xaa88ff);
    btnBg.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(width / 2, btnY, 'START GAME', {
      fontSize: '22px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.fillColor = 0x6633cc;
      btnText.setColor('#ffeecc');
    });
    btnBg.on('pointerout', () => {
      btnBg.fillColor = 0x4422aa;
      btnText.setColor('#ffffff');
    });
    btnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('GameScene');
      });
    });

    // Keyboard start
    const enter = this.input.keyboard?.addKey('ENTER');
    const space = this.input.keyboard?.addKey('SPACE');
    enter?.on('down', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('GameScene'));
    });
    space?.on('down', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('GameScene'));
    });

    // Pulsing start button
    this.tweens.add({
      targets: btnBg,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Fade in
    this.cameras.main.fadeIn(600, 0, 0, 0);
  }
}
