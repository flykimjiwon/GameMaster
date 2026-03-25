import Phaser from "phaser";
import { GridBoard } from "../objects/GridBoard";
import { TowerSprite } from "../objects/Tower";
import { UnitSprite } from "../objects/Unit";
import { WallSprite } from "../objects/Wall";
import { BaseSprite } from "../objects/Base";
import {
  BATTLE_CELL_SIZE,
  BASE_X,
  BASE_Y,
  PLAYER_COLORS,
} from "../config/balance";
import type { TowerType, UnitType } from "@shared/types";

interface BattlePanelData {
  grid: GridBoard;
  towers: TowerSprite[];
  walls: WallSprite[];
  units: Map<string, UnitSprite>;
  base: BaseSprite;
  label: Phaser.GameObjects.Text;
}

export class BattleRenderer {
  private scene: Phaser.Scene;
  private leftPanel: BattlePanelData;
  private rightPanel: BattlePanelData;
  private killFeedTexts: Phaser.GameObjects.Text[] = [];

  constructor(
    scene: Phaser.Scene,
    mySessionId: string,
    player1Id: string,
    player2Id: string
  ) {
    this.scene = scene;

    const isPlayer1 = mySessionId === player1Id;

    // Left panel: My attack → Opponent's defense
    const leftLabel = isPlayer1 ? "내 공격 → 상대 방어" : "내 공격 → 상대 방어";
    this.leftPanel = this.createPanel(30, 60, leftLabel, 0);

    // Right panel: Opponent's attack → My defense
    const rightLabel = isPlayer1 ? "상대 공격 → 내 방어" : "상대 공격 → 내 방어";
    this.rightPanel = this.createPanel(660, 60, rightLabel, 1);
  }

  private createPanel(
    x: number,
    y: number,
    labelText: string,
    panelIndex: number
  ): BattlePanelData {
    // Panel background
    const bg = this.scene.add.graphics();
    const gridTotalSize = 10 * BATTLE_CELL_SIZE;
    bg.fillStyle(0x0a0a1a, 0.5);
    bg.fillRoundedRect(x - 10, y - 30, gridTotalSize + 20, gridTotalSize + 80, 8);
    bg.lineStyle(1, panelIndex === 0 ? 0x1e88e5 : 0xe53935, 0.5);
    bg.strokeRoundedRect(x - 10, y - 30, gridTotalSize + 20, gridTotalSize + 80, 8);

    const grid = new GridBoard(this.scene, x, y, BATTLE_CELL_SIZE, false);
    const label = this.scene.add.text(x + gridTotalSize / 2, y - 15, labelText, {
      fontSize: "12px",
      fontFamily: "monospace",
      color: "#aaaaaa",
    }).setOrigin(0.5);

    // Base
    const basePos = grid.gridToWorld(BASE_X, BASE_Y);
    const base = new BaseSprite(
      this.scene,
      basePos.x,
      basePos.y,
      BATTLE_CELL_SIZE,
      panelIndex === 0 ? PLAYER_COLORS[1] : PLAYER_COLORS[0],
      100
    );

    return {
      grid,
      towers: [],
      walls: [],
      units: new Map(),
      base,
      label,
    };
  }

  addTower(
    defenderId: string,
    id: string,
    gridX: number,
    gridY: number,
    towerType: string,
    mySessionId: string,
    player1Id: string
  ): void {
    const isPlayer1 = mySessionId === player1Id;
    // Left panel shows opponent's defense, right panel shows my defense
    const panel = (isPlayer1 && defenderId !== mySessionId) ||
      (!isPlayer1 && defenderId !== mySessionId)
      ? this.leftPanel
      : this.rightPanel;

    const pos = panel.grid.gridToWorld(gridX, gridY);
    const tower = new TowerSprite(
      this.scene,
      pos.x,
      pos.y,
      BATTLE_CELL_SIZE,
      towerType as TowerType,
      gridX,
      gridY
    );
    panel.towers.push(tower);
  }

  addWall(
    defenderId: string,
    gridX: number,
    gridY: number,
    mySessionId: string,
    player1Id: string
  ): void {
    const isMyDefense = defenderId === mySessionId;
    const panel = isMyDefense ? this.rightPanel : this.leftPanel;

    const pos = panel.grid.gridToWorld(gridX, gridY);
    const wall = new WallSprite(
      this.scene,
      pos.x,
      pos.y,
      BATTLE_CELL_SIZE,
      gridX,
      gridY
    );
    panel.walls.push(wall);
  }

  addUnit(
    attackerId: string,
    targetDefenderId: string,
    unitId: string,
    unitType: string,
    x: number,
    y: number,
    hp: number,
    mySessionId: string,
    player1Id: string
  ): void {
    const isMyAttack = attackerId === mySessionId;
    const panel = isMyAttack ? this.leftPanel : this.rightPanel;

    const colorIndex = attackerId === player1Id ? 0 : 1;
    const pos = panel.grid.gridToWorld(Math.floor(x), Math.floor(y));

    const unit = new UnitSprite(
      this.scene,
      pos.x,
      pos.y,
      BATTLE_CELL_SIZE,
      unitType as UnitType,
      PLAYER_COLORS[colorIndex]
    );
    unit.updateHp(hp);
    panel.units.set(unitId, unit);
  }

  updateUnit(
    unitId: string,
    x: number,
    y: number,
    hp: number,
    alive: boolean,
    attackerId: string,
    mySessionId: string
  ): void {
    const isMyAttack = attackerId === mySessionId;
    const panel = isMyAttack ? this.leftPanel : this.rightPanel;
    const unit = panel.units.get(unitId);
    if (!unit) return;

    if (!alive) {
      unit.setDead();
      return;
    }

    const pos = panel.grid.gridToWorld(0, 0);
    const cellSize = panel.grid.getCellSize();
    unit.targetX = panel.grid.x + x * cellSize + cellSize / 2;
    unit.targetY = panel.grid.y + y * cellSize + cellSize / 2;
    unit.updateHp(hp);
  }

  updateBaseHp(
    defenderId: string,
    hp: number,
    mySessionId: string
  ): void {
    const isMyDefense = defenderId === mySessionId;
    const panel = isMyDefense ? this.rightPanel : this.leftPanel;
    panel.base.updateHp(hp);
  }

  addKillFeed(message: string): void {
    const text = this.scene.add.text(640, 10, message, {
      fontSize: "11px",
      fontFamily: "monospace",
      color: "#ffab00",
      backgroundColor: "#1a1a1acc",
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 0);

    this.killFeedTexts.push(text);

    // Shift existing feed down
    for (let i = this.killFeedTexts.length - 2; i >= 0; i--) {
      this.killFeedTexts[i].y += 20;
      if (this.killFeedTexts[i].y > 80) {
        this.killFeedTexts[i].destroy();
        this.killFeedTexts.splice(i, 1);
      }
    }

    // Auto-remove after 3s
    this.scene.time.delayedCall(3000, () => {
      const idx = this.killFeedTexts.indexOf(text);
      if (idx !== -1) {
        text.destroy();
        this.killFeedTexts.splice(idx, 1);
      }
    });
  }

  update(): void {
    // Lerp all units towards their targets
    for (const panel of [this.leftPanel, this.rightPanel]) {
      for (const unit of panel.units.values()) {
        unit.lerpToTarget(0.15);
      }
    }
  }

  destroy(): void {
    for (const panel of [this.leftPanel, this.rightPanel]) {
      panel.grid.destroy();
      panel.base.destroy();
      panel.label.destroy();
      for (const t of panel.towers) t.destroy();
      for (const w of panel.walls) w.destroy();
      for (const u of panel.units.values()) u.destroy();
    }
    for (const t of this.killFeedTexts) t.destroy();
  }
}
