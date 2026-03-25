import Phaser from 'phaser';
import { UPGRADES } from '../config/stages';
import { SaveData, StageSelectScene } from './StageSelectScene';

export class UpgradeScene extends Phaser.Scene {
  private saveData!: SaveData;

  constructor() {
    super({ key: 'UpgradeScene' });
  }

  init(data: { saveData: SaveData }): void {
    this.saveData = data.saveData ?? {
      clearedStages: [],
      upgradePoints: 0,
      upgradeLevels: {},
    };
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a1a3a, 0x1a1a3a, 1);
    bg.fillRect(0, 0, W, H);

    this.add.text(W / 2, 35, 'UPGRADES', {
      fontSize: '26px', color: '#FFD700', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0.5);

    const pointsText = this.add.text(W / 2, 68, `Available Points: ${this.saveData.upgradePoints}`, {
      fontSize: '16px', color: '#FFD700', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);

    this.add.text(W / 2, 92, 'Earn 1 point per stage cleared', {
      fontSize: '12px', color: '#888899', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);

    const cardW = 200;
    const cardH = 140;
    const padX = 20;
    const cols = 4;
    const totalW = cols * cardW + (cols - 1) * padX;
    const startX = (W - totalW) / 2;
    const startY = 115;

    const cards: Array<{
      levelText: Phaser.GameObjects.Text;
      buyBtn: Phaser.GameObjects.Text;
      progressBar: Phaser.GameObjects.Graphics;
      upgradeId: string;
    }> = [];

    for (let i = 0; i < UPGRADES.length; i++) {
      const upg = UPGRADES[i];
      const col = i % cols;
      const cx = startX + col * (cardW + padX);
      const cy = startY;

      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x111133, 1);
      cardBg.lineStyle(2, 0x4455AA, 1);
      cardBg.fillRect(cx, cy, cardW, cardH);
      cardBg.strokeRect(cx, cy, cardW, cardH);

      this.add.text(cx + cardW / 2, cy + 18, upg.name, {
        fontSize: '14px', color: '#FFD700', fontFamily: 'monospace',
      }).setOrigin(0.5, 0.5);

      this.add.text(cx + cardW / 2, cy + 38, upg.description, {
        fontSize: '10px', color: '#aaaacc', fontFamily: 'monospace',
        wordWrap: { width: cardW - 16 },
        align: 'center',
      }).setOrigin(0.5, 0.5);

      const currentLevel = this.saveData.upgradeLevels[upg.id] ?? 0;

      const levelText = this.add.text(cx + cardW / 2, cy + 68, `Level: ${currentLevel} / ${upg.maxLevel}`, {
        fontSize: '12px', color: '#ccccee', fontFamily: 'monospace',
      }).setOrigin(0.5, 0.5);

      const progressBg = this.add.graphics();
      progressBg.fillStyle(0x222244, 1);
      progressBg.fillRect(cx + 10, cy + 80, cardW - 20, 8);
      const progressBar = this.add.graphics();
      const pct = currentLevel / upg.maxLevel;
      progressBar.fillStyle(0x4488FF, 1);
      progressBar.fillRect(cx + 10, cy + 80, (cardW - 20) * pct, 8);

      const costText = currentLevel < upg.maxLevel
        ? `[BUY: ${upg.costPerLevel}pt]`
        : '[MAX]';
      const costColor = currentLevel < upg.maxLevel
        ? (this.saveData.upgradePoints >= upg.costPerLevel ? '#44FF44' : '#FF4444')
        : '#888888';

      const buyBtn = this.add.text(cx + cardW / 2, cy + 112, costText, {
        fontSize: '13px', color: costColor, fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5, 0.5);

      if (currentLevel < upg.maxLevel) {
        buyBtn.setInteractive({ useHandCursor: true });
        buyBtn.on('pointerover', () => {
          if (this.saveData.upgradePoints >= upg.costPerLevel) {
            buyBtn.setColor('#88FF88');
          }
        });
        buyBtn.on('pointerout', () => {
          const canAfford = this.saveData.upgradePoints >= upg.costPerLevel;
          buyBtn.setColor(canAfford ? '#44FF44' : '#FF4444');
        });
        buyBtn.on('pointerdown', () => {
          const lvl = this.saveData.upgradeLevels[upg.id] ?? 0;
          if (lvl >= upg.maxLevel) return;
          if (this.saveData.upgradePoints < upg.costPerLevel) return;

          this.saveData.upgradePoints -= upg.costPerLevel;
          this.saveData.upgradeLevels[upg.id] = lvl + 1;

          StageSelectScene.persistSave(this.saveData);

          // Refresh scene
          this.scene.restart({ saveData: this.saveData });
        });
      }

      cards.push({ levelText, buyBtn, progressBar, upgradeId: upg.id });
    }

    // Back button
    const backBtn = this.add.text(W / 2, H - 40, '[ BACK TO STAGE SELECT ]', {
      fontSize: '16px', color: '#44aaff', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setColor('#88ccff'));
    backBtn.on('pointerout', () => backBtn.setColor('#44aaff'));
    backBtn.on('pointerdown', () => {
      this.scene.start('StageSelectScene');
    });

    // Refresh points display
    void pointsText;
  }
}
