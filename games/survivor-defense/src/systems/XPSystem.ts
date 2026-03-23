import Phaser from 'phaser';
import { XP_CONFIG } from '../config';
import type { Player } from '../entities/Player';
import type { GameScene } from '../scenes/GameScene';

export class XPSystem {
  private scene: GameScene;
  private player: Player;

  constructor(scene: GameScene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  spawnGem(x: number, y: number, value: number = 1): void {
    const gem = this.scene.add.graphics();
    gem.fillStyle(XP_CONFIG.gemColor, 1);
    const r = XP_CONFIG.gemRadius;
    gem.fillPoints([
      new Phaser.Geom.Point(0, -r),
      new Phaser.Geom.Point(r * 0.7, 0),
      new Phaser.Geom.Point(0, r),
      new Phaser.Geom.Point(-r * 0.7, 0),
    ], true);

    const container = this.scene.add.container(x, y, [gem]);
    this.scene.physics.add.existing(container);
    (container as any).xpValue = value;
    this.scene.xpGems.add(container);
  }

  update(): void {
    for (const obj of this.scene.xpGems.getChildren()) {
      const gem = obj as Phaser.GameObjects.Container;
      if (!gem.active) continue;

      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, gem.x, gem.y
      );

      if (dist < this.player.magnetRange) {
        // Pull toward player
        this.scene.physics.moveToObject(gem, this.player, 300);

        if (dist < 20) {
          this.collectGem(gem);
        }
      }
    }
  }

  private collectGem(gem: Phaser.GameObjects.Container): void {
    const value = (gem as any).xpValue || 1;
    this.player.xp += value;

    const required = XP_CONFIG.baseRequired * this.player.level;
    if (this.player.xp >= required) {
      this.player.xp -= required;
      this.player.level++;
      this.scene.events.emit('levelup');
    }

    gem.destroy();
  }
}
