import Phaser from "phaser";
import { MatchmakingScene } from "./scenes/MatchmakingScene";
import { PlacementScene } from "./scenes/PlacementScene";
import { BattleScene } from "./scenes/BattleScene";
import { ResultScene } from "./scenes/ResultScene";
import { GAME_WIDTH, GAME_HEIGHT } from "./config/balance";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#0a0a1a",
  scene: [MatchmakingScene, PlacementScene, BattleScene, ResultScene],
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
