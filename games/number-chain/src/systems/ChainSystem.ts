import Phaser from 'phaser';
import { Grid, GridPos } from '../objects/Grid';
import { TILE_SIZE } from '../config/gameConfig';

export class ChainSystem {
  private scene: Phaser.Scene;
  private grid: Grid;
  private onChainComplete: (chain: GridPos[], sum: number) => void;

  chain: GridPos[] = [];
  chainLine: Phaser.GameObjects.Graphics;
  sumDisplay: Phaser.GameObjects.Text;
  isDragging: boolean = false;

  constructor(
    scene: Phaser.Scene,
    grid: Grid,
    onChainComplete: (chain: GridPos[], sum: number) => void,
  ) {
    this.scene = scene;
    this.grid = grid;
    this.onChainComplete = onChainComplete;

    this.chainLine = scene.add.graphics();
    this.chainLine.setDepth(5);

    this.sumDisplay = scene.add.text(0, 0, '', {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.sumDisplay.setOrigin(0.5, 1);
    this.sumDisplay.setDepth(8);
    this.sumDisplay.setVisible(false);
  }

  startChain(col: number, row: number): void {
    this.chain = [{ col, row }];
    this.isDragging = true;

    const tile = this.grid.getTile(col, row);
    if (tile) tile.setSelected(true);

    this.drawChainLine();
    this.updateSumDisplay();
  }

  extendChain(col: number, row: number): void {
    if (!this.isDragging) return;

    const lastPos = this.chain[this.chain.length - 1];
    if (!lastPos) return;

    // Check if pointer goes back to second-to-last tile (deselect last)
    if (this.chain.length >= 2) {
      const secondLast = this.chain[this.chain.length - 2];
      if (secondLast.col === col && secondLast.row === row) {
        const removed = this.chain.pop()!;
        const removedTile = this.grid.getTile(removed.col, removed.row);
        if (removedTile) removedTile.setSelected(false);
        this.drawChainLine();
        this.updateSumDisplay();
        return;
      }
    }

    // Already in chain?
    const alreadyIn = this.chain.some(p => p.col === col && p.row === row);
    if (alreadyIn) return;

    // Must be adjacent to last
    const dc = Math.abs(col - lastPos.col);
    const dr = Math.abs(row - lastPos.row);
    if (dc > 1 || dr > 1) return;

    const tile = this.grid.getTile(col, row);
    if (!tile) return;

    this.chain.push({ col, row });
    tile.setSelected(true);

    this.drawChainLine();
    this.updateSumDisplay();
  }

  endChain(): void {
    if (!this.isDragging) return;
    this.isDragging = false;

    const sum = this.getChainSum();
    const validChain = this.chain.length >= 2 && sum % 10 === 0;

    // Deselect all tiles
    for (const pos of this.chain) {
      const tile = this.grid.getTile(pos.col, pos.row);
      if (tile) tile.setSelected(false);
    }

    this.chainLine.clear();
    this.sumDisplay.setVisible(false);

    if (validChain) {
      this.onChainComplete([...this.chain], sum);
    }

    this.chain = [];
  }

  drawChainLine(): void {
    this.chainLine.clear();
    if (this.chain.length < 1) return;

    const sum = this.getChainSum();
    const isValid = this.chain.length >= 2 && sum % 10 === 0;
    const lineColor = isValid ? 0x00FF88 : 0xFFFFFF;

    const points: { x: number; y: number }[] = this.chain.map(pos => {
      const world = this.grid.gridToWorld(pos.col, pos.row);
      return world;
    });

    if (points.length < 2) return;

    // Thick semi-transparent outer glow
    this.chainLine.lineStyle(12, lineColor, 0.25);
    this.chainLine.beginPath();
    this.chainLine.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.chainLine.lineTo(points[i].x, points[i].y);
    }
    this.chainLine.strokePath();

    // Medium glow
    this.chainLine.lineStyle(6, lineColor, 0.5);
    this.chainLine.beginPath();
    this.chainLine.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.chainLine.lineTo(points[i].x, points[i].y);
    }
    this.chainLine.strokePath();

    // Thin bright core
    this.chainLine.lineStyle(2, lineColor, 1.0);
    this.chainLine.beginPath();
    this.chainLine.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.chainLine.lineTo(points[i].x, points[i].y);
    }
    this.chainLine.strokePath();

    // Dot on each node
    for (const p of points) {
      this.chainLine.fillStyle(lineColor, 0.9);
      this.chainLine.fillCircle(p.x, p.y, 5);
    }
  }

  updateSumDisplay(): void {
    if (this.chain.length === 0) {
      this.sumDisplay.setVisible(false);
      return;
    }

    const sum = this.getChainSum();
    const isValid = this.chain.length >= 2 && sum % 10 === 0;

    this.sumDisplay.setText(`${sum}`);
    this.sumDisplay.setColor(isValid ? '#00FF88' : '#FFFFFF');
    this.sumDisplay.setVisible(true);

    // Position above the pointer
    const lastPos = this.chain[this.chain.length - 1];
    const world = this.grid.gridToWorld(lastPos.col, lastPos.row);
    this.sumDisplay.setPosition(world.x, world.y - TILE_SIZE / 2 - 10);
  }

  getChainSum(): number {
    let sum = 0;
    for (const pos of this.chain) {
      const tile = this.grid.getTile(pos.col, pos.row);
      if (tile) sum += tile.value;
    }
    return sum;
  }

  destroy(): void {
    this.chainLine.destroy();
    this.sumDisplay.destroy();
  }
}
