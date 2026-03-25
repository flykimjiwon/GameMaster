import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT } from '../config/gameConfig';

export type EnemyType = 'soldier' | 'bird' | 'shield';

const GROUND_Y = GAME_HEIGHT - 80;

interface EnemyConfig {
  type: EnemyType;
  x: number;
  speedScale: number;
}

export class Enemy {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  body: Phaser.Physics.Arcade.Body;
  type: EnemyType;
  alive: boolean = true;
  private gfx: Phaser.GameObjects.Graphics;
  private baseSpeed: number;

  constructor(scene: Phaser.Scene, cfg: EnemyConfig) {
    this.scene = scene;
    this.type = cfg.type;

    this.gfx = scene.add.graphics();
    this.container = scene.add.container(cfg.x, 0, [this.gfx]);

    scene.physics.add.existing(this.container);
    this.body = this.container.body as Phaser.Physics.Arcade.Body;
    this.body.setGravityY(900);
    this.body.setCollideWorldBounds(false);

    let speed = 130;
    if (this.type === 'soldier') {
      speed = 100 + 60 * cfg.speedScale;
      this.container.y = GROUND_Y - 28;
      this.body.setSize(28, 52);
      this.body.setOffset(-14, -26);
      this.drawSoldier();
    } else if (this.type === 'bird') {
      speed = 160 + 80 * cfg.speedScale;
      this.container.y = GAME_HEIGHT - 200 - Math.random() * 60;
      this.body.setSize(36, 28);
      this.body.setOffset(-18, -14);
      this.body.setAllowGravity(false);
      this.drawBird();
    } else {
      // shield
      speed = 70 + 40 * cfg.speedScale;
      this.container.y = GROUND_Y - 28;
      this.body.setSize(32, 52);
      this.body.setOffset(-16, -26);
      this.drawShield();
    }

    this.baseSpeed = speed;
    this.body.setVelocityX(-speed);
  }

  private drawSoldier(): void {
    const g = this.gfx;
    g.clear();
    g.fillStyle(COLORS.ENEMY_SOLDIER, 1);
    g.fillRect(-10, -24, 20, 30);
    g.fillRect(-8, 6, 16, 20);
    g.fillRect(-9, -38, 18, 16);
    // Spear
    g.fillStyle(0xffaaaa, 1);
    g.fillRect(-18, -32, 4, 44);
    g.fillTriangle(-20, -40, -16, -40, -18, -54);
  }

  private drawBird(): void {
    const g = this.gfx;
    g.clear();
    g.fillStyle(COLORS.ENEMY_BIRD, 1);
    // Body
    g.fillEllipse(0, 0, 32, 20);
    // Head
    g.fillCircle(-12, -6, 10);
    // Beak
    g.fillTriangle(-20, -8, -26, -4, -20, 0);
    // Wings
    g.fillStyle(0xdd8800, 0.8);
    g.fillTriangle(0, -2, 20, -18, 20, 4);
    g.fillTriangle(0, 2, 20, 4, 16, 20);
  }

  private drawShield(): void {
    const g = this.gfx;
    g.clear();
    g.fillStyle(COLORS.ENEMY_SHIELD, 1);
    g.fillRect(-10, -24, 20, 30);
    g.fillRect(-8, 6, 16, 20);
    g.fillRect(-9, -38, 18, 16);
    // Big shield
    g.fillStyle(0x228844, 1);
    g.fillRect(-28, -28, 22, 44);
    g.lineStyle(2, 0x88ffaa, 1);
    g.strokeRect(-28, -28, 22, 44);
    // Cross on shield
    g.fillStyle(0x88ffaa, 0.6);
    g.fillRect(-20, -10, 6, 20);
    g.fillRect(-28, -2, 22, 6);
  }

  canBeKilledBy(method: 'attack' | 'dash' | 'jump'): boolean {
    if (this.type === 'soldier') return method === 'attack' || method === 'jump';
    if (this.type === 'bird') return method === 'attack' || method === 'jump';
    if (this.type === 'shield') return method === 'dash';
    return false;
  }

  kill(): void {
    this.alive = false;
    // Death flash
    this.gfx.clear();
    this.gfx.fillStyle(0xffffff, 0.9);
    this.gfx.fillCircle(0, -10, 24);
    this.scene.time.delayedCall(120, () => {
      this.container.destroy();
    });
  }

  update(_delta: number): void {
    if (!this.alive) return;
    // Bird oscillation
    if (this.type === 'bird') {
      this.container.y += Math.sin(this.scene.time.now * 0.003) * 0.6;
    }
  }

  isOffScreen(): boolean {
    return this.container.x < -100;
  }

  getBounds(): Phaser.Geom.Rectangle {
    const hw = (this.body.width || 28) / 2;
    const hh = (this.body.height || 52) / 2;
    return new Phaser.Geom.Rectangle(
      this.container.x - hw,
      this.container.y - hh,
      hw * 2,
      hh * 2,
    );
  }

  destroy(): void {
    this.container.destroy();
  }
}
