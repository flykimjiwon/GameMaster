import Phaser from 'phaser';
import { GAME_CONFIG, PLAYER_CONFIG } from '../config';
import { Player } from '../entities/Player';
import { EnemySpawner } from '../entities/EnemySpawner';
import { Enemy } from '../entities/Enemy';
// Boss is created by WaveSystem
import { OrbWeapon } from '../weapons/OrbWeapon';
import { LightningWeapon } from '../weapons/LightningWeapon';
import { XPSystem } from '../systems/XPSystem';
import { LevelUpSystem } from '../systems/LevelUpSystem';
import { WaveSystem } from '../systems/WaveSystem';

export class GameScene extends Phaser.Scene {
  public player!: Player;
  public enemies!: Phaser.Physics.Arcade.Group;
  public xpGems!: Phaser.Physics.Arcade.Group;
  public spawner!: EnemySpawner;
  public orbWeapon!: OrbWeapon;
  public lightningWeapon: LightningWeapon | null = null;
  public xpSystem!: XPSystem;
  public levelUpSystem!: LevelUpSystem;
  public waveSystem!: WaveSystem;
  public elapsedTime: number = 0;
  public gameOver: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.elapsedTime = 0;
    this.gameOver = false;
    this.lightningWeapon = null;

    // World bounds
    this.physics.world.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);

    // Draw grid background
    this.drawBackground();

    // Player
    this.player = new Player(this, GAME_CONFIG.WORLD_WIDTH / 2, GAME_CONFIG.WORLD_HEIGHT / 2);

    // Groups
    this.enemies = this.physics.add.group({ runChildUpdate: false });
    this.xpGems = this.physics.add.group();

    // Systems
    this.spawner = new EnemySpawner(this);
    this.orbWeapon = new OrbWeapon(this, this.player);
    this.xpSystem = new XPSystem(this, this.player);
    this.levelUpSystem = new LevelUpSystem(this);
    this.waveSystem = new WaveSystem(this);

    // Level up event
    this.events.on('levelup', () => {
      if (!this.levelUpSystem.isActive) {
        this.levelUpSystem.show();
      }
    });

    // Camera
    this.cameras.main.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Launch UI scene
    this.scene.launch('UIScene');
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);

    bg.lineStyle(1, 0x2a2a4e, 0.3);
    const gridSize = 80;
    for (let x = 0; x <= GAME_CONFIG.WORLD_WIDTH; x += gridSize) {
      bg.lineBetween(x, 0, x, GAME_CONFIG.WORLD_HEIGHT);
    }
    for (let y = 0; y <= GAME_CONFIG.WORLD_HEIGHT; y += gridSize) {
      bg.lineBetween(0, y, GAME_CONFIG.WORLD_WIDTH, y);
    }

    bg.lineStyle(3, 0xff4444, 0.5);
    bg.strokeRect(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
  }

  update(_time: number, delta: number): void {
    if (this.gameOver || this.levelUpSystem.isActive) return;

    this.elapsedTime += delta / 1000;

    // Player
    this.player.update();

    // Spawner
    this.spawner.update(this.elapsedTime, delta);

    // Enemies chase player
    for (const obj of this.enemies.getChildren()) {
      const enemy = obj as Enemy;
      if (enemy.active) {
        enemy.followTarget(this.player);
      }
    }

    // Orb weapon
    this.orbWeapon.update(delta);
    const orbKills = this.orbWeapon.checkCollisions(this.enemies);
    this.handleKills(orbKills);

    // Lightning weapon
    if (this.lightningWeapon) {
      const lKills = this.lightningWeapon.update(delta, this.enemies);
      this.handleKills(lKills);
    }

    // Boss
    this.waveSystem.update(this.elapsedTime);
    if (this.waveSystem.boss && this.waveSystem.boss.active) {
      this.waveSystem.boss.followTarget(this.player);

      // Boss collision with player
      const bossDmg = this.waveSystem.checkBossCollision(
        this.player.x, this.player.y, PLAYER_CONFIG.RADIUS
      );
      if (bossDmg > 0) {
        this.player.takeDamage(bossDmg);
      }

      // Orb damage to boss
      for (const orb of this.orbWeapon.getOrbs()) {
        const dist = Phaser.Math.Distance.Between(orb.x, orb.y, this.waveSystem.boss.x, this.waveSystem.boss.y);
        if (dist < 48) {
          const killed = this.waveSystem.damageBoss(this.orbWeapon.damage);
          if (killed) {
            this.player.killCount += 10;
            this.endGame(true);
            return;
          }
        }
      }
    }

    // Enemy collision with player
    for (const obj of this.enemies.getChildren()) {
      const enemy = obj as Enemy;
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, enemy.x, enemy.y
      );
      if (dist < PLAYER_CONFIG.RADIUS + 12) {
        this.player.takeDamage(enemy.damage);
      }
    }

    // XP
    this.xpSystem.update();

    // Death check
    if (this.player.isDead) {
      this.endGame(false);
    }
  }

  private handleKills(killed: Enemy[]): void {
    for (const enemy of killed) {
      this.player.killCount++;
      // Spawn XP gem
      this.xpSystem.spawnGem(enemy.x, enemy.y, enemy.xpValue);
      // Death animation
      this.tweens.add({
        targets: enemy,
        scaleX: 0, scaleY: 0, alpha: 0,
        duration: 150,
        onComplete: () => enemy.deactivate(),
      });
      // Particle effect
      this.spawnDeathParticles(enemy.x, enemy.y);
    }
  }

  private spawnDeathParticles(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const p = this.add.circle(x, y, 3, 0xffaa00, 1);
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => p.destroy(),
      });
    }
  }

  public endGame(victory: boolean): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();

    const remaining = Math.max(0, GAME_CONFIG.GAME_DURATION - this.elapsedTime);

    this.time.delayedCall(500, () => {
      this.scene.stop('UIScene');
      this.scene.start('ResultScene', {
        victory,
        killCount: this.player.killCount,
        level: this.player.level,
        remainingHp: this.player.hp,
        remainingTime: remaining,
      });
    });
  }
}
