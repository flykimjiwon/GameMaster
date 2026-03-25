import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { DungeonScene } from './scenes/DungeonScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a0a2e',
  parent: 'game-container',
  scene: [MenuScene, DungeonScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
};

const game = new Phaser.Game(config);

export default game;
