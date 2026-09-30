import Phaser from 'phaser';
import { SceneKeys } from '@/constants/SceneKeys';

/**
 * Boot Scene
 * Minimal bootstrap scene to show loading text before Preload.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.BOOT });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Chhote setup ke baad turant Preload scene pe transition
    this.scene.start(SceneKeys.PRELOAD);
  }
}
