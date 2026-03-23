import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../config';

export class Player extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys & {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private gfx: Phaser.GameObjects.Graphics;
  private pointerTarget: Phaser.Math.Vector2 | null = null;

  public hp: number = PLAYER_CONFIG.HP;
  public maxHp: number = PLAYER_CONFIG.HP;
  public moveSpeed: number = PLAYER_CONFIG.SPEED;
  public magnetRange: number = PLAYER_CONFIG.MAGNET_RANGE;
  public isInvincible: boolean = false;
  public level: number = 1;
  public xp: number = 0;
  public killCount: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCircle(PLAYER_CONFIG.RADIUS, -PLAYER_CONFIG.RADIUS, -PLAYER_CONFIG.RADIUS);
    this.body.setCollideWorldBounds(true);

    this.gfx = scene.add.graphics();
    this.add(this.gfx);
    this.drawPlayer();

    const keyboard = scene.input.keyboard!;
    this.keys = {
      ...keyboard.createCursorKeys(),
      W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerTarget = new Phaser.Math.Vector2(
        pointer.worldX,
        pointer.worldY
      );
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.pointerTarget = new Phaser.Math.Vector2(
          pointer.worldX,
          pointer.worldY
        );
      }
    });

    scene.input.on('pointerup', () => {
      this.pointerTarget = null;
    });
  }

  private drawPlayer(): void {
    this.gfx.clear();
    this.gfx.fillStyle(PLAYER_CONFIG.COLOR, 1);
    this.gfx.fillCircle(0, 0, PLAYER_CONFIG.RADIUS);
    this.gfx.lineStyle(2, 0xffffff, 0.5);
    this.gfx.strokeCircle(0, 0, PLAYER_CONFIG.RADIUS);
  }

  update(): void {
    const vx = this.getHorizontalInput();
    const vy = this.getVerticalInput();

    if (vx !== 0 || vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      this.body.setVelocity(
        (vx / len) * this.moveSpeed,
        (vy / len) * this.moveSpeed
      );
      this.pointerTarget = null;
    } else if (this.pointerTarget) {
      const dist = Phaser.Math.Distance.Between(
        this.x, this.y,
        this.pointerTarget.x, this.pointerTarget.y
      );
      if (dist > 10) {
        this.scene.physics.moveToObject(this, this.pointerTarget, this.moveSpeed);
      } else {
        this.body.setVelocity(0, 0);
        this.pointerTarget = null;
      }
    } else {
      this.body.setVelocity(0, 0);
    }
  }

  private getHorizontalInput(): number {
    let v = 0;
    if (this.keys.A.isDown || this.keys.left.isDown) v -= 1;
    if (this.keys.D.isDown || this.keys.right.isDown) v += 1;
    return v;
  }

  private getVerticalInput(): number {
    let v = 0;
    if (this.keys.W.isDown || this.keys.up.isDown) v -= 1;
    if (this.keys.S.isDown || this.keys.down.isDown) v += 1;
    return v;
  }

  takeDamage(amount: number): void {
    if (this.isInvincible) return;
    this.hp = Math.max(0, this.hp - amount);
    this.isInvincible = true;
    this.setAlpha(0.5);
    this.scene.time.delayedCall(PLAYER_CONFIG.INVINCIBLE_DURATION, () => {
      this.isInvincible = false;
      this.setAlpha(1);
    });
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  get isDead(): boolean {
    return this.hp <= 0;
  }
}
