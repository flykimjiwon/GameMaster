import Phaser from 'phaser';
import { KNIGHT, COLORS, GAME_HEIGHT } from '../config/gameConfig';
import { ActionType } from '../systems/InputSystem';

export type KnightState = 'run' | 'attack' | 'jump' | 'fall' | 'dash' | 'dead';

const GROUND_Y = GAME_HEIGHT - 80;

export class Knight {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Container;
  body: Phaser.Physics.Arcade.Body;

  state: KnightState = 'run';
  isInvincible: boolean = false;

  private stateTimer: number = 0;
  private graphics: Phaser.GameObjects.Graphics;
  private swordGraphics: Phaser.GameObjects.Graphics;
  private slashGraphics: Phaser.GameObjects.Graphics;

  // attack hitbox (world space, updated each frame)
  attackBox: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
  isAttacking: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    // Container for body graphics
    this.graphics = scene.add.graphics();
    this.swordGraphics = scene.add.graphics();
    this.slashGraphics = scene.add.graphics();

    this.sprite = scene.add.container(x, y, [
      this.graphics,
      this.swordGraphics,
      this.slashGraphics,
    ]);

    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setGravityY(KNIGHT.GRAVITY);
    this.body.setSize(28, 52);
    this.body.setOffset(-14, -26);
    this.body.setCollideWorldBounds(false);
    this.body.setMaxVelocityY(900);

    this.drawIdle();
  }

  private drawIdle(): void {
    const g = this.graphics;
    g.clear();
    // Body
    g.fillStyle(COLORS.KNIGHT, 1);
    g.fillRect(-10, -24, 20, 30);  // torso
    g.fillRect(-8, 6, 16, 20);    // legs
    // Head
    g.fillRect(-9, -38, 18, 16);
    // Cape
    g.fillStyle(0x3333aa, 1);
    g.fillTriangle(-10, -20, -20, 10, -10, 10);

    this.swordGraphics.clear();
    // Sword at side
    this.swordGraphics.fillStyle(COLORS.KNIGHT_SWORD, 1);
    this.swordGraphics.fillRect(10, -18, 4, 26);
    this.swordGraphics.fillRect(6, -8, 12, 4);
  }

  private drawAttack(): void {
    const g = this.graphics;
    g.clear();
    g.fillStyle(COLORS.KNIGHT, 1);
    g.fillRect(-10, -24, 20, 30);
    g.fillRect(-8, 6, 16, 20);
    g.fillRect(-9, -38, 18, 16);
    g.fillStyle(0x3333aa, 1);
    g.fillTriangle(-10, -20, -20, 10, -10, 10);

    this.swordGraphics.clear();
    // Sword extended forward
    this.swordGraphics.fillStyle(COLORS.KNIGHT_SWORD, 1);
    this.swordGraphics.fillRect(10, -30, 5, 55);   // blade
    this.swordGraphics.fillRect(7, -10, 14, 5);    // guard

    // Slash arc
    this.slashGraphics.clear();
    this.slashGraphics.fillStyle(COLORS.SLASH, 0.6);
    this.slashGraphics.fillTriangle(12, -34, 80, -10, 80, 20);
  }

  private drawJump(): void {
    const g = this.graphics;
    g.clear();
    g.fillStyle(COLORS.KNIGHT, 1);
    g.fillRect(-10, -24, 20, 28);
    g.fillRect(-12, 4, 10, 14);
    g.fillRect(2, 4, 10, 14);
    g.fillRect(-9, -38, 18, 16);
    g.fillStyle(0x3333aa, 1);
    g.fillTriangle(-10, -22, -22, 8, -10, 8);

    this.swordGraphics.clear();
    this.swordGraphics.fillStyle(COLORS.KNIGHT_SWORD, 1);
    this.swordGraphics.fillRect(10, -30, 4, 30);
    this.swordGraphics.fillRect(6, -14, 12, 4);
  }

  private drawDash(): void {
    const g = this.graphics;
    g.clear();
    // Stretched/leaning silhouette
    g.fillStyle(COLORS.KNIGHT, 1);
    g.fillRect(-8, -20, 22, 26);
    g.fillRect(-6, 6, 18, 18);
    g.fillRect(-6, -34, 16, 16);
    // Motion blur trail
    g.fillStyle(COLORS.KNIGHT, 0.3);
    g.fillRect(-32, -18, 22, 40);
    g.fillStyle(COLORS.KNIGHT, 0.15);
    g.fillRect(-54, -14, 22, 32);

    // Golden aura
    g.fillStyle(0xffaa22, 0.25);
    g.fillEllipse(0, -4, 68, 52);

    this.swordGraphics.clear();
    this.swordGraphics.fillStyle(COLORS.KNIGHT_SWORD, 1);
    this.swordGraphics.fillRect(14, -26, 5, 58);
    this.swordGraphics.fillRect(10, -6, 16, 5);

    this.slashGraphics.clear();
    this.slashGraphics.fillStyle(COLORS.GAUGE_DASH, 0.5);
  }

  private drawDead(): void {
    const g = this.graphics;
    g.clear();
    g.fillStyle(COLORS.KNIGHT, 0.8);
    // Fallen
    g.fillRect(-24, 2, 48, 16);
    g.fillRect(18, -8, 16, 14);
    this.swordGraphics.clear();
    this.slashGraphics.clear();
  }

  performAction(action: ActionType): void {
    if (this.state === 'dead') return;

    if (action === 'attack') {
      // Only attack on ground or mid-air
      if (this.state !== 'dash') {
        this.setState('attack');
      }
    } else if (action === 'jump') {
      if (this.body.blocked.down || this.state === 'run') {
        this.setState('jump');
      }
    } else if (action === 'dash') {
      this.setState('dash');
    }
  }

  private setState(state: KnightState): void {
    this.state = state;
    this.stateTimer = 0;
    this.isAttacking = false;
    this.isInvincible = false;
    this.slashGraphics.clear();

    if (state === 'attack') {
      this.drawAttack();
      this.isAttacking = true;
    } else if (state === 'jump') {
      this.body.setVelocityY(KNIGHT.JUMP_VELOCITY);
      this.drawJump();
    } else if (state === 'dash') {
      this.isInvincible = true;
      this.body.setVelocityX(KNIGHT.DASH_SPEED);
      this.body.setVelocityY(-80);
      this.drawDash();
    } else if (state === 'dead') {
      this.drawDead();
      this.body.setVelocityX(0);
    }
  }

  die(): void {
    if (this.state === 'dead') return;
    this.setState('dead');
  }

  update(delta: number): void {
    if (this.state === 'dead') return;

    this.stateTimer += delta;

    // Sync attack hitbox (right side of knight, world space)
    if (this.isAttacking) {
      const wx = this.sprite.x;
      const wy = this.sprite.y;
      this.attackBox.setTo(
        wx + 8,
        wy - KNIGHT.ATTACK_HEIGHT / 2 - 4,
        KNIGHT.ATTACK_RANGE,
        KNIGHT.ATTACK_HEIGHT,
      );
    } else {
      this.attackBox.setTo(0, 0, 0, 0);
    }

    // State transitions
    if (this.state === 'attack') {
      if (this.stateTimer >= KNIGHT.ATTACK_DURATION) {
        this.isAttacking = false;
        this.slashGraphics.clear();
        this.transitionToRun();
      }
    } else if (this.state === 'dash') {
      if (this.stateTimer >= KNIGHT.DASH_DURATION) {
        this.isInvincible = false;
        this.body.setVelocityX(KNIGHT.RUN_SPEED);
        this.transitionToRun();
      }
    } else if (this.state === 'jump' || this.state === 'fall') {
      if (this.body.blocked.down) {
        this.transitionToRun();
      } else if (this.body.velocity.y > 60 && this.state === 'jump') {
        this.state = 'fall';
      }
    }

    // Maintain run velocity
    if (this.state === 'run' || this.state === 'attack') {
      this.body.setVelocityX(KNIGHT.RUN_SPEED);
    } else if (this.state === 'jump' || this.state === 'fall') {
      this.body.setVelocityX(KNIGHT.RUN_SPEED);
    }
  }

  private transitionToRun(): void {
    this.state = 'run';
    this.stateTimer = 0;
    this.isAttacking = false;
    this.isInvincible = false;
    this.drawIdle();
  }

  getX(): number { return this.sprite.x; }
  getY(): number { return this.sprite.y; }

  destroy(): void {
    this.sprite.destroy();
  }
}
