import Phaser from 'phaser';
import { GridSystem } from '../systems/GridSystem';
import { PathSystem } from '../systems/PathSystem';
import { TowerFactory } from '../entities/TowerFactory';
import { DragDropSystem } from '../systems/DragDropSystem';
import { MergeSystem } from '../systems/MergeSystem';
import { Tower } from '../entities/Tower';
import {
  GAME_WIDTH, BUILD_TIME, PANEL_Y, PANEL_HEIGHT, CELL_SIZE,
  TOWER_STATS, TOWER_COLORS, TowerType,
} from '../config';

export class BuildScene extends Phaser.Scene {
  gridSystem!: GridSystem;
  pathSystem!: PathSystem;
  towerFactory!: TowerFactory;
  dragDropSystem!: DragDropSystem;
  mergeSystem!: MergeSystem;

  towers: Map<string, Tower> = new Map();
  panelTowers: Tower[] = [];

  private timerText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private timeLeft = BUILD_TIME;
  private timerEvent!: Phaser.Time.TimerEvent;
  private readyButton!: Phaser.GameObjects.Container;
  private isBattlePhase = false;
  private statText!: Phaser.GameObjects.Text;
  private rangeCircle!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'BuildScene' });
  }

  create(): void {
    this.towers.clear();
    this.panelTowers = [];
    this.isBattlePhase = false;
    this.timeLeft = BUILD_TIME;

    // Systems
    this.pathSystem = new PathSystem(this);
    this.gridSystem = new GridSystem(this);
    this.gridSystem.draw(this.pathSystem.pathCells);
    this.pathSystem.draw();
    this.mergeSystem = new MergeSystem(this);
    this.towerFactory = new TowerFactory(this);
    this.dragDropSystem = new DragDropSystem(this);

    // Spawn initial towers in panel
    this.towerFactory.spawnInitialTowers(5);

    // HUD
    this.createHUD();

    // Panel background
    this.add.rectangle(GAME_WIDTH / 2, PANEL_Y + PANEL_HEIGHT / 2, GAME_WIDTH, PANEL_HEIGHT, 0x1a1a2a, 0.9)
      .setDepth(0);

    // Stat display
    this.statText = this.add.text(GAME_WIDTH - 10, PANEL_Y + 10, '', {
      fontSize: '12px', color: '#ffffff', align: 'right',
    }).setOrigin(1, 0).setDepth(100).setVisible(false);

    // Range circle
    this.rangeCircle = this.add.graphics().setDepth(5);

    // Ready button
    this.createReadyButton();
  }

  private createHUD(): void {
    // Top bar
    this.add.rectangle(GAME_WIDTH / 2, 25, GAME_WIDTH, 50, 0x0a0a1a, 0.9).setDepth(90);
    this.phaseText = this.add.text(20, 15, 'BUILD PHASE', {
      fontSize: '22px', color: '#44cc44', fontStyle: 'bold',
    }).setDepth(100);
    this.timerText = this.add.text(GAME_WIDTH - 20, 15, `⏱ ${this.timeLeft}s`, {
      fontSize: '22px', color: '#ffffff',
    }).setOrigin(1, 0).setDepth(100);

    // Timer countdown
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`⏱ ${this.timeLeft}s`);
        if (this.timeLeft <= 5) {
          this.timerText.setColor('#cc4444');
        }
        if (this.timeLeft <= 0) {
          this.startBattle();
        }
      },
      loop: true,
    });
  }

  private createReadyButton(): void {
    const bg = this.add.rectangle(0, 0, 120, 40, 0x44cc44, 1).setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, '▶ READY', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.readyButton = this.add.container(GAME_WIDTH - 80, PANEL_Y + PANEL_HEIGHT / 2, [bg, text]).setDepth(100);
    bg.on('pointerover', () => bg.setFillStyle(0x55dd55));
    bg.on('pointerout', () => bg.setFillStyle(0x44cc44));
    bg.on('pointerdown', () => this.startBattle());
  }

  startBattle(): void {
    if (this.isBattlePhase) return;
    this.isBattlePhase = true;
    this.timerEvent.remove();
    this.dragDropSystem.setEnabled(false);
    this.readyButton.setVisible(false);
    this.hideStats();

    // Transition to BattleScene, pass tower data
    const towerData = Array.from(this.towers.values()).map(t => ({
      type: t.towerType,
      tier: t.tier,
      col: t.gridCol,
      row: t.gridRow,
    }));

    // Battle start animation
    this.phaseText.setText('BATTLE START!').setColor('#ffcc00');
    this.time.delayedCall(1000, () => {
      this.scene.start('BattleScene', { towerData, pathSystem: this.pathSystem });
    });
  }

  showStats(tower: Tower): void {
    const tier = tower.tier;
    const idx = tier - 1;
    const tType: TowerType = tower.towerType;
    const stats = TOWER_STATS[tType];
    const names: Record<TowerType, string> = { archer: '아처', cannon: '캐논', slow: '슬로우' };
    let text = `${names[tType]} T${tier}\n`;
    text += `DMG: ${stats.dmg[idx]}\n`;
    text += `사거리: ${stats.range[idx]}칸\n`;
    text += `공속: ${stats.speed[idx]}s`;
    if (stats.slowPct) text += `\n감속: ${stats.slowPct[idx]}%`;
    if (stats.special === 'aoe') text += `\n범위공격`;
    this.statText.setText(text).setVisible(true);

    // Range circle
    this.rangeCircle.clear();
    const rangePx = stats.range[idx] * CELL_SIZE;
    const worldPos = this.gridSystem.cellToWorld(tower.gridCol, tower.gridRow);
    this.rangeCircle.lineStyle(2, TOWER_COLORS[tType], 0.3);
    this.rangeCircle.fillStyle(TOWER_COLORS[tType], 0.08);
    this.rangeCircle.fillCircle(worldPos.x, worldPos.y, rangePx);
    this.rangeCircle.strokeCircle(worldPos.x, worldPos.y, rangePx);
  }

  hideStats(): void {
    this.statText.setVisible(false);
    this.rangeCircle.clear();
  }
}
