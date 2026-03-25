import Phaser from 'phaser';
import { Grid, GridPos } from '../objects/Grid';
import { ChainSystem } from '../systems/ChainSystem';
import { ExplosionSystem } from '../systems/ExplosionSystem';
import { ComboSystem } from '../systems/ComboSystem';
import { GAME_WIDTH, GAME_HEIGHT, GRID_COLS, GRID_ROWS, TILE_SIZE, TILE_GAP, GRID_OFFSET_X, GRID_OFFSET_Y } from '../config/gameConfig';

export class GameScene extends Phaser.Scene {
  private grid!: Grid;
  private chainSystem!: ChainSystem;
  private explosionSystem!: ExplosionSystem;
  private comboSystem!: ComboSystem;

  private scoreText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;

  private isGameOver: boolean = false;
  private isInputLocked: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.isGameOver = false;
    this.isInputLocked = false;

    this.createBackground();
    this.createUI();

    // Initialize grid — ensure it starts with valid moves
    this.grid = new Grid(this);
    let attempts = 0;
    while (!this.grid.hasValidMoves() && attempts < 20) {
      // Destroy all tiles and recreate
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          this.grid.tiles[row][col]?.destroy();
          this.grid.tiles[row][col] = this.grid.createTile(col, row);
        }
      }
      attempts++;
    }

    this.comboSystem = new ComboSystem(this);
    this.comboSystem.setScoreDisplay(this.scoreText, this.bestText);

    this.explosionSystem = new ExplosionSystem(this, this.grid, this.comboSystem);

    this.chainSystem = new ChainSystem(this, this.grid, (chain: GridPos[], sum: number) => {
      void this.onChainComplete(chain, sum);
    });

    this.setupInput();

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x0f3460, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.setDepth(0);

    // Grid background panel
    const panelW = GRID_COLS * (TILE_SIZE + TILE_GAP) - TILE_GAP + 24;
    const panelH = GRID_ROWS * (TILE_SIZE + TILE_GAP) - TILE_GAP + 24;
    const panel = this.add.graphics();
    panel.fillStyle(0x000020, 0.6);
    panel.fillRoundedRect(GRID_OFFSET_X - 12, GRID_OFFSET_Y - 12, panelW, panelH, 16);
    panel.lineStyle(2, 0x4488FF, 0.3);
    panel.strokeRoundedRect(GRID_OFFSET_X - 12, GRID_OFFSET_Y - 12, panelW, panelH, 16);
    panel.setDepth(0);
  }

  private createUI(): void {
    // Score
    this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#000033',
      strokeThickness: 3,
    });
    this.scoreText.setDepth(10);

    // Best score
    this.bestText = this.add.text(20, 50, 'BEST: 0', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#333300',
      strokeThickness: 2,
    });
    this.bestText.setDepth(10);

    // Combo display
    this.comboText = this.add.text(GAME_WIDTH - 20, 20, '', {
      fontSize: '20px',
      fontFamily: 'Arial Black, Arial',
      color: '#FF8844',
      stroke: '#330000',
      strokeThickness: 3,
    });
    this.comboText.setOrigin(1, 0);
    this.comboText.setDepth(10);

    // Instructions
    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 22, 'Drag tiles • Sum = multiple of 10 = BOOM!', {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#667799',
    });
    hint.setOrigin(0.5, 1);
    hint.setDepth(10);
  }

  private setupInput(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver || this.isInputLocked) return;
      const pos = this.grid.worldToGrid(pointer.x, pointer.y);
      if (pos) {
        this.chainSystem.startChain(pos.col, pos.row);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver || this.isInputLocked) return;
      if (!this.chainSystem.isDragging) return;
      const pos = this.grid.worldToGrid(pointer.x, pointer.y);
      if (pos) {
        this.chainSystem.extendChain(pos.col, pos.row);
      }
    });

    this.input.on('pointerup', () => {
      if (this.isGameOver || this.isInputLocked) return;
      if (this.chainSystem.isDragging) {
        this.chainSystem.endChain();
      }
    });

    // Handle pointer leaving the canvas
    this.input.on('pointerupoutside', () => {
      if (this.chainSystem.isDragging) {
        this.chainSystem.endChain();
      }
    });
  }

  private async onChainComplete(chain: GridPos[], _sum: number): Promise<void> {
    if (this.isInputLocked || this.isGameOver) return;
    this.isInputLocked = true;

    await this.explosionSystem.explodeChain(chain);

    this.comboSystem.resetCombo();
    this.updateComboDisplay();

    // Check for game over
    if (!this.grid.hasValidMoves()) {
      await this.delay(300);
      this.triggerGameOver();
    } else {
      this.isInputLocked = false;
    }
  }

  private updateComboDisplay(): void {
    // No persistent combo display in this version — handled by ComboSystem popups
    this.comboText.setText('');
  }

  private triggerGameOver(): void {
    this.isGameOver = true;

    // Dim overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setDepth(25);
    overlay.setAlpha(0);

    this.tweens.add({
      targets: overlay,
      alpha: 0.7,
      duration: 500,
      ease: 'Power2.easeIn',
    });

    // Game over panel
    const panelX = GAME_WIDTH / 2;
    const panelY = GAME_HEIGHT / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x0d0d2a, 0.95);
    panel.fillRoundedRect(panelX - 200, panelY - 160, 400, 320, 24);
    panel.lineStyle(3, 0x4488FF, 0.8);
    panel.strokeRoundedRect(panelX - 200, panelY - 160, 400, 320, 24);
    panel.setDepth(26);
    panel.setAlpha(0);

    const goText = this.add.text(panelX, panelY - 110, 'GAME OVER', {
      fontSize: '44px',
      fontFamily: 'Arial Black, Arial',
      color: '#FF4444',
      stroke: '#220000',
      strokeThickness: 5,
    });
    goText.setOrigin(0.5, 0.5);
    goText.setDepth(27);
    goText.setAlpha(0);

    const finalScore = this.add.text(panelX, panelY - 30, `SCORE: ${this.comboSystem.score}`, {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#000033',
      strokeThickness: 4,
    });
    finalScore.setOrigin(0.5, 0.5);
    finalScore.setDepth(27);
    finalScore.setAlpha(0);

    const bestLabel = this.add.text(panelX, panelY + 20, `BEST: ${this.comboSystem.bestScore}`, {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#333300',
      strokeThickness: 3,
    });
    bestLabel.setOrigin(0.5, 0.5);
    bestLabel.setDepth(27);
    bestLabel.setAlpha(0);

    const restartText = this.add.text(panelX, panelY + 90, 'TAP TO RESTART', {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial',
      color: '#00FF88',
      stroke: '#003322',
      strokeThickness: 4,
    });
    restartText.setOrigin(0.5, 0.5);
    restartText.setDepth(27);
    restartText.setAlpha(0);

    // Fade in all elements
    const elements = [panel, goText, finalScore, bestLabel, restartText];
    this.tweens.add({
      targets: elements,
      alpha: 1,
      duration: 400,
      delay: 200,
      ease: 'Power2.easeOut',
    });

    // Blink restart text
    this.time.delayedCall(700, () => {
      this.tweens.add({
        targets: restartText,
        alpha: { from: 1, to: 0.2 },
        duration: 600,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    });

    // Tap to restart
    this.time.delayedCall(800, () => {
      this.input.once('pointerdown', () => {
        void this.comboSystem.saveBest();
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.restart();
        });
      });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }
}
