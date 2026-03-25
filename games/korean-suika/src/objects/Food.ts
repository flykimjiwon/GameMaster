import Phaser from 'phaser';
import { FOODS, type FoodDef } from '../config/foods';

export class Food {
  scene: Phaser.Scene;
  body: MatterJS.BodyType;
  graphics: Phaser.GameObjects.Container;
  level: number;
  def: FoodDef;
  merged = false;
  dropTime = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, level: number, isStatic = false) {
    this.scene = scene;
    this.level = level;
    this.def = FOODS[level];

    const r = this.def.radius;

    // Matter.js body
    this.body = scene.matter.add.circle(x, y, r, {
      restitution: 0.3,
      friction: 0.5,
      density: 0.001 * (level + 1),
      isStatic,
      label: `food_${level}`,
    });

    // Visual container
    this.graphics = scene.add.container(x, y);

    // Circle background
    const circle = scene.add.graphics();
    circle.fillStyle(this.def.color, 1);
    circle.fillCircle(0, 0, r);
    circle.lineStyle(2, 0xffffff, 0.3);
    circle.strokeCircle(0, 0, r);

    // Inner highlight
    const highlight = scene.add.graphics();
    highlight.fillStyle(0xffffff, 0.15);
    highlight.fillCircle(-r * 0.2, -r * 0.2, r * 0.5);

    // Emoji text
    const emoji = scene.add.text(0, 0, this.def.emoji, {
      fontSize: `${Math.max(16, r * 0.8)}px`,
    }).setOrigin(0.5);

    // Name text (small)
    const name = scene.add.text(0, r * 0.55, this.def.name, {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.graphics.add([circle, highlight, emoji, name]);
    this.graphics.setDepth(level);

    // Store reference on body
    (this.body as Record<string, unknown>)['foodRef'] = this;
  }

  update() {
    if (this.merged) return;
    this.graphics.setPosition(this.body.position.x, this.body.position.y);
    this.graphics.setRotation(this.body.angle);
  }

  setStatic(val: boolean) {
    this.scene.matter.body.setStatic(this.body, val);
  }

  setPosition(x: number, y: number) {
    this.scene.matter.body.setPosition(this.body, { x, y });
    this.graphics.setPosition(x, y);
  }

  destroy() {
    this.merged = true;
    this.scene.matter.world.remove(this.body);
    this.graphics.destroy();
  }

  playMergeEffect() {
    const x = this.body.position.x;
    const y = this.body.position.y;

    // Scale pop
    const pop = this.scene.add.circle(x, y, this.def.radius, 0xffffff, 0.6);
    this.scene.tweens.add({
      targets: pop,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => pop.destroy(),
    });

    // Particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const particle = this.scene.add.circle(x, y, 4, this.def.color, 1);
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 60,
        y: y + Math.sin(angle) * 60,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }
}
