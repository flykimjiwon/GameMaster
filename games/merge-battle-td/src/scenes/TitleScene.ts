import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { getAllThemes, setTheme, getTheme, ThemeId } from '../themes/ThemeSystem';

export class TitleScene extends Phaser.Scene {
  private selectedIdx = 0;
  private themeButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const themes = getAllThemes();
    const theme = getTheme();

    // Background
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, theme.background);

    // Title
    this.add.text(cx, 60, 'MERGE BATTLE TD', {
      fontSize: '42px', color: theme.hudAccentColor, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 105, '머지 타워 디펜스', {
      fontSize: '18px', color: theme.hudTextColor,
    }).setOrigin(0.5);

    // Theme selector label
    this.add.text(cx, 160, '▼ 테마 선택 ▼', {
      fontSize: '14px', color: theme.hudTextColor,
    }).setOrigin(0.5);

    // Theme buttons
    const btnWidth = 200;
    const btnHeight = 80;
    const startY = 200;
    const spacing = 95;

    themes.forEach((t, i) => {
      const y = startY + i * spacing;
      const isSelected = t.id === theme.id;

      const btnBg = this.add.rectangle(0, 0, btnWidth, btnHeight, t.background)
        .setStrokeStyle(isSelected ? 3 : 1, isSelected ? 0xffcc44 : 0x666666)
        .setInteractive({ useHandCursor: true });

      // Theme preview — small colored squares
      const preview = this.add.graphics();
      const previewColors = [
        t.towerVisuals.archer.color,
        t.towerVisuals.cannon.color,
        t.towerVisuals.slow.color,
      ];
      previewColors.forEach((c, ci) => {
        preview.fillStyle(c, 0.9);
        preview.fillRect(-60 + ci * 30, -25, 22, 22);
        preview.lineStyle(1, t.gridLineColor, 0.8);
        preview.strokeRect(-60 + ci * 30, -25, 22, 22);
      });

      // Grid preview
      preview.fillStyle(t.gridCellColor, t.gridCellAlpha);
      preview.fillRect(20, -25, 22, 22);
      preview.lineStyle(1, t.gridLineColor, t.gridLineAlpha);
      preview.strokeRect(20, -25, 22, 22);

      // Path preview
      preview.fillStyle(t.pathColor, t.pathAlpha);
      preview.fillRect(48, -25, 22, 22);

      const nameText = this.add.text(0, 12, t.nameKo, {
        fontSize: '14px', color: isSelected ? '#ffcc44' : '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);

      const nameEn = this.add.text(0, 28, t.name, {
        fontSize: '10px', color: '#999999',
      }).setOrigin(0.5);

      const container = this.add.container(cx, y, [btnBg, preview, nameText, nameEn]);
      this.themeButtons.push(container);

      btnBg.on('pointerover', () => {
        if (this.selectedIdx !== i) btnBg.setStrokeStyle(2, 0xaaaaaa);
      });
      btnBg.on('pointerout', () => {
        if (this.selectedIdx !== i) btnBg.setStrokeStyle(1, 0x666666);
      });
      btnBg.on('pointerdown', () => {
        this.selectedIdx = i;
        setTheme(t.id as ThemeId);
        this.scene.restart();
      });
    });

    // Start button
    const startY2 = startY + themes.length * spacing + 20;
    const startBg = this.add.rectangle(cx, startY2, 200, 55, 0x44cc44).setInteractive({ useHandCursor: true });
    this.add.text(cx, startY2, 'START', {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startBg,
      scaleX: 1.05, scaleY: 1.05,
      duration: 800, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });

    startBg.on('pointerover', () => startBg.setFillStyle(0x55dd55));
    startBg.on('pointerout', () => startBg.setFillStyle(0x44cc44));
    startBg.on('pointerdown', () => this.scene.start('BuildScene'));

    // Version
    this.add.text(cx, GAME_HEIGHT - 15, 'Prototype v0.1', {
      fontSize: '11px', color: '#555555',
    }).setOrigin(0.5);
  }
}
