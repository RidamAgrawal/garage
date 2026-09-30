import Phaser from 'phaser';
import { SceneKeys } from '@/constants/SceneKeys';

/**
 * Main Menu Scene
 * Title screen jahan se user game start karta hai.
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.MAIN_MENU });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(width / 2, height / 2 - 100, 'CRAYON KNIGHT', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 - 40, 'A Rogue-Lite Dungeon Crawler', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);

    // Start text (blinking)
    const startText = this.add.text(width / 2, height / 2 + 50, 'Press SPACE to Start', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Controls hint
    this.add.text(width / 2, height - 50, 'WASD to Move | SPACE to Attack', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Input listener to transition
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start(SceneKeys.GAME);
    });
  }
}
