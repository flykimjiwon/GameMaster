import Phaser from 'phaser';
import { Tube } from '../objects/Tube';
import { generatePuzzle } from '../systems/PuzzleGenerator';
import { getLevelDef, GAME_WIDTH, GAME_HEIGHT, TUBE_WIDTH } from '../config/levels';

interface MoveRecord {
  fromIdx: number;
  toIdx: number;
  colorIndex: number;
}

export class GameScene extends Phaser.Scene {
  tubes: Tube[] = [];
  selectedTubeIdx = -1;
  level = 1;
  moves = 0;
  moveHistory: MoveRecord[] = [];
  isAnimating = false;
  levelCleared = false;

  // UI elements
  levelText!: Phaser.GameObjects.Text;
  movesText!: Phaser.GameObjects.Text;
  undoBtn!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data?: { level?: number }) {
    this.level = data?.level ?? 1;
  }

  create() {
    this.tubes = [];
    this.selectedTubeIdx = -1;
    this.moves = 0;
    this.moveHistory = [];
    this.isAnimating = false;
    this.levelCleared = false;

    this.createBackground();
    this.createUI();
    this.createPuzzle();
  }

  createBackground() {
    // Gradient background
    const gfx = this.add.graphics();
    gfx.fillGradientStyle(0x0f0f1a, 0x0f0f1a, 0x1a1030, 0x1a1030, 1);
    gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    gfx.setDepth(-10);
  }

  createUI() {
    // Title
    this.add.text(GAME_WIDTH / 2, 28, '컬러 소팅 퍼즐', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Level
    this.levelText = this.add.text(24, 60, `레벨 ${this.level}`, {
      fontSize: '18px',
      color: '#6c5ce7',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    });

    // Moves
    this.movesText = this.add.text(GAME_WIDTH - 24, 60, `이동: 0`, {
      fontSize: '16px',
      color: '#aaa',
      fontFamily: 'sans-serif',
    }).setOrigin(1, 0);

    // Undo button
    this.undoBtn = this.add.container(60, GAME_HEIGHT - 50);
    const undoBg = this.add.rectangle(0, 0, 90, 36, 0x333355, 1).setInteractive({ useHandCursor: true });
    const undoText = this.add.text(0, 0, '↩ 되돌리기', {
      fontSize: '13px',
      color: '#ddd',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    this.undoBtn.add([undoBg, undoText]);

    undoBg.on('pointerover', () => undoBg.setFillStyle(0x444466));
    undoBg.on('pointerout', () => undoBg.setFillStyle(0x333355));
    undoBg.on('pointerup', () => this.undoMove());

    // Restart button
    const restartBtn = this.add.container(170, GAME_HEIGHT - 50);
    const restartBg = this.add.rectangle(0, 0, 80, 36, 0x333355, 1).setInteractive({ useHandCursor: true });
    const restartText = this.add.text(0, 0, '↻ 재시작', {
      fontSize: '13px',
      color: '#ddd',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    restartBtn.add([restartBg, restartText]);

    restartBg.on('pointerover', () => restartBg.setFillStyle(0x444466));
    restartBg.on('pointerout', () => restartBg.setFillStyle(0x333355));
    restartBg.on('pointerup', () => this.scene.restart({ level: this.level }));

    // Level select button
    const menuBtn = this.add.container(GAME_WIDTH - 60, GAME_HEIGHT - 50);
    const menuBg = this.add.rectangle(0, 0, 80, 36, 0x333355, 1).setInteractive({ useHandCursor: true });
    const menuText = this.add.text(0, 0, '📋 목록', {
      fontSize: '13px',
      color: '#ddd',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);
    menuBtn.add([menuBg, menuText]);

    menuBg.on('pointerover', () => menuBg.setFillStyle(0x444466));
    menuBg.on('pointerout', () => menuBg.setFillStyle(0x333355));
    menuBg.on('pointerup', () => this.scene.start('LevelSelect'));
  }

  createPuzzle() {
    const def = getLevelDef(this.level);
    const puzzle = generatePuzzle(def, this.level * 12345 + 67890);

    // Calculate tube positions
    const totalTubes = puzzle.length;
    const tubesPerRow = Math.min(totalTubes, 6);
    const rows = Math.ceil(totalTubes / tubesPerRow);
    const gapX = TUBE_WIDTH + 18;
    const startY = rows === 1 ? 200 : 140;
    const rowGap = 200;

    for (let i = 0; i < totalTubes; i++) {
      const row = Math.floor(i / tubesPerRow);
      const col = i % tubesPerRow;
      const tubesInThisRow = row === rows - 1 ? totalTubes - row * tubesPerRow : tubesPerRow;
      const rowWidth = tubesInThisRow * gapX;
      const tx = (GAME_WIDTH - rowWidth) / 2 + col * gapX + gapX / 2;
      const ty = startY + row * rowGap;

      const tube = new Tube(this, i, tx, ty);
      tube.setBalls(puzzle[i]);
      this.tubes.push(tube);

      // Setup click handler
      tube.hitZone.on('pointerup', () => this.onTubeClick(i));
    }
  }

  onTubeClick(tubeIdx: number) {
    if (this.isAnimating || this.levelCleared) return;

    const clickedTube = this.tubes[tubeIdx];

    // Nothing selected yet
    if (this.selectedTubeIdx === -1) {
      if (clickedTube.isEmpty()) return; // can't select empty tube
      this.selectedTubeIdx = tubeIdx;
      clickedTube.setHighlight(true);

      // Lift the top ball slightly
      const topBall = clickedTube.getTopBall();
      if (topBall) {
        this.tweens.add({
          targets: topBall.container,
          y: clickedTube.y - 30,
          duration: 150,
          ease: 'Power2',
        });
      }
      return;
    }

    // Same tube clicked = deselect
    if (this.selectedTubeIdx === tubeIdx) {
      this.deselectTube();
      return;
    }

    // Try to move
    const fromTube = this.tubes[this.selectedTubeIdx];
    const toTube = clickedTube;
    const topColor = fromTube.getTopColorIndex();

    if (topColor === -1 || !toTube.canReceive(topColor)) {
      // Invalid move - just select new tube if it has balls
      this.deselectTube();
      if (!clickedTube.isEmpty()) {
        this.selectedTubeIdx = tubeIdx;
        clickedTube.setHighlight(true);
        const topBall = clickedTube.getTopBall();
        if (topBall) {
          this.tweens.add({
            targets: topBall.container,
            y: clickedTube.y - 30,
            duration: 150,
            ease: 'Power2',
          });
        }
      }
      return;
    }

    // Perform move with animation
    this.performMove(this.selectedTubeIdx, tubeIdx);
  }

  performMove(fromIdx: number, toIdx: number) {
    this.isAnimating = true;
    const fromTube = this.tubes[fromIdx];
    const toTube = this.tubes[toIdx];

    const ball = fromTube.removeBall();
    if (!ball) {
      this.isAnimating = false;
      return;
    }

    // Record move for undo
    this.moveHistory.push({ fromIdx, toIdx, colorIndex: ball.colorIndex });
    this.moves++;
    this.movesText.setText(`이동: ${this.moves}`);

    // Deselect
    fromTube.setHighlight(false);
    this.selectedTubeIdx = -1;

    // Animate ball: arc trajectory
    const startPos = ball.getPosition();
    const targetY = toTube.getBallTargetY(toTube.balls.length);
    const arcTopY = Math.min(startPos.y, toTube.y) - 60;

    ball.setDepth(50);

    // Phase 1: Go up
    this.tweens.add({
      targets: ball.container,
      y: arcTopY,
      duration: 120,
      ease: 'Power2.easeOut',
      onComplete: () => {
        // Phase 2: Go across and down
        this.tweens.add({
          targets: ball.container,
          x: toTube.x,
          y: targetY,
          duration: 200,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            ball.setDepth(10);
            toTube.addBall(ball);
            this.playMoveSound();

            // Check completion
            if (toTube.isComplete()) {
              toTube.showCompleted();
            }

            if (this.checkWin()) {
              this.onLevelClear();
            }

            this.isAnimating = false;
          },
        });
      },
    });
  }

  deselectTube() {
    if (this.selectedTubeIdx === -1) return;
    const tube = this.tubes[this.selectedTubeIdx];
    tube.setHighlight(false);

    // Drop ball back down
    const topBall = tube.getTopBall();
    if (topBall) {
      const targetY = tube.getBallTargetY(tube.balls.length - 1);
      this.tweens.add({
        targets: topBall.container,
        y: targetY,
        duration: 150,
        ease: 'Power2',
      });
    }

    this.selectedTubeIdx = -1;
  }

  undoMove() {
    if (this.moveHistory.length === 0 || this.isAnimating || this.levelCleared) return;

    const move = this.moveHistory.pop()!;
    this.isAnimating = true;

    const fromTube = this.tubes[move.toIdx]; // reverse: move back
    const toTube = this.tubes[move.fromIdx];

    const ball = fromTube.removeBall();
    if (!ball) {
      this.isAnimating = false;
      return;
    }

    this.moves--;
    this.movesText.setText(`이동: ${this.moves}`);

    const targetY = toTube.getBallTargetY(toTube.balls.length);

    this.tweens.add({
      targets: ball.container,
      x: toTube.x,
      y: targetY,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        toTube.addBall(ball);
        this.isAnimating = false;
      },
    });
  }

  checkWin(): boolean {
    return this.tubes.every(tube => tube.isEmpty() || tube.isComplete());
  }

  onLevelClear() {
    this.levelCleared = true;

    // Save progress
    const saved = localStorage.getItem('colorsort_progress');
    const maxLevel = saved ? parseInt(saved, 10) : 0;
    if (this.level > maxLevel) {
      localStorage.setItem('colorsort_progress', String(this.level));
    }

    // Stars based on moves
    const def = getLevelDef(this.level);
    const optimalMoves = def.colors * def.ballsPerTube;
    let stars = 1;
    if (this.moves <= optimalMoves * 1.5) stars = 3;
    else if (this.moves <= optimalMoves * 2.5) stars = 2;

    // Overlay
    this.time.delayedCall(500, () => {
      const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
        .setDepth(100);
      this.tweens.add({ targets: overlay, fillAlpha: 0.6, duration: 400 });

      // Clear text
      const clearText = this.add.text(GAME_WIDTH / 2, 240, '클리어!', {
        fontSize: '40px',
        color: '#ffd700',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(101).setScale(0);

      this.tweens.add({
        targets: clearText,
        scaleX: 1, scaleY: 1,
        duration: 400,
        ease: 'Back.easeOut',
        delay: 200,
      });

      // Stars
      const starsStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      const starsText = this.add.text(GAME_WIDTH / 2, 295, starsStr, {
        fontSize: '32px',
        color: '#ffd700',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5).setDepth(101).setAlpha(0);

      this.tweens.add({ targets: starsText, alpha: 1, duration: 300, delay: 500 });

      // Moves text
      const movesResult = this.add.text(GAME_WIDTH / 2, 340, `${this.moves}회 이동`, {
        fontSize: '18px',
        color: '#ccc',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5).setDepth(101).setAlpha(0);

      this.tweens.add({ targets: movesResult, alpha: 1, duration: 300, delay: 600 });

      // Next level button
      const nextBg = this.add.rectangle(GAME_WIDTH / 2, 400, 180, 50, 0x6c5ce7, 1)
        .setDepth(101).setAlpha(0).setInteractive({ useHandCursor: true });
      const nextText = this.add.text(GAME_WIDTH / 2, 400, '다음 레벨 →', {
        fontSize: '18px',
        color: '#fff',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(102).setAlpha(0);

      nextBg.on('pointerover', () => nextBg.setFillStyle(0x7c6cf7));
      nextBg.on('pointerout', () => nextBg.setFillStyle(0x6c5ce7));
      nextBg.on('pointerup', () => this.scene.restart({ level: this.level + 1 }));

      this.tweens.add({ targets: [nextBg, nextText], alpha: 1, duration: 300, delay: 700 });
    });
  }

  playMoveSound() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // audio not available
    }
  }
}
