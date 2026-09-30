import Phaser from 'phaser';
import { SceneKeys } from '@/constants/SceneKeys';
import { HealthBar } from '@/ui/HealthBar';
import { GoldCounter } from '@/ui/GoldCounter';

/**
 * UI Scene
 * Heads Up Display (HUD) for the game. Runs in parallel.
 * EventBus ke through communication karta hai.
 */
export class UIScene extends Phaser.Scene {
  private healthBar!: HealthBar;
  private goldCounter!: GoldCounter;

  constructor() {
    super({ key: SceneKeys.UI });
  }

  create() {
    // Create UI components at fixed positions
    this.healthBar = new HealthBar(this, 20, 20);
    this.goldCounter = new GoldCounter(this, 20, 50);

    // UI scene ka camera game world ko follow nahi karega
    // Yeh fixed position pe rahega — HUD style
    this.cameras.main.setScroll(0, 0);

    this.events.once('shutdown', this.shutdown, this);
  }

  shutdown() {
    // Memory leak rokne ke liye destroy method call karte hain
    if (this.healthBar) this.healthBar.destroy();
    if (this.goldCounter) this.goldCounter.destroy();
  }
}
