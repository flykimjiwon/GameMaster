import Phaser from 'phaser';
import { Food } from '../objects/Food';
import {
  FOODS,
  DROP_FOODS_MAX_LEVEL,
  GAME_WIDTH,
  CONTAINER_X,
  CONTAINER_WIDTH,
  CONTAINER_HEIGHT,
  CONTAINER_TOP,
  CONTAINER_BOTTOM,
  WALL_THICKNESS,
  DEADLINE_Y,
} from '../config/foods';

export class GameScene extends Phaser.Scene {
  foods: Food[] = [];
  currentFood: Food | null = null;
  nextLevel = 0;
  score = 0;
  bestScore = 0;
  combo = 0;
  comboTimer = 0;
  gameOver = false;
  canDrop = true;
  dropCooldown = 0;
  deadlineTimer = 0;
  pointerX = CONTAINER_X;

  // UI refs (will be created in UIScene)
  private mergeSound: { play: () => void } | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.foods = [];
    this.score = 0;
    this.combo = 0;
    this.gameOver = false;
    this.canDrop = true;
    this.dropCooldown = 0;
    this.deadlineTimer = 0;

    // Load best score
    const saved = localStorage.getItem('suika_best');
    this.bestScore = saved ? parseInt(saved, 10) : 0;

    this.createContainer();
    this.createDeadline();
    this.setupCollision();
    this.setupInput();
    this.prepareNext();

    // Launch UI scene on top
    this.scene.launch('UIScene', { gameScene: this });

    // Simple merge sound using web audio
    this.mergeSound = this.createMergeSound();
  }

  createContainer() {
    const leftX = CONTAINER_X - CONTAINER_WIDTH / 2;
    const rightX = CONTAINER_X + CONTAINER_WIDTH / 2;
    const t = WALL_THICKNESS;

    // Bottom wall
    this.matter.add.rectangle(CONTAINER_X, CONTAINER_BOTTOM + t / 2, CONTAINER_WIDTH + t * 2, t, {
      isStatic: true,
      label: 'wall',
      friction: 0.8,
    });

    // Left wall
    this.matter.add.rectangle(leftX - t / 2, CONTAINER_TOP + CONTAINER_HEIGHT / 2, t, CONTAINER_HEIGHT + t, {
      isStatic: true,
      label: 'wall',
    });

    // Right wall
    this.matter.add.rectangle(rightX + t / 2, CONTAINER_TOP + CONTAINER_HEIGHT / 2, t, CONTAINER_HEIGHT + t, {
      isStatic: true,
      label: 'wall',
    });

    // Draw container visuals
    const gfx = this.add.graphics();

    // Container background
    gfx.fillStyle(0x1a0a2e, 0.8);
    gfx.fillRoundedRect(leftX - t, CONTAINER_TOP, CONTAINER_WIDTH + t * 2, CONTAINER_HEIGHT + t, 8);

    // Container border
    gfx.lineStyle(3, 0x6c5ce7, 0.8);
    gfx.strokeRoundedRect(leftX - t, CONTAINER_TOP, CONTAINER_WIDTH + t * 2, CONTAINER_HEIGHT + t, 8);

    // Glass effect
    gfx.fillStyle(0xffffff, 0.03);
    gfx.fillRoundedRect(leftX - t + 4, CONTAINER_TOP + 4, (CONTAINER_WIDTH + t * 2) / 3, CONTAINER_HEIGHT - 8, 6);

    gfx.setDepth(-1);
  }

  createDeadline() {
    const gfx = this.add.graphics();
    gfx.lineStyle(2, 0xff4444, 0.5);

    const leftX = CONTAINER_X - CONTAINER_WIDTH / 2;
    const rightX = CONTAINER_X + CONTAINER_WIDTH / 2;
    const dashLen = 8;
    const gapLen = 6;

    for (let x = leftX; x < rightX; x += dashLen + gapLen) {
      gfx.moveTo(x, DEADLINE_Y);
      gfx.lineTo(Math.min(x + dashLen, rightX), DEADLINE_Y);
    }
    gfx.strokePath();
    gfx.setDepth(10);

    // "DANGER" text
    this.add.text(CONTAINER_X, DEADLINE_Y - 12, 'DANGER', {
      fontSize: '10px',
      color: '#ff4444',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setAlpha(0.5).setDepth(10);
  }

  setupCollision() {
    this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      for (const pair of event.pairs) {
        const foodA = (pair.bodyA as Record<string, unknown>)['foodRef'] as Food | undefined;
        const foodB = (pair.bodyB as Record<string, unknown>)['foodRef'] as Food | undefined;

        if (!foodA || !foodB) continue;
        if (foodA.merged || foodB.merged) continue;
        if (foodA.level !== foodB.level) continue;
        if (foodA.level >= FOODS.length - 1) continue; // max level, no merge

        this.mergeFood(foodA, foodB);
      }
    });
  }

  mergeFood(a: Food, b: Food) {
    const newLevel = a.level + 1;
    const midX = (a.body.position.x + b.body.position.x) / 2;
    const midY = (a.body.position.y + b.body.position.y) / 2;

    // Play effects before destroying
    a.playMergeEffect();

    // Destroy old
    a.destroy();
    b.destroy();

    // Remove from array
    this.foods = this.foods.filter(f => f !== a && f !== b);

    // Create new merged food
    const newFood = new Food(this, midX, midY, newLevel);
    newFood.dropTime = this.time.now;
    this.foods.push(newFood);

    // Score
    const def = FOODS[newLevel];
    this.combo++;
    this.comboTimer = 1000;
    const comboMultiplier = Math.min(this.combo, 5);
    this.score += def.score * comboMultiplier;

    // Bonus for max level
    if (newLevel === FOODS.length - 1) {
      this.score += 100;
      this.showBonusText(midX, midY, '한상차림! +100');
    } else if (comboMultiplier > 1) {
      this.showBonusText(midX, midY, `x${comboMultiplier} COMBO!`);
    }

    // Sound
    this.mergeSound?.play();

    // Camera shake
    this.cameras.main.shake(100, 0.005 * newLevel);

    // Scale pop on new food
    if (newFood.graphics) {
      newFood.graphics.setScale(0.3);
      this.tweens.add({
        targets: newFood.graphics,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
      });
    }
  }

  showBonusText(x: number, y: number, text: string) {
    const txt = this.add.text(x, y, text, {
      fontSize: '18px',
      color: '#ffd700',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: txt,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  setupInput() {
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver) return;
      const leftLimit = CONTAINER_X - CONTAINER_WIDTH / 2 + 30;
      const rightLimit = CONTAINER_X + CONTAINER_WIDTH / 2 - 30;
      this.pointerX = Phaser.Math.Clamp(pointer.x, leftLimit, rightLimit);

      if (this.currentFood) {
        this.currentFood.setPosition(this.pointerX, CONTAINER_TOP - 20);
      }
    });

    this.input.on('pointerup', () => {
      if (this.gameOver || !this.canDrop || !this.currentFood) return;
      this.dropFood();
    });
  }

  prepareNext() {
    this.nextLevel = Phaser.Math.Between(0, DROP_FOODS_MAX_LEVEL);
    this.spawnPreview();
  }

  spawnPreview() {
    if (this.currentFood) {
      this.currentFood.destroy();
    }
    this.currentFood = new Food(this, this.pointerX, CONTAINER_TOP - 20, this.nextLevel, true);

    // Guide line
    this.updateGuideLine();
  }

  private guideLine: Phaser.GameObjects.Graphics | null = null;

  updateGuideLine() {
    if (this.guideLine) this.guideLine.destroy();
    if (!this.currentFood || this.gameOver) return;

    this.guideLine = this.add.graphics();
    this.guideLine.lineStyle(1, 0xffffff, 0.15);
    this.guideLine.moveTo(this.pointerX, CONTAINER_TOP);
    this.guideLine.lineTo(this.pointerX, CONTAINER_BOTTOM);
    this.guideLine.strokePath();
    this.guideLine.setDepth(0);
  }

  dropFood() {
    if (!this.currentFood) return;

    this.canDrop = false;
    this.dropCooldown = 500;
    this.currentFood.setStatic(false);
    this.currentFood.dropTime = this.time.now;
    this.foods.push(this.currentFood);
    this.currentFood = null;

    if (this.guideLine) {
      this.guideLine.destroy();
      this.guideLine = null;
    }

    // Prepare next after cooldown
    this.time.delayedCall(500, () => {
      if (this.gameOver) return;
      this.canDrop = true;
      this.prepareNext();
    });
  }

  checkGameOver(delta: number) {
    let anyAboveLine = false;

    for (const food of this.foods) {
      if (food.merged) continue;
      // Skip recently dropped foods (give 1.5s grace)
      if (this.time.now - food.dropTime < 1500) continue;

      const topY = food.body.position.y - food.def.radius;
      if (topY < DEADLINE_Y) {
        anyAboveLine = true;
        break;
      }
    }

    if (anyAboveLine) {
      this.deadlineTimer += delta;
      if (this.deadlineTimer > 2000) {
        this.triggerGameOver();
      }
    } else {
      this.deadlineTimer = 0;
    }
  }

  triggerGameOver() {
    this.gameOver = true;

    // Save best score
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('suika_best', String(this.bestScore));
    }

    // Dim screen
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, this.scale.height / 2,
      GAME_WIDTH, this.scale.height,
      0x000000, 0.6
    ).setDepth(200);
    overlay.setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 500 });

    // Game Over text
    const goText = this.add.text(GAME_WIDTH / 2, 280, 'GAME OVER', {
      fontSize: '36px',
      color: '#ff4444',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(201).setAlpha(0);

    const scoreText = this.add.text(GAME_WIDTH / 2, 330, `점수: ${this.score}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(201).setAlpha(0);

    const bestText = this.add.text(GAME_WIDTH / 2, 365, `최고: ${this.bestScore}`, {
      fontSize: '18px',
      color: '#ffd700',
      fontFamily: 'sans-serif',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(201).setAlpha(0);

    // Retry button
    const retryBg = this.add.rectangle(GAME_WIDTH / 2, 420, 160, 50, 0x6c5ce7, 1)
      .setDepth(201).setAlpha(0).setInteractive({ useHandCursor: true });
    const retryText = this.add.text(GAME_WIDTH / 2, 420, '다시하기', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(202).setAlpha(0);

    retryBg.on('pointerover', () => retryBg.setFillStyle(0x7c6cf7));
    retryBg.on('pointerout', () => retryBg.setFillStyle(0x6c5ce7));
    retryBg.on('pointerup', () => {
      this.scene.stop('UIScene');
      this.scene.restart();
    });

    // Animate in
    this.tweens.add({ targets: [goText, scoreText, bestText, retryBg, retryText], alpha: 1, duration: 500, delay: 300 });
  }

  createMergeSound(): { play: () => void } {
    return {
      play: () => {
        try {
          const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AudioCtor();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(400 + this.combo * 100, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800 + this.combo * 100, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.2);
        } catch {
          // audio not available
        }
      }
    };
  }

  update(_time: number, delta: number) {
    if (this.gameOver) return;

    // Update food positions
    for (const food of this.foods) {
      food.update();
    }

    // Update guide line
    if (this.currentFood) {
      this.updateGuideLine();
    }

    // Combo timeout
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

    // Check game over
    this.checkGameOver(delta);

    // Clean up merged foods
    this.foods = this.foods.filter(f => !f.merged);
  }
}
