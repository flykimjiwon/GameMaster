import Phaser from 'phaser';
import { Unit } from './Unit';
import { Enemy } from './Enemy';
import { EnemySpawnConfig, StageConfig } from '../config/stages';

export class BattleLane {
  scene: Phaser.Scene;
  units: Unit[];
  enemies: Enemy[];
  laneY: number;
  laneStartX: number;
  laneEndX: number;

  enemyBase: Phaser.GameObjects.Container;
  enemyBaseHp: number;
  enemyBaseMaxHp: number;
  private baseHpBar: Phaser.GameObjects.Graphics;
  private baseGfx: Phaser.GameObjects.Graphics;
  private baseHpText: Phaser.GameObjects.Text;

  private bgGraphics: Phaser.GameObjects.Graphics;
  private laneTop: number;
  private laneHeight: number;

  constructor(scene: Phaser.Scene, startX: number, endX: number, laneY: number, laneHeight: number, stageConfig: StageConfig) {
    this.scene = scene;
    this.units = [];
    this.enemies = [];
    this.laneY = laneY;
    this.laneStartX = startX;
    this.laneEndX = endX;
    this.laneTop = laneY - laneHeight / 2;
    this.laneHeight = laneHeight;
    this.enemyBaseMaxHp = stageConfig.baseHp;
    this.enemyBaseHp = stageConfig.baseHp;

    this.bgGraphics = scene.add.graphics();
    this.drawBackground();

    this.enemyBase = scene.add.container(endX - 40, laneY);
    this.baseGfx = scene.add.graphics();
    this.baseHpBar = scene.add.graphics();
    this.baseHpText = scene.add.text(0, 0, '', {
      fontSize: '11px',
      color: '#ffcccc',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);
    this.enemyBase.add([this.baseGfx, this.baseHpBar, this.baseHpText]);
    this.enemyBase.setDepth(5);
    this.drawBase();
    scene.add.existing(this.enemyBase);
  }

  private drawBackground(): void {
    const g = this.bgGraphics;
    g.clear();

    // Lane background gradient layers
    g.fillStyle(0x0d1117, 1);
    g.fillRect(this.laneStartX, this.laneTop, this.laneEndX - this.laneStartX, this.laneHeight);

    // Ground strip
    g.fillStyle(0x1a2233, 1);
    const groundY = this.laneY + this.laneHeight * 0.2;
    g.fillRect(this.laneStartX, groundY, this.laneEndX - this.laneStartX, this.laneHeight * 0.3);

    // Sky gradient stripes
    for (let i = 0; i < 6; i++) {
      const alpha = 0.03 + i * 0.01;
      g.fillStyle(0x1a3355, alpha);
      g.fillRect(
        this.laneStartX,
        this.laneTop + (i * this.laneHeight * 0.15),
        this.laneEndX - this.laneStartX,
        this.laneHeight * 0.15
      );
    }

    // Border lines
    g.lineStyle(2, 0x334466, 0.8);
    g.lineBetween(this.laneStartX, this.laneTop, this.laneEndX, this.laneTop);
    g.lineBetween(this.laneStartX, this.laneTop + this.laneHeight, this.laneEndX, this.laneTop + this.laneHeight);
  }

  drawBase(): void {
    const g = this.baseGfx;
    g.clear();

    // Castle base
    g.fillStyle(0x552222, 1);
    g.fillRect(-30, -40, 60, 70);

    // Battlements
    g.fillStyle(0x662222, 1);
    for (let i = 0; i < 4; i++) {
      g.fillRect(-28 + i * 16, -55, 10, 18);
    }

    // Gate
    g.fillStyle(0x221111, 1);
    g.fillRect(-10, 5, 20, 25);

    // Windows
    g.fillStyle(0xFF6600, 0.7);
    g.fillRect(-20, -25, 10, 12);
    g.fillRect(10, -25, 10, 12);

    // Border
    g.lineStyle(2, 0xFF4444, 1);
    g.strokeRect(-30, -40, 60, 70);

    this.updateBaseHpBar();
  }

  updateBaseHpBar(): void {
    this.baseHpBar.clear();
    const pct = Math.max(0, this.enemyBaseHp / this.enemyBaseMaxHp);
    const w = 70;
    const y = -70;
    this.baseHpBar.fillStyle(0x333333, 0.9);
    this.baseHpBar.fillRect(-w / 2, y, w, 6);
    this.baseHpBar.fillStyle(0xff4444, 1);
    this.baseHpBar.fillRect(-w / 2, y, w * pct, 6);

    const hpK = this.enemyBaseHp >= 1000
      ? `${Math.ceil(this.enemyBaseHp / 1000)}k`
      : `${this.enemyBaseHp}`;
    this.baseHpText.setText(hpK);
    this.baseHpText.setPosition(0, y - 12);
  }

  deployUnit(unit: Unit): void {
    unit.isDeployed = true;
    unit.gridCol = -1;
    unit.gridRow = -1;
    unit.setDepth(20);
    // Place at left edge of lane
    const deployX = this.laneStartX + 30 + Math.random() * 20;
    const deployY = this.laneY + (Math.random() - 0.5) * (this.laneHeight * 0.35);
    unit.playDeploy(deployX, deployY);
    this.units.push(unit);
  }

  spawnEnemy(config: EnemySpawnConfig): Enemy {
    const spawnX = this.laneEndX - 80 + Math.random() * 20;
    const spawnY = this.laneY + (Math.random() - 0.5) * (this.laneHeight * 0.35);
    const enemy = new Enemy(this.scene, spawnX, spawnY, config);
    enemy.setDepth(20);
    this.enemies.push(enemy);
    return enemy;
  }

  damageBase(amount: number): void {
    this.enemyBaseHp = Math.max(0, this.enemyBaseHp - amount);
    this.updateBaseHpBar();

    // Flash
    this.scene.tweens.add({
      targets: this.baseGfx,
      alpha: { from: 0.3, to: 1 },
      duration: 150,
      ease: 'Linear',
    });
  }

  isBaseDestroyed(): boolean {
    return this.enemyBaseHp <= 0;
  }

  isPlayerDefeated(): boolean {
    return this.units.length === 0;
  }

  removeDeadUnit(unit: Unit): void {
    const idx = this.units.indexOf(unit);
    if (idx >= 0) this.units.splice(idx, 1);

    this.scene.tweens.add({
      targets: unit,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => unit.destroy(),
    });
  }

  removeDeadEnemy(enemy: Enemy): void {
    const idx = this.enemies.indexOf(enemy);
    if (idx >= 0) this.enemies.splice(idx, 1);

    this.scene.tweens.add({
      targets: enemy,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => enemy.destroy(),
    });
  }

  destroy(): void {
    this.bgGraphics.destroy();
    this.enemyBase.destroy();
    for (const u of this.units) u.destroy();
    for (const e of this.enemies) e.destroy();
    this.units = [];
    this.enemies = [];
  }
}
