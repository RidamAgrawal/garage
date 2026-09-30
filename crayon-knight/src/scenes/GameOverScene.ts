import Phaser from 'phaser';
import { SceneKeys } from '@/constants/SceneKeys';

/**
 * Game Over Scene
 * Jab player mar jata hai tab yeh scene dikhaya jata hai.
 */
export class GameOverScene extends Phaser.Scene {
  private gold: number = 0;

  constructor() {
    super({ key: SceneKeys.GAME_OVER });
  }

  init(data: { gold?: number }) {
    this.gold = data.gold || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Semi-transparent overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Main death text
    this.add.text(width / 2, height / 2 - 50, 'YOU DIED', {
      fontSize: '64px',
      fontFamily: 'monospace',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Stats
    this.add.text(width / 2, height / 2 + 30, `Gold Collected: ${this.gold}`, {
      fontSize: '24px',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Restart prompt (blinking)
    const retryText = this.add.text(width / 2, height / 2 + 100, 'Press SPACE to Retry', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: retryText,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Listen for restart
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.stop(SceneKeys.GAME_OVER);
      this.scene.start(SceneKeys.GAME);
    });
  }
}
