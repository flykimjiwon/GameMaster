import Phaser from 'phaser';
import { STAGES } from '../config/stages';
import localforage from 'localforage';

const STORAGE_KEY = 'merge-deploy-save';

export interface SaveData {
  clearedStages: number[];
  upgradePoints: number;
  upgradeLevels: Record<string, number>;
}

const DEFAULT_SAVE: SaveData = {
  clearedStages: [],
  upgradePoints: 0,
  upgradeLevels: {},
};

export class StageSelectScene extends Phaser.Scene {
  private saveData: SaveData = { ...DEFAULT_SAVE };

  constructor() {
    super({ key: 'StageSelectScene' });
  }

  async create(): Promise<void> {
    const W = this.scale.width;
    const H = this.scale.height;

    // Load save
    const saved = await localforage.getItem<SaveData>(STORAGE_KEY);
    if (saved) {
      this.saveData = { ...DEFAULT_SAVE, ...saved };
    }

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a1a3a, 0x1a1a3a, 1);
    bg.fillRect(0, 0, W, H);

    // Title
    this.add.text(W / 2, 40, 'MERGE DEPLOY BATTLE', {
      fontSize: '28px',
      color: '#FFD700',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5, 0.5);

    this.add.text(W / 2, 75, 'Select Stage', {
      fontSize: '16px',
      color: '#aaaacc',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);

    // Points display
    this.add.text(W - 20, 20, `Points: ${this.saveData.upgradePoints}`, {
      fontSize: '14px',
      color: '#FFD700',
      fontFamily: 'monospace',
    }).setOrigin(1, 0);

    // Upgrade button
    const upgrBtn = this.add.text(W - 20, 45, '[UPGRADES]', {
      fontSize: '13px',
      color: '#44ccff',
      fontFamily: 'monospace',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    upgrBtn.on('pointerover', () => upgrBtn.setColor('#88eeff'));
    upgrBtn.on('pointerout', () => upgrBtn.setColor('#44ccff'));
    upgrBtn.on('pointerdown', () => {
      this.scene.start('UpgradeScene', { saveData: this.saveData });
    });

    // Stage grid — 2 rows of 5
    const stageW = 160;
    const stageH = 100;
    const cols = 5;
    const padX = 20;
    const padY = 16;
    const totalW = cols * stageW + (cols - 1) * padX;
    const startX = (W - totalW) / 2;
    const startY = 120;

    for (let i = 0; i < STAGES.length; i++) {
      const stage = STAGES[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (stageW + padX);
      const by = startY + row * (stageH + padY);

      const isCleared = this.saveData.clearedStages.includes(stage.id);
      const isUnlocked = stage.id === 1 || this.saveData.clearedStages.includes(stage.id - 1);

      this.createStageButton(bx, by, stageW, stageH, stage.id, stage.name, isCleared, isUnlocked);
    }

    // How to play
    const instrY = H - 80;
    this.add.text(W / 2, instrY, 'HOW TO PLAY', {
      fontSize: '13px', color: '#FFD700', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);

    this.add.text(W / 2, instrY + 20, 'Drag units to merge same type+tier  |  Merged units auto-deploy to battle lane  |  Auto-spawn fills grid every few seconds', {
      fontSize: '11px', color: '#888899', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);

    this.add.text(W / 2, instrY + 38, 'RED=Warrior(melee)  GREEN=Archer(ranged)  BLUE=Mage(AoE)  |  Destroy enemy base to win!', {
      fontSize: '11px', color: '#888899', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);
  }

  private createStageButton(
    x: number, y: number, w: number, h: number,
    stageId: number, name: string,
    isCleared: boolean, isUnlocked: boolean
  ): void {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    if (!isUnlocked) {
      bg.fillStyle(0x1a1a2a, 1);
      bg.lineStyle(1, 0x333355, 1);
    } else if (isCleared) {
      bg.fillStyle(0x1a3322, 1);
      bg.lineStyle(2, 0x44FF44, 1);
    } else {
      bg.fillStyle(0x1a1a3a, 1);
      bg.lineStyle(2, 0x4466AA, 1);
    }
    bg.fillRect(0, 0, w, h);
    bg.strokeRect(0, 0, w, h);

    const numColor = isUnlocked ? '#FFD700' : '#444455';
    this.add.text(x + w / 2, y + 20, `Stage ${stageId}`, {
      fontSize: '14px', color: numColor, fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0.5);

    const nameColor = isUnlocked ? '#ccccee' : '#444455';
    this.add.text(x + w / 2, y + 42, name, {
      fontSize: '12px', color: nameColor, fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);

    if (isCleared) {
      this.add.text(x + w / 2, y + 65, '★ CLEARED', {
        fontSize: '13px', color: '#FFD700', fontFamily: 'monospace',
      }).setOrigin(0.5, 0.5);
    } else if (!isUnlocked) {
      this.add.text(x + w / 2, y + 65, '🔒 LOCKED', {
        fontSize: '13px', color: '#444455', fontFamily: 'monospace',
      }).setOrigin(0.5, 0.5);
    } else {
      this.add.text(x + w / 2, y + 65, '▶ PLAY', {
        fontSize: '13px', color: '#44aaff', fontFamily: 'monospace',
      }).setOrigin(0.5, 0.5);
    }

    if (isUnlocked) {
      bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
      bg.on('pointerover', () => {
        bg.clear();
        if (isCleared) {
          bg.fillStyle(0x225533, 1);
          bg.lineStyle(2, 0x66FF66, 1);
        } else {
          bg.fillStyle(0x222244, 1);
          bg.lineStyle(2, 0x6688CC, 1);
        }
        bg.fillRect(0, 0, w, h);
        bg.strokeRect(0, 0, w, h);
      });
      bg.on('pointerout', () => {
        bg.clear();
        if (isCleared) {
          bg.fillStyle(0x1a3322, 1);
          bg.lineStyle(2, 0x44FF44, 1);
        } else {
          bg.fillStyle(0x1a1a3a, 1);
          bg.lineStyle(2, 0x4466AA, 1);
        }
        bg.fillRect(0, 0, w, h);
        bg.strokeRect(0, 0, w, h);
      });
      bg.on('pointerdown', () => {
        this.scene.start('GameScene', { stageId, saveData: this.saveData });
      });
    }

    container.add(bg);
  }

  static async loadSave(): Promise<SaveData> {
    const saved = await localforage.getItem<SaveData>(STORAGE_KEY);
    return saved ? { ...DEFAULT_SAVE, ...saved } : { ...DEFAULT_SAVE };
  }

  static async persistSave(data: SaveData): Promise<void> {
    await localforage.setItem(STORAGE_KEY, data);
  }
}
