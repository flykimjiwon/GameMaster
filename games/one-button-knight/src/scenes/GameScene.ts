import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, HOLD_THRESHOLDS, KNIGHT } from '../config/gameConfig';
import { Knight } from '../objects/Knight';
import { Enemy } from '../objects/Enemy';
import { EnemySpawner } from '../objects/EnemySpawner';
import { InputSystem } from '../systems/InputSystem';
import { ComboSystem } from '../systems/ComboSystem';

const GROUND_Y = GAME_HEIGHT - 80;
const KNIGHT_FIXED_X = 160;

export class GameScene extends Phaser.Scene {
  private knight!: Knight;
  private spawner!: EnemySpawner;
  private inputSystem!: InputSystem;
  private combo!: ComboSystem;

  // Parallax layers
  private skyLayer!: Phaser.GameObjects.Graphics;
  private mountainLayer!: Phaser.GameObjects.TileSprite;
  private hillLayer!: Phaser.GameObjects.TileSprite;
  private groundLayer!: Phaser.GameObjects.TileSprite;

  // HUD
  private distText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private gaugeContainer!: Phaser.GameObjects.Container;
  private gaugeBg!: Phaser.GameObjects.Graphics;
  private gaugeFill!: Phaser.GameObjects.Graphics;
  private gaugeLabel!: Phaser.GameObjects.Text;

  // State
  private distance: number = 0;
  private maxCombo: number = 0;
  private gameActive: boolean = false;
  private cameraOffsetX: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.distance = 0;
    this.maxCombo = 0;
    this.gameActive = true;
    this.cameraOffsetX = 0;

    this.buildBackground();
    this.buildGround();

    // Knight at fixed screen X, ground level
    this.knight = new Knight(this, KNIGHT_FIXED_X, GROUND_Y);
    (this.knight.body as Phaser.Physics.Arcade.Body).setVelocityX(KNIGHT.RUN_SPEED);

    this.spawner = new EnemySpawner(this);
    this.combo = new ComboSystem();
    this.inputSystem = new InputSystem(this);

    this.inputSystem.onAction(evt => {
      if (!this.gameActive) return;
      this.knight.performAction(evt.action);
    });

    this.buildHUD();
    this.buildGauge();

    // Ground collider — static rectangle at bottom
    const groundBody = this.physics.add.staticGroup();
    const groundRect = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 40, GAME_WIDTH, 80);
    this.physics.add.existing(groundRect, true);
    groundBody.add(groundRect);
    this.physics.add.collider(this.knight.sprite, groundBody);

    this.startBgm();
  }

  private buildBackground(): void {
    this.skyLayer = this.add.graphics();
    this.skyLayer.fillGradientStyle(0x050510, 0x050510, 0x0a0a2a, 0x0a0a2a, 1);
    this.skyLayer.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars
    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 1);
    for (let i = 0; i < 60; i++) {
      stars.fillCircle(
        Math.random() * GAME_WIDTH,
        Math.random() * (GAME_HEIGHT * 0.55),
        Math.random() * 1.4 + 0.2,
      );
    }

    this.mountainLayer = this.makeTileSpriteLayer(0x0e0e22, GAME_HEIGHT - 200, GAME_WIDTH, 200, 6);
    this.hillLayer     = this.makeTileSpriteLayer(0x121228, GAME_HEIGHT - 140, GAME_WIDTH, 140, 4);
  }

  private makeTileSpriteLayer(
    color: number,
    y: number,
    w: number,
    h: number,
    peaks: number,
  ): Phaser.GameObjects.TileSprite {
    const tileW = Math.floor(w / peaks) * 2;
    const rt = this.add.renderTexture(0, 0, tileW, h).setVisible(false);
    const gfx = this.add.graphics().setVisible(false);
    gfx.fillStyle(color, 1);
    const pw = tileW / 2;
    gfx.fillTriangle(0, h, pw, 0, pw * 2, h);
    rt.draw(gfx, 0, 0);
    gfx.destroy();
    rt.saveTexture('mountain_' + color);

    const ts = this.add.tileSprite(0, y, w, h, 'mountain_' + color).setOrigin(0, 0);
    return ts;
  }

  private buildGround(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.GROUND, 1);
    g.fillRect(0, GAME_HEIGHT - 80, GAME_WIDTH, 80);

    const tileW = 40;
    const rt = this.add.renderTexture(0, 0, tileW, 80).setVisible(false);
    const tgfx = this.add.graphics().setVisible(false);
    tgfx.fillStyle(COLORS.GROUND, 1);
    tgfx.fillRect(0, 0, tileW, 80);
    tgfx.lineStyle(1, COLORS.GROUND_LINE, 0.4);
    tgfx.lineBetween(0, 0, 0, 80);
    tgfx.lineBetween(0, 0, tileW, 0);
    rt.draw(tgfx, 0, 0);
    tgfx.destroy();
    rt.saveTexture('ground_tile');

    this.groundLayer = this.add.tileSprite(0, GAME_HEIGHT - 80, GAME_WIDTH, 80, 'ground_tile').setOrigin(0, 0);

    const line = this.add.graphics();
    line.lineStyle(2, COLORS.GROUND_LINE, 0.8);
    line.lineBetween(0, GAME_HEIGHT - 80, GAME_WIDTH, GAME_HEIGHT - 80);
  }

  private buildHUD(): void {
    const hud = this.add.graphics();
    hud.fillStyle(0x000000, 0.5);
    hud.fillRect(0, 0, GAME_WIDTH, 44);

    this.distText = this.add.text(12, 10, '0 m', {
      fontSize: '18px', color: '#aaaaff', fontFamily: 'Courier New, monospace',
    });

    this.scoreText = this.add.text(GAME_WIDTH / 2, 10, 'SCORE  0', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Courier New, monospace',
    }).setOrigin(0.5, 0);

    this.comboText = this.add.text(GAME_WIDTH - 12, 10, '', {
      fontSize: '18px', color: '#ffdd44', fontFamily: 'Courier New, monospace',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    [hud, this.distText, this.scoreText, this.comboText].forEach(o => o.setDepth(10));
  }

  private buildGauge(): void {
    const gw = 220; const gh = 20;
    const gx = GAME_WIDTH / 2 - gw / 2;
    const gy = GAME_HEIGHT - 30;

    this.gaugeBg = this.add.graphics().setDepth(10);
    this.gaugeBg.fillStyle(COLORS.GAUGE_BG, 0.9);
    this.gaugeBg.fillRoundedRect(gx, gy, gw, gh, 4);
    this.gaugeBg.lineStyle(1, 0x333366, 1);
    this.gaugeBg.strokeRoundedRect(gx, gy, gw, gh, 4);

    const zone1 = HOLD_THRESHOLDS.ATTACK / 700;
    const zone2 = HOLD_THRESHOLDS.JUMP / 700;

    const marker = this.add.graphics().setDepth(10);
    marker.lineStyle(1, 0x888888, 0.6);
    marker.lineBetween(gx + gw * zone1, gy, gx + gw * zone1, gy + gh);
    marker.lineBetween(gx + gw * zone2, gy, gx + gw * zone2, gy + gh);

    this.add.text(gx + gw * zone1 / 2, gy - 14, 'ATK', {
      fontSize: '10px', color: '#4488ff', fontFamily: 'Courier New, monospace',
    }).setOrigin(0.5, 0).setDepth(10);
    this.add.text(gx + gw * (zone1 + zone2) / 2, gy - 14, 'JMP', {
      fontSize: '10px', color: '#44ff88', fontFamily: 'Courier New, monospace',
    }).setOrigin(0.5, 0).setDepth(10);
    this.add.text(gx + gw * (zone2 + 1) / 2, gy - 14, 'DSH', {
      fontSize: '10px', color: '#ffaa22', fontFamily: 'Courier New, monospace',
    }).setOrigin(0.5, 0).setDepth(10);

    this.gaugeFill = this.add.graphics().setDepth(11);
    this.gaugeLabel = this.add.text(GAME_WIDTH / 2, gy - 28, '', {
      fontSize: '12px', color: '#ffffff', fontFamily: 'Courier New, monospace',
    }).setOrigin(0.5, 0).setDepth(11);

    this.gaugeContainer = this.add.container(gx, gy);
  }

  private updateGauge(holdMs: number): void {
    const gw = 220; const gh = 20;
    const gx = GAME_WIDTH / 2 - gw / 2;
    const gy = GAME_HEIGHT - 30;

    this.gaugeFill.clear();
    if (holdMs <= 0) {
      this.gaugeLabel.setText('');
      return;
    }

    const maxMs = 700;
    const ratio = Math.min(holdMs / maxMs, 1);
    const fillW = Math.max(4, ratio * gw);

    let color: number;
    let label: string;
    if (holdMs < HOLD_THRESHOLDS.ATTACK) {
      color = COLORS.GAUGE_ATTACK;
      label = 'ATTACK';
    } else if (holdMs < HOLD_THRESHOLDS.JUMP) {
      color = COLORS.GAUGE_JUMP;
      label = 'JUMP';
    } else {
      color = COLORS.GAUGE_DASH;
      label = 'DASH (무적)';
    }

    this.gaugeFill.fillStyle(color, 0.85);
    this.gaugeFill.fillRoundedRect(gx + 2, gy + 2, fillW - 4, gh - 4, 3);

    if (holdMs >= HOLD_THRESHOLDS.JUMP) {
      const alpha = 0.3 + 0.25 * Math.sin(this.time.now * 0.008);
      this.gaugeFill.fillStyle(color, alpha);
      this.gaugeFill.fillRoundedRect(gx, gy - 2, gw, gh + 4, 4);
    }

    this.gaugeLabel.setText(label).setColor(
      holdMs < HOLD_THRESHOLDS.ATTACK ? '#4488ff' :
      holdMs < HOLD_THRESHOLDS.JUMP   ? '#44ff88' : '#ffaa22',
    );
  }

  update(_time: number, delta: number): void {
    if (!this.gameActive) return;

    this.inputSystem.update();

    const dt = delta;

    // Scroll parallax layers
    const scrollSpeed = KNIGHT.RUN_SPEED;
    this.mountainLayer.tilePositionX += scrollSpeed * 0.15 * (dt / 1000);
    this.hillLayer.tilePositionX     += scrollSpeed * 0.3  * (dt / 1000);
    this.groundLayer.tilePositionX   += scrollSpeed        * (dt / 1000);

    // Distance in meters
    this.distance += (scrollSpeed * dt) / 100000;

    // Knight update
    this.knight.update(dt);

    // Keep knight at fixed screen X by scrolling camera
    this.cameras.main.scrollX = this.knight.sprite.x - KNIGHT_FIXED_X;

    // Enemies
    this.spawner.update(dt, this.distance * 100);
    const enemies = this.spawner.getEnemies();

    const knightBounds = new Phaser.Geom.Rectangle(
      this.knight.sprite.x - 12,
      this.knight.sprite.y - 26,
      24, 52,
    );

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const eb = enemy.getBounds();

      // Attack hitbox vs enemy
      if (this.knight.isAttacking && Phaser.Geom.Rectangle.Overlaps(this.knight.attackBox, eb)) {
        if (enemy.canBeKilledBy('attack')) {
          this.killEnemy(enemy);
          continue;
        }
      }

      // Dash state — kill dash-killable enemies, pass through others
      if (this.knight.state === 'dash' && Phaser.Geom.Rectangle.Overlaps(knightBounds, eb)) {
        if (enemy.canBeKilledBy('dash')) {
          this.killEnemy(enemy);
        }
        // Always continue during dash (invincible)
        continue;
      }

      // Normal collision = death
      if (!this.knight.isInvincible && Phaser.Geom.Rectangle.Overlaps(knightBounds, eb)) {
        this.triggerDeath();
        return;
      }
    }

    // Combo tick
    this.combo.tick(this.time.now);

    // HUD update
    this.distText.setText(`${Math.floor(this.distance * 100)} m`);
    this.scoreText.setText(`SCORE  ${this.combo.getScore().toLocaleString()}`);
    const c = this.combo.getCombo();
    if (c > 1) {
      this.comboText.setText(`COMBO x${c}`);
      this.maxCombo = Math.max(this.maxCombo, c);
    } else {
      this.comboText.setText('');
    }

    this.updateGauge(this.inputSystem.holdMs);

    // Fall off world
    if (this.knight.sprite.y > GAME_HEIGHT + 100) {
      this.triggerDeath();
    }
  }

  private killEnemy(enemy: Enemy): void {
    const result = this.combo.registerKill(this.time.now);
    this.maxCombo = Math.max(this.maxCombo, result.combo);
    enemy.kill();

    // Floating score text at screen position
    const screenX = enemy.container.x - this.cameras.main.scrollX;
    const screenY = enemy.container.y - this.cameras.main.scrollY;
    const ft = this.add.text(screenX, screenY - 20, `+${result.points}`, {
      fontSize: result.combo > 2 ? '22px' : '16px',
      color: result.combo > 2 ? '#ffdd44' : '#ffffff',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(20).setScrollFactor(0);

    this.tweens.add({
      targets: ft,
      y: screenY - 70,
      alpha: 0,
      duration: 900,
      ease: 'Power2',
      onComplete: () => ft.destroy(),
    });

    this.cameras.main.shake(80, 0.006);
  }

  private triggerDeath(): void {
    if (!this.gameActive) return;
    this.gameActive = false;

    this.knight.die();

    // Slow motion
    this.tweens.add({
      targets: {},
      duration: 300,
      onUpdate: (tween) => {
        this.time.timeScale = 1 - tween.progress * 0.75;
        this.physics.world.timeScale = 1 / Math.max(this.time.timeScale, 0.01);
      },
      onComplete: () => {
        this.time.timeScale = 1;
        this.physics.world.timeScale = 1;
      },
    });

    this.cameras.main.shake(300, 0.018);
    this.cameras.main.flash(200, 255, 80, 80);

    this.time.delayedCall(1200, () => {
      this.inputSystem.destroy();
      this.scene.start('GameOverScene', {
        score: this.combo.getScore(),
        distance: Math.floor(this.distance * 100),
        combo: this.maxCombo,
      });
    });
  }

  private startBgm(): void {
    try {
      const ctx = new AudioContext();
      const notes = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63];
      let step = 0;

      const playNote = (): void => {
        if (!this.gameActive) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = notes[step % notes.length] * (step % 8 < 4 ? 1 : 1.5);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        step++;
        this.time.delayedCall(220, playNote);
      };

      this.time.delayedCall(400, playNote);
    } catch (_e) {
      // Audio unavailable — silent mode
    }
  }

  shutdown(): void {
    this.inputSystem?.destroy();
    this.spawner?.reset();
  }
}
