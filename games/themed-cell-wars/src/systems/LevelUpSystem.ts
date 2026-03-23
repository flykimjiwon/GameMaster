import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { LightningWeapon } from '../weapons/LightningWeapon';
import type { GameScene } from '../scenes/GameScene';

export interface LevelUpOption {
  id: string;
  name: string;
  description: string;
  color: number;
  icon: string;
  apply: () => void;
  canOffer: () => boolean;
}

export class LevelUpSystem {
  private scene: GameScene;
  private container: Phaser.GameObjects.Container | null = null;
  private options: LevelUpOption[] = [];
  public isActive: boolean = false;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.buildOptions();
  }

  private buildOptions(): void {
    this.options = [
      {
        id: 'orb_add',
        name: 'Orb +1',
        description: 'Add rotating orb',
        color: 0xffffff,
        icon: 'O',
        apply: () => {
          this.scene.orbWeapon.addOrb();
        },
        canOffer: () => this.scene.orbWeapon.orbCount < 5,
      },
      {
        id: 'lightning_get',
        name: 'Lightning',
        description: 'Strike random enemy',
        color: 0xffff00,
        icon: 'Z',
        apply: () => {
          if (!this.scene.lightningWeapon) {
            this.scene.lightningWeapon = new LightningWeapon(this.scene, this.scene.player);
          } else {
            this.scene.lightningWeapon.addTarget();
          }
        },
        canOffer: () => !this.scene.lightningWeapon || this.scene.lightningWeapon.targetCount < 3,
      },
      {
        id: 'heal',
        name: 'Heal +20',
        description: 'Restore 20 HP',
        color: 0xff4444,
        icon: '+',
        apply: () => this.scene.player.heal(20),
        canOffer: () => this.scene.player.hp < this.scene.player.maxHp,
      },
      {
        id: 'speed',
        name: 'Speed +10%',
        description: 'Move faster',
        color: 0x44ff44,
        icon: '>',
        apply: () => { this.scene.player.moveSpeed *= 1.1; },
        canOffer: () => true,
      },
      {
        id: 'magnet',
        name: 'Magnet +30%',
        description: 'Wider XP pickup',
        color: 0x4488ff,
        icon: 'M',
        apply: () => { this.scene.player.magnetRange *= 1.3; },
        canOffer: () => true,
      },
    ];
  }

  show(): void {
    this.isActive = true;
    this.scene.physics.pause();

    const uiScene = this.scene.scene.get('UIScene');

    const overlay = uiScene.add.rectangle(
      GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2,
      GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT, 0x000000, 0.6
    );

    const title = uiScene.add.text(GAME_CONFIG.WIDTH / 2, 100, 'LEVEL UP!', {
      fontSize: '36px', color: '#ffdd44', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Flash
    this.scene.cameras.main.flash(200, 255, 255, 100);

    const available = this.options.filter(o => o.canOffer());
    Phaser.Utils.Array.Shuffle(available);
    const choices = available.slice(0, 3);

    const cards: Phaser.GameObjects.Container[] = [];
    const cardWidth = 180;
    const cardHeight = 220;
    const gap = 20;
    const totalWidth = choices.length * cardWidth + (choices.length - 1) * gap;
    const startX = (GAME_CONFIG.WIDTH - totalWidth) / 2 + cardWidth / 2;

    choices.forEach((option, i) => {
      const cx = startX + i * (cardWidth + gap);
      const cy = GAME_CONFIG.HEIGHT / 2 + 20;

      const card = uiScene.add.container(cx, cy);

      const bg = uiScene.add.rectangle(0, 0, cardWidth, cardHeight, 0x1a1a2e, 1)
        .setStrokeStyle(2, option.color);

      const icon = uiScene.add.text(0, -60, option.icon, {
        fontSize: '40px', color: `#${option.color.toString(16).padStart(6, '0')}`,
        fontFamily: 'monospace', fontStyle: 'bold',
      }).setOrigin(0.5);

      const name = uiScene.add.text(0, -10, option.name, {
        fontSize: '16px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
      }).setOrigin(0.5);

      const desc = uiScene.add.text(0, 20, option.description, {
        fontSize: '12px', color: '#aaaaaa', fontFamily: 'monospace',
      }).setOrigin(0.5);

      card.add([bg, icon, name, desc]);
      bg.setInteractive({ useHandCursor: true });

      bg.on('pointerover', () => bg.setFillStyle(0x2a2a4e));
      bg.on('pointerout', () => bg.setFillStyle(0x1a1a2e));
      bg.on('pointerdown', () => {
        option.apply();
        this.hide(overlay, title, cards);
      });

      cards.push(card);
    });

    this.container = uiScene.add.container(0, 0, [overlay, title, ...cards]);
  }

  private hide(
    overlay: Phaser.GameObjects.Rectangle,
    title: Phaser.GameObjects.Text,
    cards: Phaser.GameObjects.Container[]
  ): void {
    overlay.destroy();
    title.destroy();
    cards.forEach(c => c.destroy());
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.isActive = false;
    this.scene.physics.resume();
  }
}
