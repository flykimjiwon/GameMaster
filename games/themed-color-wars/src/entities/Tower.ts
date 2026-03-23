import Phaser from 'phaser';
import { TOWER_COLORS, TIER_SIZES, TowerType } from '../config';
import { getTheme } from '../themes/ThemeSystem';

let towerIdCounter = 0;

export class Tower extends Phaser.GameObjects.Container {
  id: string;
  towerType: TowerType;
  tier: number;
  gridCol: number = -1;
  gridRow: number = -1;
  isOnGrid: boolean = false;
  private gfx: Phaser.GameObjects.Graphics;
  private tierText: Phaser.GameObjects.Text;
  lastAttackTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: TowerType, tier: number = 1) {
    super(scene, x, y);
    this.id = `tower_${towerIdCounter++}`;
    this.towerType = type;
    this.tier = tier;

    this.gfx = scene.add.graphics();
    this.tierText = scene.add.text(0, 0, `${tier}`, {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add([this.gfx, this.tierText]);
    this.drawTower();

    this.setSize(TIER_SIZES[tier - 1] * 2, TIER_SIZES[tier - 1] * 2);
    this.setInteractive({ draggable: false, useHandCursor: true });
    this.setDepth(10);
    scene.add.existing(this);
  }

  drawTower(): void {
    const size = TIER_SIZES[this.tier - 1];
    const theme = getTheme();
    this.gfx.clear();

    if (theme.drawTower) {
      theme.drawTower(this.gfx, this.towerType, this.tier, size);
      this.tierText.setText(`${this.tier}`);
      this.tierText.setColor(theme.hudTextColor || '#ffffff');
      this.setSize(size * 2 + 8, size * 2 + 8);
      return;
    }

    // Default fallback
    const color = TOWER_COLORS[this.towerType];
    if (this.tier >= 2) {
      this.gfx.fillStyle(color, 0.2);
      this.gfx.fillRect(-size - 4, -size - 4, (size + 4) * 2, (size + 4) * 2);
    }
    this.gfx.fillStyle(color, 0.9);
    this.gfx.fillRect(-size, -size, size * 2, size * 2);
    this.gfx.lineStyle(2, 0xffffff, 0.6);
    this.gfx.strokeRect(-size, -size, size * 2, size * 2);
    for (let i = 0; i < this.tier; i++) {
      this.gfx.fillStyle(0xffffff, 0.8);
      this.gfx.fillRect(-size + 5 + i * 8, size - 8, 5, 4);
    }

    this.tierText.setText(`${this.tier}`);
    this.setSize(size * 2 + 8, size * 2 + 8);
  }

  upgradeTier(): void {
    if (this.tier < 3) {
      this.tier++;
      this.drawTower();
    }
  }

  setGridPosition(col: number, row: number): void {
    this.gridCol = col;
    this.gridRow = row;
    this.isOnGrid = true;
  }

  clearGridPosition(): void {
    this.gridCol = -1;
    this.gridRow = -1;
    this.isOnGrid = false;
  }
}
