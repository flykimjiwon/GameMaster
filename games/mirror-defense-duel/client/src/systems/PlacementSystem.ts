import Phaser from "phaser";
import { GridBoard } from "../objects/GridBoard";
import { TowerSprite } from "../objects/Tower";
import { WallSprite } from "../objects/Wall";
import { NetworkManager } from "../network/NetworkManager";
import { TOWER_RENDER, WALL_RENDER } from "../config/towers";
import {
  GRID_SIZE,
  PLACEMENT_ROW_MIN,
  PLACEMENT_ROW_MAX,
  DEFAULT_MATERIALS,
  PLACEMENT_CELL_SIZE,
} from "../config/balance";
import type { TowerType, Materials, TowerPlacement, WallPlacement } from "@shared/types";

type PlaceableSelection = TowerType | "wall" | null;

export class PlacementSystem {
  private scene: Phaser.Scene;
  private grid: GridBoard;
  private network: NetworkManager;
  private selectedType: PlaceableSelection = null;
  private placedTowers: TowerSprite[] = [];
  private placedWalls: WallSprite[] = [];
  private remaining: Materials;
  private pathOverlay: Phaser.GameObjects.Graphics;
  private currentPath: number[][] | null = null;

  // UI elements
  private paletteButtons: Phaser.GameObjects.Container[] = [];
  private selectionIndicator: Phaser.GameObjects.Text;
  private onReadyCallback: () => void;

  constructor(
    scene: Phaser.Scene,
    grid: GridBoard,
    network: NetworkManager,
    onReady: () => void
  ) {
    this.scene = scene;
    this.grid = grid;
    this.network = network;
    this.remaining = JSON.parse(JSON.stringify(DEFAULT_MATERIALS));
    this.onReadyCallback = onReady;

    this.pathOverlay = scene.add.graphics();

    // Selection indicator text
    this.selectionIndicator = scene.add.text(620, 50, "배치할 항목을 선택하세요", {
      fontSize: "14px",
      fontFamily: "monospace",
      color: "#aaaaaa",
    });

    this.createPalette();
    this.setupInput();
    this.setupNetworkHandlers();
  }

  private createPalette(): void {
    const startX = 620;
    let yPos = 80;

    // Title
    this.scene.add.text(startX, yPos - 25, "── 방어 타워 ──", {
      fontSize: "13px",
      fontFamily: "monospace",
      color: "#8888cc",
    });

    // Tower buttons
    const towerTypes: TowerType[] = ["arrow", "cannon", "slow"];
    for (const type of towerTypes) {
      const info = TOWER_RENDER[type];
      const btn = this.createPaletteButton(
        startX,
        yPos,
        type,
        info.name,
        info.color,
        `x${this.remaining.towers[type]}`,
        info.description
      );
      this.paletteButtons.push(btn);
      yPos += 65;
    }

    // Wall button
    yPos += 10;
    const wallBtn = this.createPaletteButton(
      startX,
      yPos,
      "wall",
      WALL_RENDER.name,
      WALL_RENDER.color,
      `x${this.remaining.walls}`,
      WALL_RENDER.description
    );
    this.paletteButtons.push(wallBtn);
    yPos += 80;

    // Separator
    this.scene.add.text(startX, yPos, "── 공격 유닛 ──", {
      fontSize: "13px",
      fontFamily: "monospace",
      color: "#cc8888",
    });
    yPos += 25;

    // Unit info (auto-deployed, show counts)
    const unitInfo = [
      { name: "보병", count: DEFAULT_MATERIALS.units.infantry, icon: "⚔" },
      { name: "궁수", count: DEFAULT_MATERIALS.units.archer, icon: "🏹" },
      { name: "기마", count: DEFAULT_MATERIALS.units.cavalry, icon: "🐎" },
      { name: "탱크", count: DEFAULT_MATERIALS.units.tank, icon: "🛡" },
    ];
    for (const u of unitInfo) {
      this.scene.add.text(startX, yPos, `${u.name} x${u.count}`, {
        fontSize: "12px",
        fontFamily: "monospace",
        color: "#cccccc",
      });
      yPos += 20;
    }
    yPos += 5;
    this.scene.add.text(startX, yPos, "(자동 출격)", {
      fontSize: "11px",
      fontFamily: "monospace",
      color: "#666666",
    });

    yPos += 40;

    // Ready button
    const readyBtn = this.scene.add.text(startX + 10, yPos, "  준비 완료  ", {
      fontSize: "16px",
      fontFamily: "monospace",
      color: "#000000",
      backgroundColor: "#00e676",
      padding: { x: 16, y: 8 },
    })
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => readyBtn.setStyle({ backgroundColor: "#69f0ae" }))
      .on("pointerout", () => readyBtn.setStyle({ backgroundColor: "#00e676" }))
      .on("pointerdown", () => this.onReadyCallback());
  }

  private createPaletteButton(
    x: number,
    y: number,
    type: TowerType | "wall",
    name: string,
    color: number,
    countText: string,
    desc: string
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x16213e, 0.8);
    bg.fillRoundedRect(0, 0, 200, 55, 6);
    bg.lineStyle(1, this.selectedType === type ? 0x00e676 : 0x333366, 0.8);
    bg.strokeRoundedRect(0, 0, 200, 55, 6);
    container.add(bg);

    // Color swatch
    const swatch = this.scene.add.graphics();
    swatch.fillStyle(color, 1);
    swatch.fillCircle(20, 20, 10);
    container.add(swatch);

    // Name + count
    const nameText = this.scene.add.text(38, 6, `${name} ${countText}`, {
      fontSize: "13px",
      fontFamily: "monospace",
      color: "#ffffff",
    });
    container.add(nameText);

    // Description
    const descText = this.scene.add.text(38, 26, desc, {
      fontSize: "10px",
      fontFamily: "monospace",
      color: "#888888",
    });
    container.add(descText);

    // Interactive
    const hitArea = new Phaser.Geom.Rectangle(0, 0, 200, 55);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.on("pointerdown", () => {
      this.selectType(type);
    });

    // Store refs for updating
    (container as any)._type = type;
    (container as any)._bg = bg;
    (container as any)._nameText = nameText;

    return container;
  }

  private selectType(type: PlaceableSelection): void {
    if (this.selectedType === type) {
      this.selectedType = null;
      this.selectionIndicator.setText("배치할 항목을 선택하세요");
    } else {
      this.selectedType = type;
      const name =
        type === "wall"
          ? "벽"
          : type
            ? TOWER_RENDER[type].name
            : "";
      this.selectionIndicator.setText(`선택됨: ${name} (그리드 클릭하여 배치)`);
      this.selectionIndicator.setColor("#00e676");
    }
    this.updatePaletteHighlight();
  }

  private updatePaletteHighlight(): void {
    for (const btn of this.paletteButtons) {
      const btnType = (btn as any)._type;
      const bg = (btn as any)._bg as Phaser.GameObjects.Graphics;
      bg.clear();
      bg.fillStyle(0x16213e, 0.8);
      bg.fillRoundedRect(0, 0, 200, 55, 6);
      bg.lineStyle(2, btnType === this.selectedType ? 0x00e676 : 0x333366, 0.8);
      bg.strokeRoundedRect(0, 0, 200, 55, 6);
    }
  }

  private updatePaletteCounts(): void {
    for (const btn of this.paletteButtons) {
      const btnType = (btn as any)._type as TowerType | "wall";
      const nameText = (btn as any)._nameText as Phaser.GameObjects.Text;
      if (btnType === "wall") {
        nameText.setText(`벽 x${this.remaining.walls}`);
      } else {
        const info = TOWER_RENDER[btnType];
        nameText.setText(`${info.name} x${this.remaining.towers[btnType]}`);
      }
    }
  }

  private setupInput(): void {
    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.selectedType) return;

      const gridPos = this.grid.worldToGrid(pointer.x, pointer.y);
      if (!gridPos) return;

      const { gridX, gridY } = gridPos;

      // Check bounds
      if (gridY < PLACEMENT_ROW_MIN || gridY > PLACEMENT_ROW_MAX) return;

      // Check if already occupied → remove
      const existingTower = this.placedTowers.find(
        (t) => t.gridX === gridX && t.gridY === gridY
      );
      const existingWall = this.placedWalls.find(
        (w) => w.gridX === gridX && w.gridY === gridY
      );

      if (existingTower || existingWall) {
        if (existingTower) {
          this.network.send("remove_tower", { gridX, gridY });
        } else {
          this.network.send("remove_wall", { gridX, gridY });
        }
        return;
      }

      // Place new
      if (this.selectedType === "wall") {
        if (this.remaining.walls <= 0) return;
        this.network.send("place_wall", { gridX, gridY });
      } else {
        const towerType = this.selectedType;
        if (this.remaining.towers[towerType] <= 0) return;
        this.network.send("place_tower", { type: towerType, gridX, gridY });
      }
    });
  }

  private setupNetworkHandlers(): void {
    this.network.onMessage("placement_update", (data: {
      towers: TowerPlacement[];
      walls: WallPlacement[];
      remaining: Materials;
      path: number[][] | null;
    }) => {
      this.remaining = data.remaining;
      this.syncPlacedObjects(data.towers, data.walls);
      this.currentPath = data.path;
      this.drawPath();
      this.updatePaletteCounts();
    });

    this.network.onMessage("placement_error", (data: { message: string }) => {
      // Flash error
      const errorText = this.scene.add.text(
        GRID_SIZE * PLACEMENT_CELL_SIZE / 2 + 60,
        GRID_SIZE * PLACEMENT_CELL_SIZE + 100,
        data.message,
        {
          fontSize: "13px",
          fontFamily: "monospace",
          color: "#ff5252",
          backgroundColor: "#1a1a1a",
          padding: { x: 8, y: 4 },
        }
      ).setOrigin(0.5);

      this.scene.tweens.add({
        targets: errorText,
        alpha: 0,
        duration: 2000,
        delay: 1500,
        onComplete: () => errorText.destroy(),
      });
    });
  }

  private syncPlacedObjects(towers: TowerPlacement[], walls: WallPlacement[]): void {
    // Remove old
    for (const t of this.placedTowers) t.destroy();
    for (const w of this.placedWalls) w.destroy();
    this.placedTowers = [];
    this.placedWalls = [];

    const cellSize = this.grid.getCellSize();

    // Re-create towers
    for (const t of towers) {
      const pos = this.grid.gridToWorld(t.gridX, t.gridY);
      const sprite = new TowerSprite(
        this.scene,
        pos.x,
        pos.y,
        cellSize,
        t.type,
        t.gridX,
        t.gridY
      );
      this.placedTowers.push(sprite);
    }

    // Re-create walls
    for (const w of walls) {
      const pos = this.grid.gridToWorld(w.gridX, w.gridY);
      const sprite = new WallSprite(
        this.scene,
        pos.x,
        pos.y,
        cellSize,
        w.gridX,
        w.gridY
      );
      this.placedWalls.push(sprite);
    }
  }

  private drawPath(): void {
    this.pathOverlay.clear();
    if (!this.currentPath) return;

    const cellSize = this.grid.getCellSize();
    this.pathOverlay.lineStyle(2, 0x00e676, 0.4);

    for (let i = 0; i < this.currentPath.length - 1; i++) {
      const [x1, y1] = this.currentPath[i];
      const [x2, y2] = this.currentPath[i + 1];
      const p1 = this.grid.gridToWorld(x1, y1);
      const p2 = this.grid.gridToWorld(x2, y2);
      this.pathOverlay.moveTo(p1.x, p1.y);
      this.pathOverlay.lineTo(p2.x, p2.y);
    }
    this.pathOverlay.strokePath();

    // Path dots
    this.pathOverlay.fillStyle(0x00e676, 0.3);
    for (const [px, py] of this.currentPath) {
      const p = this.grid.gridToWorld(px, py);
      this.pathOverlay.fillCircle(p.x, p.y, cellSize / 6);
    }
  }

  destroy(): void {
    for (const t of this.placedTowers) t.destroy();
    for (const w of this.placedWalls) w.destroy();
    this.pathOverlay.destroy();
    this.selectionIndicator.destroy();
    for (const btn of this.paletteButtons) btn.destroy();
  }
}
