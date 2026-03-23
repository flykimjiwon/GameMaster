import { Tower } from './Tower';
import { TowerType, GAME_WIDTH, PANEL_Y, PANEL_HEIGHT } from '../config';
import { BuildScene } from '../scenes/BuildScene';

const TOWER_TYPES: TowerType[] = ['archer', 'cannon', 'slow'];

export class TowerFactory {
  constructor(private scene: BuildScene) {}

  createRandomTower(x: number, y: number): Tower {
    const type = TOWER_TYPES[Math.floor(Math.random() * TOWER_TYPES.length)];
    return new Tower(this.scene, x, y, type, 1);
  }

  spawnInitialTowers(count: number): void {
    const panelCenterY = PANEL_Y + PANEL_HEIGHT / 2;
    const spacing = 80;
    const startX = (GAME_WIDTH - (count - 1) * spacing) / 2;

    for (let i = 0; i < count; i++) {
      const x = startX + i * spacing;
      const tower = this.createRandomTower(x, panelCenterY);
      this.scene.panelTowers.push(tower);
      this.scene.dragDropSystem.makeDraggable(tower);
    }
  }

  createTower(x: number, y: number, type: TowerType, tier: number): Tower {
    const tower = new Tower(this.scene, x, y, type, tier);
    return tower;
  }
}
