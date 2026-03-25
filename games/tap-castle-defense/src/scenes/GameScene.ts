import Phaser from 'phaser';
import localforage from 'localforage';
import { Castle } from '../objects/Castle';
import { Arrow } from '../objects/Arrow';
import { Enemy } from '../objects/Enemy';
import { Boss } from '../objects/Boss';
import { WaveManager } from '../systems/WaveManager';
import { generateUpgradeOptions } from '../systems/UpgradePool';
import { generateWaveConfig, EnemyType } from '../config/enemies';
import {
  UpgradeState,
  DEFAULT_UPGRADE_STATE,
  WEAPON_SPECS,
  WeaponType,
} from '../config/weapons';
import { UpgradeSceneData } from './UpgradeScene';

const GAME_W = 480;
const GAME_H = 640;
const CASTLE_X = 100;
const CASTLE_Y = GAME_H - 110;

export class GameScene extends Phaser.Scene {
  private castle!: Castle;
  private arrows: Arrow[] = [];
  private enemies: Enemy[] = [];
  private waveManager!: WaveManager;
  private upgradeState!: UpgradeState;

  // Spawn state
  private spawnQueue: { type: EnemyType; spawnInterval: number }[] = [];
  private spawnTimer: number = 0;
  private spawnIndex: number = 0;
  private allSpawned: boolean = false;

  // Stats
  private totalKills: number = 0;
  private critHits: number = 0;
  private totalHits: number = 0;
  private score: number = 0;

  // Shoot cooldown
  private lastShootTime: number = 0;

  // UI
  private waveText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private enemyCountText!: Phaser.GameObjects.Text;

  // Background graphics (redrawn once)
  private bgGraphics!: Phaser.GameObjects.Graphics;

  // Game over overlay
  private isGameOver: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.isGameOver = false;
    this.totalKills = 0;
    this.critHits = 0;
    this.totalHits = 0;
    this.score = 0;
    this.arrows = [];
    this.enemies = [];
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnIndex = 0;
    this.allSpawned = false;
    this.lastShootTime = 0;

    this.upgradeState = { ...DEFAULT_UPGRADE_STATE };
    this.waveManager = new WaveManager();

    this.drawBackground();
    this.createCastle();
    this.createUI();
    this.setupInput();

    // Archer damage event
    this.events.on('archerHitCastle', (dmg: number) => {
      if (this.isGameOver) return;
      const dead = this.castle.takeDamage(dmg);
      if (dead) this.triggerGameOver();
    });

    // Start first wave after short delay
    this.time.delayedCall(1200, () => {
      this.waveManager.send({ type: 'START' });
      this.beginWave();
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  // ─────────────────────────────────────────────
  // Background
  // ─────────────────────────────────────────────

  private drawBackground(): void {
    this.bgGraphics = this.add.graphics();
    const g = this.bgGraphics;
    const W = GAME_W;
    const H = GAME_H;

    // Sky gradient
    const steps = 24;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.floor(Phaser.Math.Linear(8, 35, t));
      const g2 = Math.floor(Phaser.Math.Linear(8, 18, t));
      const b = Math.floor(Phaser.Math.Linear(25, 50, t));
      g.fillStyle(Phaser.Display.Color.GetColor(r, g2, b), 1);
      g.fillRect(0, (H / steps) * i, W, H / steps + 1);
    }

    // Stars
    g.fillStyle(0xffffff, 1);
    const rng = new Phaser.Math.RandomDataGenerator(['castle-bg']);
    for (let i = 0; i < 60; i++) {
      g.fillCircle(rng.between(0, W), rng.between(0, H * 0.55), rng.realInRange(0.5, 1.8));
    }

    // Moon
    g.fillStyle(0xffffcc, 0.9);
    g.fillCircle(W - 60, 55, 28);
    g.fillStyle(0x1a1825, 1);
    g.fillCircle(W - 48, 48, 22); // crescent

    // Mountain silhouettes (back layer)
    g.fillStyle(0x151020, 1);
    this.drawMountains(g, W, H * 0.62, H * 0.18, 8, 0x151020);

    // Mountain silhouettes (front layer)
    this.drawMountains(g, W, H * 0.7, H * 0.14, 5, 0x1c1528);

    // Ground
    g.fillStyle(0x2a1f10, 1);
    g.fillRect(0, H * 0.83, W, H * 0.17);

    // Ground texture lines
    g.lineStyle(1, 0x3a2a18, 0.5);
    for (let i = 0; i < 5; i++) {
      g.lineBetween(0, H * 0.83 + i * 8, W, H * 0.83 + i * 8 + Phaser.Math.Between(-2, 2));
    }

    // Path (enemy walk path)
    g.fillStyle(0x3a2a14, 0.6);
    g.fillRect(0, H * 0.83 - 30, W, 60);
  }

  private drawMountains(
    g: Phaser.GameObjects.Graphics,
    W: number,
    baseY: number,
    maxH: number,
    peaks: number,
    color: number,
  ): void {
    g.fillStyle(color, 1);
    const pts: Phaser.Math.Vector2[] = [];
    pts.push(new Phaser.Math.Vector2(0, baseY));
    const step = W / peaks;
    for (let i = 0; i <= peaks; i++) {
      const px = i * step;
      const py = i === 0 || i === peaks ? baseY : baseY - maxH * (0.5 + Math.random() * 0.5);
      pts.push(new Phaser.Math.Vector2(px, py));
    }
    pts.push(new Phaser.Math.Vector2(W, baseY));
    pts.push(new Phaser.Math.Vector2(0, baseY));
    g.fillPoints(pts, true);
  }

  // ─────────────────────────────────────────────
  // Castle
  // ─────────────────────────────────────────────

  private createCastle(): void {
    this.castle = new Castle(this, CASTLE_X, CASTLE_Y, this.upgradeState.castleMaxHp);
    this.castle.drawHpBar();
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  private createUI(): void {
    const uiBg = this.add.graphics();
    uiBg.fillStyle(0x000000, 0.55);
    uiBg.fillRect(0, 0, GAME_W, 48);

    this.waveText = this.add.text(8, 8, 'Wave 0', {
      fontSize: '15px',
      color: '#f5c842',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });

    this.scoreText = this.add.text(GAME_W / 2, 8, 'Score: 0', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    this.killText = this.add.text(GAME_W - 8, 8, 'Kills: 0', {
      fontSize: '13px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(1, 0);

    this.weaponText = this.add.text(8, 28, '화살', {
      fontSize: '11px',
      color: '#44ccff',
      fontFamily: 'monospace',
    });

    this.enemyCountText = this.add.text(GAME_W - 8, 28, '', {
      fontSize: '11px',
      color: '#ff8888',
      fontFamily: 'monospace',
    }).setOrigin(1, 0);

    // Depth: UI on top
    uiBg.setDepth(10);
    this.waveText.setDepth(11);
    this.scoreText.setDepth(11);
    this.killText.setDepth(11);
    this.weaponText.setDepth(11);
    this.enemyCountText.setDepth(11);
  }

  private updateUI(): void {
    this.waveText.setText(`Wave ${this.waveManager.currentWave}`);
    this.scoreText.setText(`Score: ${this.score}`);
    this.killText.setText(`Kills: ${this.totalKills}`);
    const spec = WEAPON_SPECS[this.upgradeState.currentWeapon];
    this.weaponText.setText(`[${spec.nameKo}] DMG×${this.upgradeState.damageMultiplier.toFixed(1)}`);
    const remaining = this.enemies.length;
    this.enemyCountText.setText(remaining > 0 ? `적: ${remaining}` : '');
  }

  // ─────────────────────────────────────────────
  // Input
  // ─────────────────────────────────────────────

  private setupInput(): void {
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;
      if (!this.waveManager.is('combat')) return;
      this.shootAt(ptr.x, ptr.y);
    });
  }

  // ─────────────────────────────────────────────
  // Wave management
  // ─────────────────────────────────────────────

  private beginWave(): void {
    const waveNum = this.waveManager.currentWave;
    const config = generateWaveConfig(waveNum);

    // Flatten spawn queue
    this.spawnQueue = [];
    for (const group of config.enemies) {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({ type: group.type, spawnInterval: group.spawnInterval });
      }
    }

    const totalEnemies = this.spawnQueue.length;
    this.waveManager.send({ type: 'WAVE_BEGIN', totalEnemies });
    this.allSpawned = false;
    this.spawnIndex = 0;
    this.spawnTimer = 0;

    // Wave start banner
    this.showWaveBanner(waveNum, config.wave % 5 === 0);
    this.updateUI();
  }

  private showWaveBanner(wave: number, isBoss: boolean): void {
    const text = this.add.text(GAME_W / 2, GAME_H / 2, isBoss ? `⚠ BOSS WAVE ${wave} ⚠` : `WAVE ${wave}`, {
      fontSize: isBoss ? '28px' : '24px',
      color: isBoss ? '#ff4444' : '#f5c842',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.tweens.add({
      targets: text,
      alpha: 1,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      hold: 800,
      onComplete: () => {
        this.tweens.add({ targets: text, alpha: 0, duration: 300, onComplete: () => text.destroy() });
      },
    });

    if (isBoss) {
      this.cameras.main.shake(400, 0.008);
    }
  }

  private spawnEnemy(type: EnemyType): void {
    const waveNum = this.waveManager.currentWave;
    const waveConfig = generateWaveConfig(waveNum);
    const spawnY = CASTLE_Y - 10 + Phaser.Math.Between(-20, 20);
    const spawnX = GAME_W + 30 + Phaser.Math.Between(0, 80);

    const isBoss = type === 'boss';
    const EnemyClass = isBoss ? Boss : Enemy;

    const enemy = new EnemyClass(this, {
      type,
      x: spawnX,
      y: spawnY,
      hpScale: waveConfig.hpScale,
      speedScale: waveConfig.speedScale,
      onReachCastle: (dmg) => {
        const dead = this.castle.takeDamage(dmg);
        if (dead && !this.isGameOver) this.triggerGameOver();
      },
      onDeath: (e) => {
        this.enemies = this.enemies.filter(en => en !== e);
        this.totalKills++;
        this.score += e.spec.reward;
        this.waveManager.send({ type: 'ENEMY_KILLED' });
        this.updateUI();
        this.checkWaveCleared();
      },
    });

    this.enemies.push(enemy);
    this.waveManager.send({ type: 'ENEMY_SPAWNED' });
  }

  private checkWaveCleared(): void {
    if (!this.allSpawned) return;
    if (this.enemies.length > 0) return;
    if (!this.waveManager.is('combat')) return;

    this.waveManager.send({ type: 'WAVE_CLEARED' });
    this.time.delayedCall(600, () => this.openUpgradeScreen());
  }

  private openUpgradeScreen(): void {
    const options = generateUpgradeOptions(this.upgradeState, this.waveManager.currentWave);

    const sceneData: UpgradeSceneData = {
      wave: this.waveManager.currentWave,
      upgradeState: this.upgradeState,
      options,
      onChosen: (opt) => {
        this.upgradeState = opt.apply(this.upgradeState);
        // Apply HP bonus if any
        if (this.upgradeState.castleHpBonus > 0) {
          this.castle.setMaxHp(this.upgradeState.castleMaxHp);
          this.castle.heal(this.upgradeState.castleHpBonus);
          this.upgradeState = { ...this.upgradeState, castleHpBonus: 0 };
        }
        this.waveManager.send({ type: 'UPGRADE_CHOSEN' });
        this.time.delayedCall(400, () => this.beginWave());
      },
    };

    this.scene.launch('UpgradeScene', sceneData);
  }

  // ─────────────────────────────────────────────
  // Shooting
  // ─────────────────────────────────────────────

  private shootAt(targetX: number, targetY: number): void {
    const now = this.time.now;
    const spec = WEAPON_SPECS[this.upgradeState.currentWeapon];
    const cooldown = spec.fireRate * this.upgradeState.fireRateMultiplier;

    if (now - this.lastShootTime < cooldown) return;
    this.lastShootTime = now;

    const shots = this.upgradeState.multiShot;
    for (let i = 0; i < shots; i++) {
      const offsetX = shots > 1 ? Phaser.Math.Between(-15, 15) : 0;
      const offsetY = shots > 1 ? Phaser.Math.Between(-15, 15) : 0;
      this.createArrow(targetX + offsetX, targetY + offsetY);
    }
  }

  private createArrow(targetX: number, targetY: number): void {
    const isCrit = Math.random() < this.upgradeState.critChance;
    const spec = WEAPON_SPECS[this.upgradeState.currentWeapon];
    const baseDamage = spec.damage * this.upgradeState.damageMultiplier;
    const damage = isCrit ? baseDamage * spec.critMultiplier : baseDamage;

    const arrow = new Arrow(this, {
      weaponType: this.upgradeState.currentWeapon,
      startX: this.castle.shootOriginX,
      startY: this.castle.shootOriginY,
      targetX,
      targetY,
      damage,
      isCritical: isCrit,
      speedMultiplier: this.upgradeState.speedMultiplier,
      onHit: (a, hx, hy) => {
        this.handleArrowHit(a, hx, hy);
      },
      onComplete: (a) => {
        this.arrows = this.arrows.filter(ar => ar !== a);
      },
    });

    this.arrows.push(arrow);
    this.totalHits++;

    // Shoot sound visual feedback (muzzle flash at castle)
    this.showMuzzleFlash();
  }

  private showMuzzleFlash(): void {
    const flash = this.add.graphics();
    flash.fillStyle(0xffff88, 0.9);
    flash.fillCircle(0, 0, 8);
    flash.setPosition(this.castle.shootOriginX, this.castle.shootOriginY);
    flash.setDepth(5);

    this.tweens.add({
      targets: flash,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 120,
      onComplete: () => flash.destroy(),
    });
  }

  private handleArrowHit(arrow: Arrow, hitX: number, hitY: number): void {
    const weaponType = arrow.weaponType;

    if (weaponType === 'fire') {
      this.fireAoE(hitX, hitY, arrow.damage, arrow.isCritical);
      return;
    }

    if (weaponType === 'lightning') {
      this.lightningHit(hitX, hitY, arrow.damage, arrow.isCritical);
      return;
    }

    // Single target hit for non-AoE weapons
    for (const enemy of [...this.enemies]) {
      if (!enemy.alive) continue;
      const dist = Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y);
      if (dist < enemy.spec.size + 10) {
        const dead = enemy.takeDamage(arrow.damage);
        if (arrow.isCritical) this.showCritText(enemy.x, enemy.y - 30, arrow.damage);

        if (!dead) {
          if (weaponType === 'ice' && arrow.spec.slowFactor) {
            enemy.applySlow(arrow.spec.slowFactor, 2500);
          }
          if (weaponType === 'poison' && arrow.spec.dotDamage) {
            enemy.applyPoison(arrow.spec.dotDamage, arrow.spec.dotDuration ?? 4000);
          }
        }
        break;
      }
    }
  }

  private fireAoE(cx: number, cy: number, damage: number, isCrit: boolean): void {
    const spec = WEAPON_SPECS['fire'];
    const radius = spec.aoeRadius ?? 80;

    // Explosion visual
    const exp = this.add.graphics();
    exp.fillStyle(0xff4400, 0.8);
    exp.fillCircle(cx, cy, 10);
    exp.setDepth(6);

    this.tweens.add({
      targets: exp,
      scaleX: radius / 10,
      scaleY: radius / 10,
      alpha: 0,
      duration: 350,
      ease: 'Power2',
      onComplete: () => exp.destroy(),
    });

    // Ring
    const ring = this.add.graphics();
    ring.lineStyle(3, 0xff8800, 0.9);
    ring.strokeCircle(cx, cy, 10);
    ring.setDepth(6);

    this.tweens.add({
      targets: ring,
      scaleX: radius / 10,
      scaleY: radius / 10,
      alpha: 0,
      duration: 380,
      onComplete: () => ring.destroy(),
    });

    // Damage all in radius
    for (const enemy of [...this.enemies]) {
      if (!enemy.alive) continue;
      const dist = Phaser.Math.Distance.Between(cx, cy, enemy.x, enemy.y);
      if (dist < radius) {
        const falloff = 1 - dist / radius;
        const dmg = damage * (0.5 + 0.5 * falloff);
        enemy.takeDamage(dmg);
        if (isCrit) this.showCritText(enemy.x, enemy.y - 30, dmg);
      }
    }
  }

  private lightningHit(cx: number, cy: number, damage: number, isCrit: boolean): void {
    const spec = WEAPON_SPECS['lightning'];
    const chainCount = spec.chainCount ?? 2;

    // Lightning bolt visual
    this.drawLightningBolt(cx - 20, cy - 80, cx, cy);

    let hitCount = 0;
    const hitEnemies: Enemy[] = [];

    // Find enemies near target, sorted by distance
    const sorted = this.enemies
      .filter(e => e.alive)
      .sort((a, b) =>
        Phaser.Math.Distance.Between(cx, cy, a.x, a.y) -
        Phaser.Math.Distance.Between(cx, cy, b.x, b.y),
      );

    for (const enemy of sorted) {
      if (hitCount >= (spec.piercePower ?? 3)) break;
      enemy.takeDamage(damage * (0.7 ** hitCount));
      if (isCrit) this.showCritText(enemy.x, enemy.y - 30, damage);
      hitEnemies.push(enemy);
      hitCount++;
    }

    // Chain between hit enemies
    for (let i = 1; i < Math.min(hitEnemies.length, chainCount + 1); i++) {
      this.time.delayedCall(i * 80, () => {
        if (!hitEnemies[i - 1].active || !hitEnemies[i].active) return;
        this.drawLightningBolt(hitEnemies[i - 1].x, hitEnemies[i - 1].y, hitEnemies[i].x, hitEnemies[i].y);
      });
    }
  }

  private drawLightningBolt(x1: number, y1: number, x2: number, y2: number): void {
    const bolt = this.add.graphics();
    bolt.lineStyle(2, 0xffff44, 1);
    bolt.setDepth(7);

    // Jagged lightning path
    const steps = 8;
    let px = x1;
    let py = y1;
    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;

    for (let i = 1; i <= steps; i++) {
      const nx = x1 + dx * i + (i < steps ? Phaser.Math.Between(-12, 12) : 0);
      const ny = y1 + dy * i + (i < steps ? Phaser.Math.Between(-12, 12) : 0);
      bolt.lineBetween(px, py, nx, ny);
      px = nx;
      py = ny;
    }

    // Glow
    bolt.lineStyle(5, 0x8888ff, 0.3);
    bolt.lineBetween(x1, y1, x2, y2);

    this.tweens.add({
      targets: bolt,
      alpha: 0,
      duration: 180,
      onComplete: () => bolt.destroy(),
    });
  }

  private showCritText(x: number, y: number, damage: number): void {
    if (this.critHits === 0 || Math.random() < 0.8) this.critHits++;
    const text = this.add.text(x, y, `CRIT! ${Math.floor(damage)}`, {
      fontSize: '16px',
      color: '#ff4400',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  private showDamageText(x: number, y: number, damage: number): void {
    const text = this.add.text(x, y, `${Math.floor(damage)}`, {
      fontSize: '12px',
      color: '#ffcc44',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(14);

    this.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 500,
      ease: 'Power1',
      onComplete: () => text.destroy(),
    });
  }

  // ─────────────────────────────────────────────
  // Collision detection
  // ─────────────────────────────────────────────

  private checkArrowEnemyCollisions(): void {
    const toRemove: Arrow[] = [];

    for (const arrow of this.arrows) {
      if (!arrow.active || !arrow.isAlive()) continue;

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;

        const dist = Phaser.Math.Distance.Between(arrow.x, arrow.y, enemy.x, enemy.y);
        const hitRadius = enemy.spec.size + 8;

        if (dist < hitRadius) {
          // Check if critical zone (near head)
          const headY = enemy.y - enemy.spec.size - 8;
          const headDist = Phaser.Math.Distance.Between(arrow.x, arrow.y, enemy.x, headY);
          const nearHead = headDist < enemy.spec.size * 0.9;

          const isCrit = arrow.isCritical || nearHead;
          const finalDamage = isCrit && nearHead && !arrow.isCritical
            ? arrow.damage * 1.5  // bonus crit for head shot
            : arrow.damage;

          if (isCrit && nearHead && !arrow.isCritical) {
            this.critHits++;
            this.showCritText(enemy.x, enemy.y - 40, finalDamage);
          } else if (!isCrit) {
            this.showDamageText(enemy.x, enemy.y - 30, finalDamage);
          }

          const destroyed = arrow.registerHit();
          if (destroyed) {
            toRemove.push(arrow);
          }

          // Apply special weapon effects
          const weaponType = arrow.weaponType as WeaponType;
          if (weaponType === 'fire') {
            this.fireAoE(arrow.x, arrow.y, finalDamage, isCrit);
          } else if (weaponType === 'lightning') {
            this.lightningHit(arrow.x, arrow.y, finalDamage, isCrit);
          } else {
            enemy.takeDamage(finalDamage);
            if (weaponType === 'ice' && arrow.spec.slowFactor) {
              enemy.applySlow(arrow.spec.slowFactor, 2500);
            }
            if (weaponType === 'poison' && arrow.spec.dotDamage) {
              enemy.applyPoison(arrow.spec.dotDamage, arrow.spec.dotDuration ?? 4000);
            }
          }

          if (destroyed) break;
        }
      }
    }

    for (const arrow of toRemove) {
      this.arrows = this.arrows.filter(a => a !== arrow);
      if (arrow.active) arrow.destroy();
    }
  }

  // ─────────────────────────────────────────────
  // Game Over
  // ─────────────────────────────────────────────

  private async triggerGameOver(): Promise<void> {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.cameras.main.shake(500, 0.015);

    // Save records
    const bestWave = (await localforage.getItem<number>('bestWave')) ?? 0;
    const prevKills = (await localforage.getItem<number>('totalKills')) ?? 0;
    const currentWave = this.waveManager.currentWave;

    await localforage.setItem('bestWave', Math.max(bestWave, currentWave));
    await localforage.setItem('totalKills', prevKills + this.totalKills);
    const ratio = this.totalHits > 0 ? this.critHits / this.totalHits : 0;
    await localforage.setItem('critRatio', ratio);

    // Game over overlay
    this.time.delayedCall(500, () => {
      const W = GAME_W;
      const H = GAME_H;

      const overlay = this.add.graphics();
      overlay.fillStyle(0x000000, 0.75);
      overlay.fillRect(0, 0, W, H);
      overlay.setDepth(30);

      this.add.text(W / 2, H * 0.3, '성이 함락되었습니다', {
        fontSize: '28px',
        color: '#ff2222',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(31);

      this.add.text(W / 2, H * 0.42, [
        `웨이브: ${currentWave}`,
        `처치 수: ${this.totalKills}`,
        `점수: ${this.score}`,
        `치명타율: ${(ratio * 100).toFixed(1)}%`,
        '',
        `최고 웨이브: ${Math.max(bestWave, currentWave)}`,
      ].join('\n'), {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center',
        lineSpacing: 8,
      }).setOrigin(0.5).setDepth(31);

      // Restart button
      const btnBg = this.add.graphics().setDepth(31);
      const drawBtn = (hover: boolean) => {
        btnBg.clear();
        btnBg.fillStyle(hover ? 0xcc0000 : 0x8B0000, 1);
        btnBg.fillRoundedRect(W / 2 - 90, H * 0.72 - 22, 180, 44, 8);
        btnBg.lineStyle(2, 0xf5c842, 1);
        btnBg.strokeRoundedRect(W / 2 - 90, H * 0.72 - 22, 180, 44, 8);
      };
      drawBtn(false);

      const btnText = this.add.text(W / 2, H * 0.72, '다시 시작', {
        fontSize: '20px',
        color: '#f5c842',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(32);

      const zone = this.add.zone(W / 2, H * 0.72, 180, 44).setInteractive().setDepth(33);
      zone.on('pointerover', () => { drawBtn(true); btnText.setScale(1.05); });
      zone.on('pointerout', () => { drawBtn(false); btnText.setScale(1); });
      zone.on('pointerdown', () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
          this.scene.stop('UpgradeScene');
          this.waveManager.stop();
          this.scene.restart();
        });
      });

      // Menu button
      const menuBg = this.add.graphics().setDepth(31);
      const drawMenu = (hover: boolean) => {
        menuBg.clear();
        menuBg.fillStyle(hover ? 0x334455 : 0x223344, 1);
        menuBg.fillRoundedRect(W / 2 - 90, H * 0.82 - 20, 180, 40, 8);
        menuBg.lineStyle(1, 0x6688aa, 1);
        menuBg.strokeRoundedRect(W / 2 - 90, H * 0.82 - 20, 180, 40, 8);
      };
      drawMenu(false);

      this.add.text(W / 2, H * 0.82, '메인 메뉴', {
        fontSize: '16px',
        color: '#88aacc',
        fontFamily: 'monospace',
      }).setOrigin(0.5).setDepth(32);

      const menuZone = this.add.zone(W / 2, H * 0.82, 180, 40).setInteractive().setDepth(33);
      menuZone.on('pointerover', () => drawMenu(true));
      menuZone.on('pointerout', () => drawMenu(false));
      menuZone.on('pointerdown', () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
          this.scene.stop('UpgradeScene');
          this.waveManager.stop();
          this.scene.start('MenuScene');
        });
      });
    });
  }

  // ─────────────────────────────────────────────
  // Update loop
  // ─────────────────────────────────────────────

  update(_time: number, delta: number): void {
    if (this.isGameOver) return;

    // Spawn enemies
    if (this.waveManager.is('combat') && !this.allSpawned) {
      this.spawnTimer -= delta;
      if (this.spawnTimer <= 0 && this.spawnIndex < this.spawnQueue.length) {
        const entry = this.spawnQueue[this.spawnIndex];
        this.spawnTimer = entry.spawnInterval;
        this.spawnEnemy(entry.type);
        this.spawnIndex++;

        if (this.spawnIndex >= this.spawnQueue.length) {
          this.allSpawned = true;
          this.checkWaveCleared();
        }
      }
    }

    // Update arrows
    for (const arrow of [...this.arrows]) {
      if (arrow.active) arrow.update(delta);
    }

    // Update enemies
    for (const enemy of [...this.enemies]) {
      if (enemy.alive) enemy.update(delta);
    }

    // Collision
    this.checkArrowEnemyCollisions();

    // Clean up destroyed enemies
    this.enemies = this.enemies.filter(e => e.alive && e.active);

    this.updateUI();
  }
}
