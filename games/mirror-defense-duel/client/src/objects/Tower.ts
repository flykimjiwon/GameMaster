import Phaser from "phaser";
import { TOWER_RENDER, WALL_RENDER } from "../config/towers";
import type { TowerType } from "@shared/types";

export class TowerSprite extends Phaser.GameObjects.Container {
  private gfx: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  readonly towerType: TowerType | "wall";
  readonly gridX: number;
  readonly gridY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    size: number,
    type: TowerType | "wall",
    gridX: number,
    gridY: number
  ) {
    super(scene, x, y);
    this.towerType = type;
    this.gridX = gridX;
    this.gridY = gridY;

    this.gfx = scene.add.graphics();
    this.add(this.gfx);

    const half = size / 2 - 2;
    if (type === "wall") {
      this.gfx.fillStyle(WALL_RENDER.color, 0.9);
      this.gfx.fillRect(-half, -half, half * 2, half * 2);
      this.gfx.lineStyle(1, 0xffffff, 0.3);
      this.gfx.strokeRect(-half, -half, half * 2, half * 2);
    } else {
      const info = TOWER_RENDER[type];
      this.gfx.fillStyle(info.color, 0.9);

      switch (type) {
        case "arrow":
          // Triangle
          this.gfx.fillTriangle(0, -half, -half, half, half, half);
          break;
        case "cannon":
          // Circle
          this.gfx.fillCircle(0, 0, half);
          break;
        case "slow":
          // Diamond
          this.gfx.fillPoints([
            new Phaser.Geom.Point(0, -half),
            new Phaser.Geom.Point(half, 0),
            new Phaser.Geom.Point(0, half),
            new Phaser.Geom.Point(-half, 0),
          ], true);
          break;
      }

      // Range indicator
      this.gfx.lineStyle(1, info.color, 0.15);
      this.gfx.strokeCircle(0, 0, info.range * size);
    }

    // Label
    this.label = scene.add.text(0, half + 2, type === "wall" ? "벽" : TOWER_RENDER[type].name, {
      fontSize: "9px",
      color: "#aaa",
      fontFamily: "monospace",
    }).setOrigin(0.5, 0);
    this.add(this.label);

    scene.add.existing(this);
  }

  showRange(visible: boolean): void {
    // Range circle visibility is always shown for now
  }

  flash(): void {
    this.scene.tweens.add({
      targets: this.gfx,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
    });
  }
}
