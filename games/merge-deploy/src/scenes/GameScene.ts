import Phaser from 'phaser';
import { MergeGrid } from '../objects/MergeGrid';
import { BattleLane } from '../objects/BattleLane';
import { Unit } from '../objects/Unit';
import { MergeSystem } from '../systems/MergeSystem';
import { BattleSystem } from '../systems/BattleSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { STAGES } from '../config/stages';
import { UPGRADES } from '../config/stages';
import { AUTO_SPAWN_INTERVAL } from '../config/units';
import { SaveData, StageSelectScene } from './StageSelectScene';

export class GameScene extends Phaser.Scene {
  private mergeGrid!: MergeGrid;
  private battleLane!: BattleLane;
  private mergeSystem!: MergeSystem;
  private battleSystem!: BattleSystem;
  private waveSystem!: WaveSystem;
  private autoSpawnTimer!: Phaser.Time.TimerEvent;

  private stageId: number = 1;
  private saveData!: SaveData;
  private isPaused: boolean = false;
  private isGameOver: boolean = false;

  // Upgrade multipliers
  private upgradeMultipliers = { hp: 1.0, attack: 1.0 };
  private spawnInterval: number = AUTO_SPAWN_INTERVAL;

  // UI
  private waveText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private stageTimer: number = 0;

  // Layout constants
  private readonly GRID_WIDTH_RATIO = 0.38;
  private readonly HEADER_HEIGHT = 36;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { stageId: number; saveData: SaveData }): void {
    this.stageId = data.stageId ?? 1;
    this.saveData = data.saveData ?? {
      clearedStages: [],
      upgradePoints: 0,
      upgradeLevels: {},
    };
    this.isPaused = false;
    this.isGameOver = false;
    this.score = 0;
    this.stageTimer = 0;

    // Calculate upgrade multipliers
    this.upgradeMultipliers = { hp: 1.0, attack: 1.0 };
    this.spawnInterval = AUTO_SPAWN_INTERVAL;

    for (const upg of UPGRADES) {
      const level = this.saveData.upgradeLevels[upg.id] ?? 0;
      if (level === 0) continue;
      const totalEffect = 1 + (upg.effectPerLevel * level) / 100;
      if (upg.id === 'attack') {
        this.upgradeMultipliers.attack = totalEffect;
      } else if (upg.id === 'hp') {
        this.upgradeMultipliers.hp = totalEffect;
      } else if (upg.id === 'mergeSpeed' || upg.id === 'spawnSpeed') {
        this.spawnInterval = Math.max(800, AUTO_SPAWN_INTERVAL / totalEffect);
      }
    }
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    const stageConfig = STAGES.find(s => s.id === this.stageId) ?? STAGES[0];

    // Layout
    const gridPanelW = Math.floor(W * this.GRID_WIDTH_RATIO);
    const battlePanelX = gridPanelW;
    const contentH = H - this.HEADER_HEIGHT;

    // Header background
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x050510, 1);
    headerBg.fillRect(0, 0, W, this.HEADER_HEIGHT);
    headerBg.lineStyle(1, 0x334466, 1);
    headerBg.lineBetween(0, this.HEADER_HEIGHT, W, this.HEADER_HEIGHT);

    // Left panel background
    const leftBg = this.add.graphics();
    leftBg.fillStyle(0x080818, 1);
    leftBg.fillRect(0, this.HEADER_HEIGHT, gridPanelW, contentH);
    leftBg.lineStyle(2, 0x334466, 1);
    leftBg.lineBetween(gridPanelW, this.HEADER_HEIGHT, gridPanelW, H);

    // Grid label
    this.add.text(gridPanelW / 2, this.HEADER_HEIGHT + 14, 'MERGE GRID', {
      fontSize: '12px', color: '#5566AA', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);

    // Create merge grid
    const gridAreaY = this.HEADER_HEIGHT + 30;
    const gridAreaH = contentH - 30;
    this.mergeGrid = new MergeGrid(this, 4, gridAreaY, gridPanelW - 8, gridAreaH);

    // Create battle lane
    const laneH = contentH * 0.7;
    const laneY = this.HEADER_HEIGHT + contentH / 2;
    this.battleLane = new BattleLane(
      this,
      battlePanelX,
      W,
      laneY,
      laneH,
      stageConfig
    );

    // Systems
    this.mergeSystem = new MergeSystem(this, this.mergeGrid, this.upgradeMultipliers);
    this.mergeSystem.onMergeCallback = (unit: Unit) => {
      this.deployUnitFromGrid(unit);
    };

    this.battleSystem = new BattleSystem(this, this.battleLane);
    this.battleSystem.setScoreCallback((reward: number) => {
      this.score += reward;
      this.scoreText.setText(`Score: ${this.score}`);
    });

    this.waveSystem = new WaveSystem(this, this.battleLane, stageConfig);
    this.waveSystem.onWaveStart = (waveIdx: number, total: number) => {
      this.waveText.setText(`Wave: ${waveIdx} / ${total}`);
      this.showAnnouncement(`WAVE ${waveIdx}!`);
    };
    this.waveSystem.start();

    // Auto-spawn timer
    this.autoSpawnTimer = this.time.addEvent({
      delay: this.spawnInterval,
      loop: true,
      callback: this.autoSpawn,
      callbackScope: this,
    });

    // Initial spawn — give player 3 units to start
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 200, () => {
        this.mergeGrid.spawnRandom(this.upgradeMultipliers);
      });
    }

    // UI
    this.createUI(W, stageConfig.name);

    // Deploy button
    this.createDeployButton(gridPanelW / 2, H - 18);
  }

  private createUI(W: number, stageName: string): void {
    const centerX = W / 2;

    this.add.text(20, this.HEADER_HEIGHT / 2, `Stage ${this.stageId}: ${stageName}`, {
      fontSize: '13px', color: '#FFD700', fontFamily: 'monospace',
    }).setOrigin(0, 0.5);

    this.waveText = this.add.text(centerX, this.HEADER_HEIGHT / 2, 'Wave: 0 / ?', {
      fontSize: '13px', color: '#aaccff', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);

    this.scoreText = this.add.text(W - 120, this.HEADER_HEIGHT / 2, 'Score: 0', {
      fontSize: '13px', color: '#aaffaa', fontFamily: 'monospace',
    }).setOrigin(0, 0.5);

    this.timerText = this.add.text(W - 20, this.HEADER_HEIGHT / 2, '0:00', {
      fontSize: '13px', color: '#cccccc', fontFamily: 'monospace',
    }).setOrigin(1, 0.5);

    this.statusText = this.add.text(W / 2, this.HEADER_HEIGHT + 60, '', {
      fontSize: '22px', color: '#FFD700', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(60).setAlpha(0);

    // Pause button
    const pauseBtn = this.add.text(W - 20, this.HEADER_HEIGHT - 8, '[II]', {
      fontSize: '11px', color: '#667788', fontFamily: 'monospace',
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true }).setDepth(5);
    pauseBtn.on('pointerdown', () => this.togglePause(pauseBtn));

    // Quit button
    const quitBtn = this.add.text(W - 50, this.HEADER_HEIGHT - 8, '[QUIT]', {
      fontSize: '11px', color: '#667788', fontFamily: 'monospace',
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true }).setDepth(5);
    quitBtn.on('pointerdown', () => {
      this.cleanupSystems();
      this.scene.start('StageSelectScene');
    });
  }

  private createDeployButton(x: number, y: number): void {
    const btn = this.add.text(x, y, '[ DEPLOY ALL ]', {
      fontSize: '12px', color: '#44ccff', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true }).setDepth(5);

    btn.on('pointerover', () => btn.setColor('#88eeff'));
    btn.on('pointerout', () => btn.setColor('#44ccff'));
    btn.on('pointerdown', () => {
      const units = this.mergeGrid.getAllUnits();
      for (const unit of units) {
        this.mergeGrid.removeUnit(unit.gridCol, unit.gridRow);
        this.battleLane.deployUnit(unit);
      }
    });
  }

  private togglePause(btn: Phaser.GameObjects.Text): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      btn.setText('[>]');
      this.showAnnouncement('PAUSED');
    } else {
      this.physics.resume();
      btn.setText('[II]');
      this.hideAnnouncement();
    }
  }

  private autoSpawn(): void {
    if (this.isPaused || this.isGameOver) return;
    this.mergeGrid.spawnRandom(this.upgradeMultipliers);
  }

  private deployUnitFromGrid(unit: Unit): void {
    if (unit.gridCol < 0) return; // already removed
    this.mergeGrid.removeUnit(unit.gridCol, unit.gridRow);
    this.battleLane.deployUnit(unit);
  }

  update(_time: number, delta: number): void {
    if (this.isPaused || this.isGameOver) return;

    this.stageTimer += delta;
    const seconds = Math.floor(this.stageTimer / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timerText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);

    this.battleSystem.update(_time, delta);

    // Win condition
    if (this.waveSystem.isAllCleared() && this.battleLane.isBaseDestroyed()) {
      this.onStageClear();
      return;
    }

    // Alternate win: base destroyed (even mid-wave)
    if (this.battleLane.isBaseDestroyed()) {
      this.onStageClear();
      return;
    }

    // Lose condition: no units on lane AND no units in grid AND grid is empty
    if (
      this.waveSystem.allWavesSpawned &&
      this.battleLane.isPlayerDefeated() &&
      this.mergeGrid.getUnitCount() === 0 &&
      this.battleLane.enemies.length > 0
    ) {
      this.onDefeat();
    }
  }

  private onStageClear(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.waveSystem.destroy();
    this.autoSpawnTimer.remove(false);

    // Update save data
    if (!this.saveData.clearedStages.includes(this.stageId)) {
      this.saveData.clearedStages.push(this.stageId);
      this.saveData.upgradePoints += 1;
      StageSelectScene.persistSave(this.saveData);
    }

    // Victory screen
    this.createEndScreen(true);
  }

  private onDefeat(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.waveSystem.destroy();
    this.autoSpawnTimer.remove(false);

    this.createEndScreen(false);
  }

  private createEndScreen(victory: boolean): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // Dim overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, W, H);
    overlay.setDepth(70);

    const panel = this.add.graphics();
    panel.fillStyle(0x111133, 1);
    panel.lineStyle(3, victory ? 0x44FF44 : 0xFF4444, 1);
    panel.fillRoundedRect(W / 2 - 200, H / 2 - 120, 400, 240, 12);
    panel.strokeRoundedRect(W / 2 - 200, H / 2 - 120, 400, 240, 12);
    panel.setDepth(71);

    const title = victory ? 'STAGE CLEAR!' : 'DEFEATED...';
    const titleColor = victory ? '#FFD700' : '#FF6666';
    this.add.text(W / 2, H / 2 - 80, title, {
      fontSize: '28px', color: titleColor, fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0.5).setDepth(72);

    if (victory) {
      this.add.text(W / 2, H / 2 - 40, `+1 Upgrade Point Earned!`, {
        fontSize: '15px', color: '#aaffaa', fontFamily: 'monospace',
      }).setOrigin(0.5, 0.5).setDepth(72);
    }

    this.add.text(W / 2, H / 2 - 10, `Score: ${this.score}`, {
      fontSize: '16px', color: '#ccccee', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5).setDepth(72);

    const timeSeconds = Math.floor(this.stageTimer / 1000);
    const mins = Math.floor(timeSeconds / 60);
    const secs = timeSeconds % 60;
    this.add.text(W / 2, H / 2 + 18, `Time: ${mins}:${secs.toString().padStart(2, '0')}`, {
      fontSize: '14px', color: '#aaaacc', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5).setDepth(72);

    // Next stage button (if cleared and not last stage)
    let nextBtnY = H / 2 + 55;
    if (victory && this.stageId < STAGES.length) {
      const nextBtn = this.add.text(W / 2, nextBtnY, `[ NEXT STAGE ]`, {
        fontSize: '16px', color: '#44FF44', fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5, 0.5).setDepth(72).setInteractive({ useHandCursor: true });
      nextBtn.on('pointerover', () => nextBtn.setColor('#88FF88'));
      nextBtn.on('pointerout', () => nextBtn.setColor('#44FF44'));
      nextBtn.on('pointerdown', () => {
        this.cleanupSystems();
        this.scene.start('GameScene', { stageId: this.stageId + 1, saveData: this.saveData });
      });
      nextBtnY += 35;
    }

    const retryBtn = this.add.text(W / 2, nextBtnY, '[ RETRY ]', {
      fontSize: '16px', color: '#ffaa44', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0.5).setDepth(72).setInteractive({ useHandCursor: true });
    retryBtn.on('pointerover', () => retryBtn.setColor('#ffcc88'));
    retryBtn.on('pointerout', () => retryBtn.setColor('#ffaa44'));
    retryBtn.on('pointerdown', () => {
      this.cleanupSystems();
      this.scene.start('GameScene', { stageId: this.stageId, saveData: this.saveData });
    });

    const menuBtn = this.add.text(W / 2, nextBtnY + 35, '[ STAGE SELECT ]', {
      fontSize: '14px', color: '#44aaff', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0.5).setDepth(72).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerover', () => menuBtn.setColor('#88ccff'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#44aaff'));
    menuBtn.on('pointerdown', () => {
      this.cleanupSystems();
      this.scene.start('StageSelectScene');
    });
  }

  private showAnnouncement(msg: string): void {
    this.statusText.setText(msg);
    this.tweens.add({
      targets: this.statusText,
      alpha: 1,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: this.statusText,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
          });
        });
      },
    });
  }

  private hideAnnouncement(): void {
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 300,
    });
  }

  private cleanupSystems(): void {
    if (this.waveSystem) this.waveSystem.destroy();
    if (this.mergeSystem) this.mergeSystem.destroy();
    if (this.autoSpawnTimer) this.autoSpawnTimer.remove(false);
  }
}
