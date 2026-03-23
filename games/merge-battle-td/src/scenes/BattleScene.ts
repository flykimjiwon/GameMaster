import Phaser from 'phaser';
import { GridSystem } from '../systems/GridSystem';
import { PathSystem } from '../systems/PathSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { Tower } from '../entities/Tower';
import { Enemy } from '../entities/Enemy';
import { TowerType, GAME_WIDTH, CELL_SIZE, TOTAL_ENEMIES, TOWER_STATS } from '../config';
import { getTheme } from '../themes/ThemeSystem';

interface TowerData {
  type: TowerType;
  tier: number;
  col: number;
  row: number;
}

export class BattleScene extends Phaser.Scene {
  private gridSystem!: GridSystem;
  private pathSystem!: PathSystem;
  private waveSystem!: WaveSystem;
  private combatSystem!: CombatSystem;

  private towers: Tower[] = [];
  private enemies: Enemy[] = [];
  private escaped: number = 0;
  private killed: number = 0;
  private maxTier: number = 1;
  private maxTierType: TowerType = 'archer';

  private escapedText!: Phaser.GameObjects.Text;
  private rangeGfx!: Phaser.GameObjects.Graphics;
  private statText!: Phaser.GameObjects.Text;
  private totalEnemies: number = TOTAL_ENEMIES;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: { towerData: TowerData[] }): void {
    this.towers = [];
    this.enemies = [];
    this.escaped = 0;
    this.killed = 0;
    this.maxTier = 1;
    this.maxTierType = 'archer';
    this.registry.set('towerData', data.towerData);
  }

  create(): void {
    const theme = getTheme();
    this.cameras.main.setBackgroundColor(theme.background);

    // Rebuild systems
    this.pathSystem = new PathSystem(this);
    this.gridSystem = new GridSystem(this);
    this.gridSystem.draw(this.pathSystem.pathCells);
    this.pathSystem.draw();
    this.waveSystem = new WaveSystem();
    this.combatSystem = new CombatSystem(this);
    this.totalEnemies = this.waveSystem.getTotalEnemies();

    // Reconstruct towers
    const towerData: TowerData[] = this.registry.get('towerData') || [];
    for (const td of towerData) {
      const pos = this.gridSystem.cellToWorld(td.col, td.row);
      const tower = new Tower(this, pos.x, pos.y, td.type, td.tier);
      tower.setGridPosition(td.col, td.row);
      tower.disableInteractive();
      this.towers.push(tower);
      if (td.tier > this.maxTier) {
        this.maxTier = td.tier;
        this.maxTierType = td.type;
      }
    }

    // HUD
    this.add.rectangle(GAME_WIDTH / 2, 25, GAME_WIDTH, 50, theme.hudBgColor, theme.hudBgAlpha).setDepth(90);
    this.add.text(20, 15, 'BATTLE PHASE', {
      fontSize: '22px', color: '#cc4444', fontStyle: 'bold',
    }).setDepth(100);
    this.escapedText = this.add.text(GAME_WIDTH - 20, 15, `통과: 0/${this.totalEnemies}`, {
      fontSize: '20px', color: theme.hudTextColor,
    }).setOrigin(1, 0).setDepth(100);

    // Range display on click
    this.rangeGfx = this.add.graphics().setDepth(5);
    this.statText = this.add.text(GAME_WIDTH - 10, 60, '', {
      fontSize: '12px', color: theme.hudTextColor, align: 'right',
    }).setOrigin(1, 0).setDepth(100).setVisible(false);

    this.input.on('gameobjectdown', (_ptr: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
      if (obj instanceof Tower) {
        this.showRange(obj);
      }
    });

    // Start wave
    this.waveSystem.start();
  }

  private showRange(tower: Tower): void {
    const theme = getTheme();
    this.rangeGfx.clear();
    const stats = TOWER_STATS[tower.towerType];
    const idx = tower.tier - 1;
    const rangePx = stats.range[idx] * CELL_SIZE;
    const towerVisual = theme.towerVisuals[tower.towerType];
    this.rangeGfx.lineStyle(2, towerVisual.color, 0.3);
    this.rangeGfx.fillStyle(towerVisual.color, 0.08);
    this.rangeGfx.fillCircle(tower.x, tower.y, rangePx);
    this.rangeGfx.strokeCircle(tower.x, tower.y, rangePx);

    const names: Record<TowerType, string> = { archer: '아처', cannon: '캐논', slow: '슬로우' };
    const text = `${names[tower.towerType]} T${tower.tier}\nDMG: ${stats.dmg[idx]}`;
    this.statText.setText(text).setVisible(true);

    this.time.delayedCall(2000, () => {
      this.rangeGfx.clear();
      this.statText.setVisible(false);
    });
  }

  update(time: number, delta: number): void {
    // Spawn enemies
    const entry = this.waveSystem.update(delta);
    if (entry) {
      const startPos = this.pathSystem.waypoints[0];
      const enemy = new Enemy(this, startPos.x, startPos.y, entry.type);
      this.enemies.push(enemy);
    }

    // Move enemies along path
    const totalLength = this.pathSystem.getTotalLength();
    for (const enemy of this.enemies) {
      if (enemy.isDead || enemy.hasEscaped) continue;

      enemy.updateMovement(delta);
      const moveSpeed = enemy.speed * enemy.slowFactor * (delta / 1000);
      enemy.distanceTraveled += moveSpeed;

      const progress = enemy.distanceTraveled / totalLength;
      if (progress >= 1) {
        enemy.hasEscaped = true;
        this.escaped++;
        this.escapedText.setText(`통과: ${this.escaped}/${this.totalEnemies}`);
        if (this.escaped > this.totalEnemies * 0.5) {
          this.escapedText.setColor('#cc4444');
        }

        this.cameras.main.flash(100, 255, 50, 50);
        enemy.destroy();
        continue;
      }

      const pos = this.pathSystem.getPositionAtProgress(progress);
      enemy.x = pos.x;
      enemy.y = pos.y;
    }

    // Combat
    this.combatSystem.update(time, delta, this.towers, this.enemies);

    // Count killed
    this.killed = this.enemies.filter(e => e.isDead).length;

    // Check end condition
    const activeEnemies = this.enemies.filter(e => !e.isDead && !e.hasEscaped);
    if (this.waveSystem.allSpawned && activeEnemies.length === 0) {
      this.endBattle();
    }
  }

  private endBattle(): void {
    this.combatSystem.destroy();
    const defended = this.totalEnemies - this.escaped;
    const rate = Math.round((defended / this.totalEnemies) * 100);

    this.scene.start('ResultScene', {
      totalEnemies: this.totalEnemies,
      escaped: this.escaped,
      defended,
      rate,
      maxTier: this.maxTier,
      maxTierType: this.maxTierType,
      killed: this.killed,
    });
  }
}
