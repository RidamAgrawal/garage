import Phaser from 'phaser';

/**
 * Static utility for rendering floating text in the game world.
 * Typical use case: Damage numbers or gold pickups.
 * Visual feedback ke liye yeh class ek clean aur reusable abstraction provide karti hai.
 */
export class FloatingText {
  /**
   * Shows a floating text that moves up and fades out.
   * @param scene The active Phaser scene.
   * @param x The starting world X coordinate.
   * @param y The starting world Y coordinate.
   * @param text The text to display.
   * @param color The hex color code or string for the text (default: '#ffffff').
   */
  public static show(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    text: string, 
    color: string = '#ffffff'
  ): void {
    // Create Phaser.GameObjects.Text at position
    const textObj = scene.add.text(x, y, text, {
      fontSize: '16px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    });

    // Center origin to anchor properly
    textObj.setOrigin(0.5, 0.5);

    // Tween: move up 30px, fade alpha to 0, duration 800ms, ease 'Power2'
    scene.tweens.add({
      targets: textObj,
      y: y - 30,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        // Destroy text upon completion to free memory
        textObj.destroy();
      }
    });
  }
}
