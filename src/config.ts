import AnimatedTiles from 'phaser-animated-tiles/src/plugin/main';
import { BootScene } from './scenes/boot-scene';
import { GameScene } from './scenes/game-scene';
import { HUDScene } from './scenes/hud-scene';
import { MenuScene } from './scenes/menu-scene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Super Mario Land',
  url: 'https://github.com/digitsensitive/phaser3-typescript',
  version: '2.0',
  width: 160,
  height: 144,
  zoom: 5,
  type: Phaser.AUTO,
  parent: 'game',
  scene: [BootScene, MenuScene, HUDScene, GameScene],
  input: {
    keyboard: true
  },
  plugins: {
    scene: [
      {
        key: 'AnimatedTiles',
        plugin: AnimatedTiles,
        mapping: 'animatedTiles'
      }
    ]
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 475 },
      // debug: true
    }
  },
  backgroundColor: '#27145d',
  render: { pixelArt: true, antialias: false }
};
