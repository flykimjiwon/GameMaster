import Phaser from 'phaser';
import { TowerType, TOWER_COLORS } from '../config/tetrominos';
import { TOWER_CONFIGS, getTowerStatsForLevel } from '../config/towers';
import { CELL_SIZE } from './Grid';

export class Tower {
  public scene: Phaser.Scene;
  public type: TowerType;
  public level: number;
  public gridRow: number;
  public gridCol: number;

  public damage: number;
  public range: number;      // cells
  public attackSpeed: number; // seconds

  private cooldown: number = 0;
  private graphics: Phaser.GameObjects.Graphics;
  private attackGraphics: Phaser.GameObjects.Graphics;
  private attackTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    gridRow: number,
    gridCol: number,
    type: TowerType,
    level: number = 1
  ) {
    this.scene = scene;
    this.type = type;
    this.level = level;
    this.gridRow = gridRow;
    this.gridCol = gridCol;

    const config = TOWER_CONFIGS[type];
    const stats = getTowerStatsForLevel(config, level);
    this.damage = stats.damage;
    this.range = stats.range;
    this.attackSpeed = stats.attackSpeed;

    this.graphics = scene.add.graphics();
    this.attackGraphics = scene.add.graphics();
    this.graphics.setDepth(5);
    this.attackGraphics.setDepth(6);

    this.cooldown = Math.random() * this.attackSpeed; // stagger initial attacks
  }

  updateStats(): void {
    const config = TOWER_CONFIGS[this.type];
    const stats = getTowerStatsForLevel(config, this.level);
    this.damage = stats.damage;
    this.range = stats.range;
    this.attackSpeed = stats.attackSpeed;
  }

  setGridPosition(row: number, col: number, offsetX: number, offsetY: number): void {
    this.gridRow = row;
    this.gridCol = col;
    // Tower is drawn at fixed grid position; no Phaser transform needed
    // We redraw on demand
    void offsetX; void offsetY;
  }

  // Returns world center of this tower
  getWorldPos(offsetX: number, offsetY: number): [number, number] {
    return [
      offsetX + this.gridCol * CELL_SIZE + CELL_SIZE / 2,
      offsetY + this.gridRow * CELL_SIZE + CELL_SIZE / 2,
    ];
  }

  tick(delta: number): void {
    this.cooldown -= delta / 1000;
    if (this.attackTimer > 0) {
      this.attackTimer -= delta / 1000;
      if (this.attackTimer <= 0) {
        this.attackGraphics.clear();
      }
    }
  }

  isReady(): boolean {
    return this.cooldown <= 0;
  }

  resetCooldown(): void {
    this.cooldown = this.attackSpeed;
  }

  drawAttackEffect(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): void {
    this.attackGraphics.clear();
    const color = TOWER_COLORS[this.type];
    this.attackGraphics.lineStyle(2, color, 0.9);
    this.attackGraphics.lineBetween(fromX, fromY, toX, toY);

    // Small burst at target
    this.attackGraphics.fillStyle(color, 0.7);
    this.attackGraphics.fillCircle(toX, toY, 5);

    this.attackTimer = 0.12; // show for 120ms
  }

  drawAoeEffect(fromX: number, fromY: number, radius: number): void {
    this.attackGraphics.clear();
    const color = TOWER_COLORS[this.type];
    this.attackGraphics.lineStyle(2, color, 0.6);
    this.attackGraphics.strokeCircle(fromX, fromY, radius * CELL_SIZE);
    this.attackGraphics.fillStyle(color, 0.15);
    this.attackGraphics.fillCircle(fromX, fromY, radius * CELL_SIZE);
    this.attackTimer = 0.18;
  }

  drawLineClearEffect(
    fromX: number,
    fromY: number,
    toX: number,
    canvasWidth: number
  ): void {
    this.attackGraphics.clear();
    const color = TOWER_COLORS[this.type];
    this.attackGraphics.lineStyle(4, color, 0.95);
    this.attackGraphics.lineBetween(0, fromY, canvasWidth, fromY);
    void fromX; void toX;
    this.attackTimer = 0.5;
  }

  destroy(): void {
    this.graphics.destroy();
    this.attackGraphics.destroy();
  }
}
