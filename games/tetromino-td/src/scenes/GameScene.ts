import Phaser from 'phaser';
import { Grid, GRID_COLS, GRID_ROWS, CELL_SIZE } from '../objects/Grid';
import { Tetromino } from '../objects/Tetromino';
import { TowerType, TOWER_COLORS, TOWER_COLOR_NAMES } from '../config/tetrominos';
import { TetrisSystem } from '../systems/TetrisSystem';
import { TowerSystem } from '../systems/TowerSystem';
import { PathSystem } from '../systems/PathSystem';
import { WaveSystem } from '../systems/WaveSystem';

const GRID_OFFSET_X = 20;
const GRID_OFFSET_Y = 30;
const UI_X = GRID_OFFSET_X + GRID_COLS * CELL_SIZE + 20;

type GameState = 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export class GameScene extends Phaser.Scene {
  private grid!: Grid;
  private tetrisSystem!: TetrisSystem;
  private towerSystem!: TowerSystem;
  private pathSystem!: PathSystem;
  private waveSystem!: WaveSystem;

  private state: GameState = 'PLAYING';

  // Score & stats
  private score: number = 0;
  private lives: number = 10;
  private gold: number = 100;
  private combo: number = 0;

  // UI text objects
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private waveTimerText!: Phaser.GameObjects.Text;
  private enemiesText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private gameOverOverlay!: Phaser.GameObjects.Container;
  private warningText!: Phaser.GameObjects.Text;
  private lineClearText!: Phaser.GameObjects.Text;
  private uiGraphics!: Phaser.GameObjects.Graphics;
  private nextPiecesGraphics!: Phaser.GameObjects.Graphics;
  private holdGraphics!: Phaser.GameObjects.Graphics;
  private pathBlockedTimer: number = 0;

  // Input keys
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    shift: Phaser.Input.Keyboard.Key;
    z: Phaser.Input.Keyboard.Key;
    c: Phaser.Input.Keyboard.Key;
    p: Phaser.Input.Keyboard.Key;
    r: Phaser.Input.Keyboard.Key;
  };

  // Key repeat handling
  private keyRepeatTimers: Map<string, number> = new Map();
  private readonly KEY_REPEAT_DELAY = 180;
  private readonly KEY_REPEAT_INTERVAL = 60;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0d0d1a, 1);
    bg.fillRect(0, 0, width, height);

    // Grid
    this.grid = new Grid(this, GRID_OFFSET_X, GRID_OFFSET_Y);
    this.grid.setDepth(0);

    // Systems
    this.pathSystem = new PathSystem(this.grid, GRID_OFFSET_X, GRID_OFFSET_Y);
    this.towerSystem = new TowerSystem(this, this.grid, GRID_OFFSET_X, GRID_OFFSET_Y);
    this.waveSystem = new WaveSystem(this, this.pathSystem);
    this.tetrisSystem = new TetrisSystem(this, this.grid);

    // Wire up tetris callbacks
    this.tetrisSystem.onPieceLocked = (cells, type) => this.onPieceLocked(cells, type);
    this.tetrisSystem.onGameOver = () => this.triggerGameOver('Blocks reached the top!');

    // Wire up wave callbacks
    this.waveSystem.onEnemyKilled = (reward) => {
      this.score += reward;
      this.gold += reward;
      this.combo++;
      if (this.combo > 1) {
        this.showCombo(this.combo);
        this.score += reward * (this.combo - 1);
      }
    };
    this.waveSystem.onEnemyReachedEnd = () => {
      this.lives--;
      this.combo = 0;
      if (this.lives <= 0) {
        this.triggerGameOver('Enemies broke through!');
      }
    };
    this.waveSystem.onWaveStart = (wave) => {
      this.tetrisSystem.speedUp(wave);
      this.showMessage(`WAVE ${wave}!`, 0xffff00, 2000);
    };
    this.waveSystem.onWaveComplete = (wave) => {
      this.score += wave * 50;
      this.showMessage(`WAVE ${wave} CLEARED! +${wave * 50}`, 0x88ff88, 2000);
    };

    // UI
    this.uiGraphics = this.add.graphics();
    this.uiGraphics.setDepth(30);
    this.nextPiecesGraphics = this.add.graphics();
    this.nextPiecesGraphics.setDepth(31);
    this.holdGraphics = this.add.graphics();
    this.holdGraphics.setDepth(31);

    this.createUI();
    this.createOverlays();
    this.setupInput();

    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private createUI(): void {
    const panelX = UI_X;
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '13px',
      fontFamily: 'Courier New, monospace',
      color: '#ccccdd',
    };
    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '11px',
      fontFamily: 'Courier New, monospace',
      color: '#888899',
    };
    const valueStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
    };

    let y = GRID_OFFSET_Y + 10;

    // Score
    this.add.text(panelX, y, 'SCORE', labelStyle);
    y += 16;
    this.scoreText = this.add.text(panelX, y, '0', valueStyle);
    y += 28;

    // Wave
    this.add.text(panelX, y, 'WAVE', labelStyle);
    y += 16;
    this.waveText = this.add.text(panelX, y, '0', valueStyle);
    y += 28;

    // Lives
    this.add.text(panelX, y, 'LIVES', labelStyle);
    y += 16;
    this.livesText = this.add.text(panelX, y, '10', { ...valueStyle, color: '#ff6666' });
    y += 28;

    // Gold
    this.add.text(panelX, y, 'GOLD', labelStyle);
    y += 16;
    this.goldText = this.add.text(panelX, y, '100', { ...valueStyle, color: '#ffdd44' });
    y += 28;

    // Enemies alive
    this.add.text(panelX, y, 'ENEMIES', labelStyle);
    y += 16;
    this.enemiesText = this.add.text(panelX, y, '0', textStyle);
    y += 24;

    // Wave timer
    this.add.text(panelX, y, 'NEXT WAVE', labelStyle);
    y += 16;
    this.waveTimerText = this.add.text(panelX, y, '8s', textStyle);
    y += 28;

    // Separator
    y += 8;

    // HOLD label
    this.add.text(panelX, y, 'HOLD  [Shift/C]', labelStyle);
    y += 16;

    // Hold piece panel
    const holdPanelY = y;
    this.add.rectangle(panelX + 48, holdPanelY + 36, 96, 72, 0x111122)
      .setStrokeStyle(1, 0x333355)
      .setOrigin(0.5);
    y += 80;

    // NEXT label
    this.add.text(panelX, y, 'NEXT PIECES', labelStyle);
    y += 16;

    // Next piece panels
    for (let i = 0; i < 3; i++) {
      this.add.rectangle(panelX + 48, y + 32, 96, 64, 0x111122)
        .setStrokeStyle(1, 0x333355)
        .setOrigin(0.5);
      y += 72;
    }

    // Combo text
    this.comboText = this.add.text(panelX, y + 10, '', {
      fontSize: '16px',
      fontFamily: 'Courier New, monospace',
      color: '#ffaa00',
    });

    // Warning text (path blocked)
    this.warningText = this.add.text(
      GRID_OFFSET_X + (GRID_COLS * CELL_SIZE) / 2,
      GRID_OFFSET_Y + GRID_ROWS * CELL_SIZE + 8,
      '',
      {
        fontSize: '13px',
        fontFamily: 'Courier New, monospace',
        color: '#ff4444',
        align: 'center',
      }
    );
    this.warningText.setOrigin(0.5, 0);
    this.warningText.setDepth(50);

    // Line clear text
    this.lineClearText = this.add.text(
      GRID_OFFSET_X + (GRID_COLS * CELL_SIZE) / 2,
      GRID_OFFSET_Y + (GRID_ROWS * CELL_SIZE) / 2,
      '',
      {
        fontSize: '28px',
        fontFamily: 'Courier New, monospace',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
      }
    );
    this.lineClearText.setOrigin(0.5);
    this.lineClearText.setDepth(50);
    this.lineClearText.setAlpha(0);

    // Controls help at bottom
    const ctrlY = GRID_OFFSET_Y + GRID_ROWS * CELL_SIZE + 28;
    const ctrlStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '10px',
      fontFamily: 'Courier New, monospace',
      color: '#555566',
    };
    this.add.text(GRID_OFFSET_X, ctrlY, '← → Move  ↑/Z Rotate  Space Hard Drop', ctrlStyle);
    this.add.text(GRID_OFFSET_X, ctrlY + 14, '↓ Soft Drop  Shift/C Hold  P Pause', ctrlStyle);

    // Tower legend
    const legendX = panelX;
    let legendY = GRID_OFFSET_Y + GRID_ROWS * CELL_SIZE - 120;
    this.add.text(legendX, legendY, 'TOWER COLORS', labelStyle);
    legendY += 14;
    const towerTypes: TowerType[] = ['fire', 'ice', 'poison', 'lightning'];
    const towerLabels = ['■ Fire (AoE)', '■ Ice (Slow)', '■ Poison (DoT)', '■ Lightning (Pierce)'];
    for (let i = 0; i < towerTypes.length; i++) {
      this.add.text(legendX, legendY + i * 16, towerLabels[i], {
        fontSize: '11px',
        fontFamily: 'Courier New, monospace',
        color: TOWER_COLOR_NAMES[towerTypes[i]],
      });
    }
  }

  private createOverlays(): void {
    const { width, height } = this.scale;

    // Pause overlay
    this.pauseOverlay = this.add.container(0, 0);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    const pauseBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    const pauseTitle = this.add.text(width / 2, height / 2 - 40, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
    }).setOrigin(0.5);
    const pauseHint = this.add.text(width / 2, height / 2 + 20, 'Press P to resume', {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaacc',
    }).setOrigin(0.5);
    this.pauseOverlay.add([pauseBg, pauseTitle, pauseHint]);

    // Game over overlay
    this.gameOverOverlay = this.add.container(0, 0);
    this.gameOverOverlay.setDepth(101);
    this.gameOverOverlay.setVisible(false);

    const goBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    const goTitle = this.add.text(width / 2, height / 2 - 100, 'GAME OVER', {
      fontSize: '52px',
      fontFamily: 'Courier New, monospace',
      color: '#ff4444',
      stroke: '#880000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const goReason = this.add.text(width / 2, height / 2 - 40, '', {
      fontSize: '18px',
      fontFamily: 'Courier New, monospace',
      color: '#ffaaaa',
    }).setOrigin(0.5);
    goReason.setName('reason');

    const goScore = this.add.text(width / 2, height / 2 + 10, '', {
      fontSize: '24px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
    }).setOrigin(0.5);
    goScore.setName('finalScore');

    const goWave = this.add.text(width / 2, height / 2 + 48, '', {
      fontSize: '16px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaacc',
    }).setOrigin(0.5);
    goWave.setName('finalWave');

    // Restart button
    const restartBtn = this.add.rectangle(width / 2, height / 2 + 110, 200, 48, 0x442299);
    restartBtn.setStrokeStyle(2, 0x9966ff);
    restartBtn.setInteractive({ useHandCursor: true });
    restartBtn.setName('restartBtn');

    const restartText = this.add.text(width / 2, height / 2 + 110, 'PLAY AGAIN', {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    restartBtn.on('pointerover', () => { restartBtn.fillColor = 0x6633cc; });
    restartBtn.on('pointerout', () => { restartBtn.fillColor = 0x442299; });
    restartBtn.on('pointerdown', () => this.restartGame());

    // Menu button
    const menuBtn = this.add.rectangle(width / 2, height / 2 + 170, 200, 48, 0x222244);
    menuBtn.setStrokeStyle(2, 0x6666aa);
    menuBtn.setInteractive({ useHandCursor: true });

    const menuText = this.add.text(width / 2, height / 2 + 170, 'MAIN MENU', {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaacc',
    }).setOrigin(0.5);

    menuBtn.on('pointerover', () => { menuBtn.fillColor = 0x333366; });
    menuBtn.on('pointerout', () => { menuBtn.fillColor = 0x222244; });
    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('MenuScene'));
    });

    this.gameOverOverlay.add([
      goBg, goTitle, goReason, goScore, goWave,
      restartBtn, restartText, menuBtn, menuText,
    ]);
  }

  private setupInput(): void {
    const kb = this.input.keyboard!;
    this.keys = {
      left: kb.addKey('LEFT'),
      right: kb.addKey('RIGHT'),
      up: kb.addKey('UP'),
      down: kb.addKey('DOWN'),
      space: kb.addKey('SPACE'),
      shift: kb.addKey('SHIFT'),
      z: kb.addKey('Z'),
      c: kb.addKey('C'),
      p: kb.addKey('P'),
      r: kb.addKey('R'),
    };

    // One-shot key actions
    this.keys.up.on('down', () => {
      if (this.state !== 'PLAYING') return;
      this.tetrisSystem.rotateClockwise();
    });
    this.keys.z.on('down', () => {
      if (this.state !== 'PLAYING') return;
      this.tetrisSystem.rotateCounterClockwise();
    });
    this.keys.space.on('down', () => {
      if (this.state !== 'PLAYING') return;
      this.tetrisSystem.hardDrop();
    });
    this.keys.shift.on('down', () => {
      if (this.state !== 'PLAYING') return;
      this.tetrisSystem.holdSwap();
    });
    this.keys.c.on('down', () => {
      if (this.state !== 'PLAYING') return;
      this.tetrisSystem.holdSwap();
    });
    this.keys.p.on('down', () => {
      this.togglePause();
    });
    this.keys.r.on('down', () => {
      if (this.state === 'GAME_OVER') this.restartGame();
    });
  }

  private togglePause(): void {
    if (this.state === 'GAME_OVER') return;
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.pauseOverlay.setVisible(true);
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.pauseOverlay.setVisible(false);
    }
  }

  private onPieceLocked(cells: Array<[number, number]>, type: TowerType): void {
    // Check if placement would block all paths
    if (this.pathSystem.wouldBlockPath(cells)) {
      // Still allow placement but show warning and recalculate
      this.showWarning('PATH BLOCKED - Recalculating...');
      this.pathBlockedTimer = 2000;
    }

    // Place towers on grid
    for (const [r, c] of cells) {
      if (r >= 0 && r < GRID_ROWS) {
        this.grid.setCellTower(r, c, type);
        this.towerSystem.addTower(r, c, type);
      }
    }

    // Check for level-up merges
    this.towerSystem.checkMerge(cells);

    // Redraw grid cells
    this.grid.redrawCells();

    // Recalculate enemy paths
    this.waveSystem.recalculateEnemyPaths();

    // Check for completed lines
    this.checkLines();
  }

  private checkLines(): void {
    const fullRows = this.grid.getFullRows();
    if (fullRows.length === 0) return;

    // Process each full row (highest row first to avoid index shift issues)
    // Sort descending
    fullRows.sort((a, b) => b - a);

    for (const row of fullRows) {
      this.triggerLineClear(row);
    }
  }

  private triggerLineClear(row: number): void {
    const { width } = this.scale;

    // Fire line-clear attack
    const damage = this.towerSystem.fireLineClear(
      row,
      this.waveSystem.enemies,
      width
    );

    // Score for line clear
    const lineScore = 500 + damage;
    this.score += lineScore;

    // Flash animation
    const flashGfx = this.add.graphics();
    flashGfx.setDepth(40);
    flashGfx.fillStyle(0xffffff, 0.7);
    flashGfx.fillRect(
      GRID_OFFSET_X,
      GRID_OFFSET_Y + row * CELL_SIZE,
      GRID_COLS * CELL_SIZE,
      CELL_SIZE
    );
    this.tweens.add({
      targets: flashGfx,
      alpha: 0,
      duration: 400,
      onComplete: () => flashGfx.destroy(),
    });

    // Show line clear text
    this.lineClearText.setText(`LINE CLEAR!\n+${lineScore}`);
    this.lineClearText.setAlpha(1);
    this.tweens.add({
      targets: this.lineClearText,
      alpha: 0,
      y: this.lineClearText.y - 40,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => {
        this.lineClearText.y += 40;
      },
    });

    // Remove towers in that row and shift grid
    this.towerSystem.removeTowersInRow(row);
    this.grid.clearRow(row);
    this.grid.redrawCells();

    // Recalculate paths after line clear
    this.waveSystem.recalculateEnemyPaths();
  }

  private triggerGameOver(reason: string): void {
    if (this.state === 'GAME_OVER') return;
    this.state = 'GAME_OVER';

    // Update game over overlay
    const reasonText = this.gameOverOverlay.getByName('reason') as Phaser.GameObjects.Text;
    const scoreText = this.gameOverOverlay.getByName('finalScore') as Phaser.GameObjects.Text;
    const waveText = this.gameOverOverlay.getByName('finalWave') as Phaser.GameObjects.Text;

    if (reasonText) reasonText.setText(reason);
    if (scoreText) scoreText.setText(`Score: ${this.score.toLocaleString()}`);
    if (waveText) waveText.setText(`Wave Reached: ${this.waveSystem.currentWave}`);

    this.gameOverOverlay.setVisible(true);

    // Camera shake
    this.cameras.main.shake(400, 0.015);
  }

  private restartGame(): void {
    // Clean up systems
    this.tetrisSystem.destroy();
    this.towerSystem.destroy();
    this.waveSystem.destroy();
    this.grid.destroy();

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.restart();
    });
  }

  private showWarning(msg: string): void {
    this.warningText.setText(msg);
    this.warningText.setAlpha(1);
  }

  private showMessage(msg: string, color: number, duration: number): void {
    const { width } = this.scale;
    const hex = '#' + color.toString(16).padStart(6, '0');
    const text = this.add.text(width / 2, GRID_OFFSET_Y + 80, msg, {
      fontSize: '22px',
      fontFamily: 'Courier New, monospace',
      color: hex,
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setDepth(50);

    this.tweens.add({
      targets: text,
      alpha: 0,
      y: text.y - 50,
      duration: duration,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  private showCombo(count: number): void {
    if (count < 2) return;
    this.comboText.setText(`${count}x COMBO!`);
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: true,
      ease: 'Power2',
    });
  }

  private updateUI(): void {
    this.scoreText.setText(this.score.toLocaleString());
    this.waveText.setText(String(this.waveSystem.currentWave));
    this.livesText.setText(String(this.lives));
    this.goldText.setText(String(this.gold));
    this.enemiesText.setText(String(this.waveSystem.getLivingEnemyCount()));

    if (this.waveSystem.waveActive) {
      this.waveTimerText.setText('IN PROGRESS');
      this.waveTimerText.setColor('#ff8844');
    } else {
      const secs = Math.ceil(this.waveSystem.waveTimer);
      this.waveTimerText.setText(`${secs}s`);
      this.waveTimerText.setColor('#88ff88');
    }

    // Warning fade
    if (this.pathBlockedTimer > 0) {
      this.pathBlockedTimer -= 16;
      if (this.pathBlockedTimer <= 0) {
        this.warningText.setText('');
      }
    }

    // Update hold/next piece previews
    this.updatePreviewPanels();
  }

  private updatePreviewPanels(): void {
    this.holdGraphics.clear();
    this.nextPiecesGraphics.clear();

    const panelX = UI_X + 48;

    // Hold piece
    const holdY = GRID_OFFSET_Y + 10 + 16 + 16 + 28 + 16 + 28 + 16 + 28 + 16 + 28 + 24 + 16 + 8 + 16 + 36;
    if (this.tetrisSystem.holdPiece) {
      const { name, towerType } = this.tetrisSystem.holdPiece;
      Tetromino.drawPreview(this.holdGraphics, name, towerType, panelX, holdY, 14);
    }

    // Next pieces
    const nextStartY = holdY + 80 + 16 + 16;
    for (let i = 0; i < this.tetrisSystem.nextPieces.length && i < 3; i++) {
      const { name, towerType } = this.tetrisSystem.nextPieces[i];
      Tetromino.drawPreview(
        this.nextPiecesGraphics,
        name,
        towerType,
        panelX,
        nextStartY + i * 72 + 32,
        14
      );
    }
  }

  update(_time: number, delta: number): void {
    if (this.state !== 'PLAYING') return;

    // Handle repeating key inputs
    this.handleKeyRepeat('left', delta, () => this.tetrisSystem.moveLeft());
    this.handleKeyRepeat('right', delta, () => this.tetrisSystem.moveRight());

    // Soft drop
    const softDropping = this.keys.down.isDown;
    this.tetrisSystem.setSoftDrop(softDropping);

    // Update systems
    this.tetrisSystem.update(delta);
    this.towerSystem.updateAll(delta, this.waveSystem.enemies);
    this.waveSystem.update(delta);

    // Update UI
    this.updateUI();
  }

  private handleKeyRepeat(
    keyName: 'left' | 'right',
    delta: number,
    action: () => void
  ): void {
    const key = this.keys[keyName];

    if (!key.isDown) {
      this.keyRepeatTimers.delete(keyName);
      return;
    }

    const wasDown = this.keyRepeatTimers.has(keyName);

    if (!wasDown) {
      // First frame the key is pressed: fire immediately, start delay timer
      action();
      this.keyRepeatTimers.set(keyName, 0);
      return;
    }

    // Key held: accumulate time
    const accumulated = this.keyRepeatTimers.get(keyName)! + delta;

    // First repeat fires after KEY_REPEAT_DELAY ms from initial press
    // Subsequent repeats fire every KEY_REPEAT_INTERVAL ms
    const threshold = accumulated < this.KEY_REPEAT_DELAY
      ? this.KEY_REPEAT_DELAY
      : this.KEY_REPEAT_INTERVAL;

    if (accumulated >= threshold) {
      action();
      // Keep only the overshoot so timing stays consistent
      this.keyRepeatTimers.set(keyName, accumulated - threshold);
    } else {
      this.keyRepeatTimers.set(keyName, accumulated);
    }
  }
}
