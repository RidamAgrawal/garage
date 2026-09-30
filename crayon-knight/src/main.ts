import Phaser from 'phaser';
import { GameConfig } from '@/config/GameConfig';
import { BootScene } from '@/scenes/BootScene';
import { PreloadScene } from '@/scenes/PreloadScene';
import { MainMenuScene } from '@/scenes/MainMenuScene';
import { GameScene } from '@/scenes/GameScene';
import { UIScene } from '@/scenes/UIScene';
import { GameOverScene } from '@/scenes/GameOverScene';

// Scene list register karo (order matters for first scene)
const config: Phaser.Types.Core.GameConfig = {
  ...GameConfig,
  scene: [BootScene, PreloadScene, MainMenuScene, GameScene, UIScene, GameOverScene],
};

// Game start! 🎮
const game = new Phaser.Game(config);

export default game;
