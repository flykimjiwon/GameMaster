import Phaser from 'phaser';
import { TowerType, TOWER_TYPES, TETROMINO_NAMES, TetrominoName } from '../config/tetrominos';
import { Tetromino } from '../objects/Tetromino';
import { Grid, GRID_ROWS } from '../objects/Grid';

export interface PiecePreview {
  name: TetrominoName;
  towerType: TowerType;
}

export class TetrisSystem {
  private scene: Phaser.Scene;
  private grid: Grid;

  public currentPiece: Tetromino | null = null;
  public holdPiece: PiecePreview | null = null;
  private holdUsed: boolean = false;

  private bag: PiecePreview[] = [];
  public nextPieces: PiecePreview[] = [];

  private dropTimer: number = 0;
  private dropInterval: number = 1000; // ms
  private softDropping: boolean = false;
  private lockDelayTimer: number = 0;
  private readonly LOCK_DELAY = 500; // ms

  public onPieceLocked: ((cells: Array<[number, number]>, type: TowerType) => void) | null = null;
  public onGameOver: (() => void) | null = null;
  public onPieceSpawned: (() => void) | null = null;

  constructor(scene: Phaser.Scene, grid: Grid) {
    this.scene = scene;
    this.grid = grid;
    this.fillBag();
    this.fillBag();
    this.spawnPiece();
  }

  private fillBag(): void {
    // 7-bag randomizer
    const names = [...TETROMINO_NAMES];
    for (let i = names.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [names[i], names[j]] = [names[j], names[i]];
    }
    for (const name of names) {
      const towerType = TOWER_TYPES[Math.floor(Math.random() * TOWER_TYPES.length)];
      this.bag.push({ name, towerType });
    }
  }

  private nextFromBag(): PiecePreview {
    if (this.bag.length < 7) this.fillBag();
    return this.bag.shift()!;
  }

  private ensureNextPieces(): void {
    while (this.nextPieces.length < 3) {
      this.nextPieces.push(this.nextFromBag());
    }
  }

  spawnPiece(): void {
    this.ensureNextPieces();
    const preview = this.nextPieces.shift()!;
    this.ensureNextPieces();
    this.holdUsed = false;

    const piece = new Tetromino(this.scene, this.grid, preview.name, preview.towerType);

    // Check game over: if spawn position is already blocked
    if (!piece.canPlace(piece.gridRow, piece.gridCol, piece.rotationIndex)) {
      piece.destroy();
      if (this.onGameOver) this.onGameOver();
      return;
    }

    this.currentPiece = piece;
    this.dropTimer = 0;
    this.lockDelayTimer = 0;

    if (this.onPieceSpawned) this.onPieceSpawned();
  }

  holdSwap(): void {
    if (this.holdUsed || !this.currentPiece) return;

    const current: PiecePreview = {
      name: this.currentPiece.name,
      towerType: this.currentPiece.towerType,
    };
    this.currentPiece.destroy();
    this.currentPiece = null;

    if (this.holdPiece) {
      // Swap with held piece
      const held = this.holdPiece;
      this.holdPiece = current;
      const piece = new Tetromino(this.scene, this.grid, held.name, held.towerType);
      if (!piece.canPlace(piece.gridRow, piece.gridCol, piece.rotationIndex)) {
        piece.destroy();
        if (this.onGameOver) this.onGameOver();
        return;
      }
      this.currentPiece = piece;
    } else {
      this.holdPiece = current;
      this.spawnPiece();
    }

    this.holdUsed = true;
    this.dropTimer = 0;
  }

  update(delta: number): void {
    if (!this.currentPiece) return;

    const effectiveInterval = this.softDropping ? this.dropInterval / 20 : this.dropInterval;
    this.dropTimer += delta;

    if (this.dropTimer >= effectiveInterval) {
      this.dropTimer = 0;
      const moved = this.currentPiece.moveDown();
      if (!moved) {
        // Piece hit bottom — start lock delay
        this.lockDelayTimer += delta;
        if (this.lockDelayTimer >= this.LOCK_DELAY) {
          this.lockCurrentPiece();
        }
      } else {
        this.lockDelayTimer = 0;
      }
    } else if (this.currentPiece.isAtBottom()) {
      this.lockDelayTimer += delta;
      if (this.lockDelayTimer >= this.LOCK_DELAY) {
        this.lockCurrentPiece();
      }
    }
  }

  moveLeft(): void {
    this.currentPiece?.moveLeft();
  }

  moveRight(): void {
    this.currentPiece?.moveRight();
  }

  rotateClockwise(): void {
    this.currentPiece?.rotateClockwise();
  }

  rotateCounterClockwise(): void {
    this.currentPiece?.rotateCounterClockwise();
  }

  hardDrop(): void {
    if (!this.currentPiece) return;
    this.currentPiece.hardDrop();
    this.lockCurrentPiece();
  }

  setSoftDrop(active: boolean): void {
    this.softDropping = active;
  }

  private lockCurrentPiece(): void {
    if (!this.currentPiece) return;

    const cells = this.currentPiece.getCells();
    const type = this.currentPiece.towerType;

    // Check if any cell is above the grid (game over)
    for (const [r] of cells) {
      if (r < 0) {
        this.currentPiece.destroy();
        this.currentPiece = null;
        if (this.onGameOver) this.onGameOver();
        return;
      }
    }

    this.currentPiece.lock();
    this.currentPiece.destroy();
    this.currentPiece = null;

    if (this.onPieceLocked) {
      this.onPieceLocked(cells, type);
    }

    this.spawnPiece();
  }

  setDropSpeed(interval: number): void {
    this.dropInterval = interval;
  }

  speedUp(wave: number): void {
    // Speed up with each wave, minimum 150ms
    this.dropInterval = Math.max(150, 1000 - wave * 50);
  }

  isGameOver(): boolean {
    // Check if any cell in top 2 rows is occupied
    for (let c = 0; c < 10; c++) {
      if (!this.grid.isCellEmpty(0, c) || !this.grid.isCellEmpty(1, c)) {
        return true;
      }
    }
    return false;
  }

  destroy(): void {
    this.currentPiece?.destroy();
    this.currentPiece = null;
  }
}
