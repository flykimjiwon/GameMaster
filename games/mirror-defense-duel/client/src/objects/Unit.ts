import Phaser from "phaser";
import { UNIT_RENDER } from "../config/units";
import type { UnitType } from "@shared/types";

export class UnitSprite extends Phaser.GameObjects.Container {
  private gfx: Phaser.GameObjects.Graphics;
  private hpBar: Phaser.GameObjects.Graphics;
  readonly unitType: UnitType;
  private maxHp: number;
  private currentHp: number;
  private renderSize: number;
  private unitColor: number;

  // For interpolation
  targetX: number = 0;
  targetY: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    cellSize: number,
    type: UnitType,
    playerColor: number
  ) {
    super(scene, x, y);
    this.unitType = type;
    this.targetX = x;
    this.targetY = y;

    const info = UNIT_RENDER[type];
    this.maxHp = info.hp;
    this.currentHp = info.hp;
    this.renderSize = Math.min(info.size, cellSize / 2 - 1);
    this.unitColor = playerColor;

    this.gfx = scene.add.graphics();
    this.hpBar = scene.add.graphics();
    this.add(this.gfx);
    this.add(this.hpBar);

    this.drawUnit();
    this.drawHpBar();

    scene.add.existing(this);
  }

  private drawUnit(): void {
    const g = this.gfx;
    g.clear();

    g.fillStyle(this.unitColor, 0.9);

    if (this.unitType === "tank") {
      // Square for tank
      g.fillRect(-this.renderSize, -this.renderSize, this.renderSize * 2, this.renderSize * 2);
      g.lineStyle(1, 0xffffff, 0.4);
      g.strokeRect(-this.renderSize, -this.renderSize, this.renderSize * 2, this.renderSize * 2);
    } else {
      // Circle for others
      g.fillCircle(0, 0, this.renderSize);
      g.lineStyle(1, 0xffffff, 0.3);
      g.strokeCircle(0, 0, this.renderSize);
    }

    // Type indicator dot
    const info = UNIT_RENDER[this.unitType];
    g.fillStyle(info.color, 0.8);
    g.fillCircle(0, 0, this.renderSize * 0.4);
  }

  private drawHpBar(): void {
    const g = this.hpBar;
    g.clear();

    const barWidth = this.renderSize * 2.5;
    const barHeight = 3;
    const yOff = -this.renderSize - 5;
    const ratio = Math.max(0, this.currentHp / this.maxHp);

    // Background
    g.fillStyle(0x333333, 0.8);
    g.fillRect(-barWidth / 2, yOff, barWidth, barHeight);

    // HP fill
    const hpColor = ratio > 0.5 ? 0x4caf50 : ratio > 0.25 ? 0xffeb3b : 0xf44336;
    g.fillStyle(hpColor, 0.9);
    g.fillRect(-barWidth / 2, yOff, barWidth * ratio, barHeight);
  }

  updateHp(hp: number): void {
    this.currentHp = hp;
    this.drawHpBar();
  }

  setDead(): void {
    this.setAlpha(0);
    this.setVisible(false);
  }

  lerpToTarget(factor: number = 0.2): void {
    this.x += (this.targetX - this.x) * factor;
    this.y += (this.targetY - this.y) * factor;
  }
}
