import Phaser from 'phaser';
import { SceneKeys } from '@/constants/SceneKeys';
import { AssetKeys } from '@/constants/AssetKeys';

/**
 * Preload Scene
 * Yahan saare assets load hote hain aur loading bar dikhaya jata hai.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.PRELOAD });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading Bar Graphics
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, '0%', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      loadingText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    this.generatePlaceholderTextures();
  }

  create() {
    this.scene.start(SceneKeys.MAIN_MENU);
  }

  /**
   * Programmatic texture generation for MVP since real assets aren't available.
   * Graphics ka use karke basic shapes ko textures mein convert karte hain.
   */
  private generatePlaceholderTextures() {
    const graphics = this.add.graphics({ x: 0, y: 0 });
    graphics.setVisible(false);
    
    // Player: 32x32 blue rect with a white triangle pointer (facing right)
    graphics.fillStyle(0x0000ff);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0xffffff);
    graphics.fillTriangle(32, 16, 20, 8, 20, 24);
    graphics.generateTexture(AssetKeys.PLAYER, 32, 32);
    graphics.clear();

    // Skeleton: 32x32 dark red rect
    graphics.fillStyle(0x8b0000);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture(AssetKeys.SKELETON, 32, 32);
    graphics.clear();

    // Slime: 32x32 green circle
    graphics.fillStyle(0x00ff00);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture(AssetKeys.SLIME, 32, 32);
    graphics.clear();

    // Goblin: 32x32 purple rect
    graphics.fillStyle(0x800080);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture(AssetKeys.GOBLIN, 32, 32);
    graphics.clear();

    // Tileset: 64x32 texture containing both (0 = floor/brown, 1 = wall/grey)
    // Map index 0 is at x:0, map index 1 is at x:32
    graphics.fillStyle(0x8B4513); // Brown floor
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x808080); // Grey wall
    graphics.fillRect(32, 0, 32, 32);
    graphics.generateTexture(AssetKeys.DUNGEON_TILES, 64, 32);
    // Note: TilemapManager expects 'dungeon-tiles' name, so let's also map it to that string just in case
    graphics.generateTexture('dungeon-tiles', 64, 32);
    graphics.clear();

    // Heart sprites: 16x16
    // Full Heart
    graphics.fillStyle(0xff0000);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(AssetKeys.HEART_FULL, 16, 16);
    graphics.clear();

    // Half Heart
    graphics.fillStyle(0xff0000);
    graphics.beginPath();
    graphics.arc(8, 8, 8, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(270), false);
    graphics.fillPath();
    graphics.lineStyle(2, 0x888888, 1);
    graphics.beginPath();
    graphics.arc(8, 8, 8, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(90), false);
    graphics.strokePath();
    graphics.generateTexture(AssetKeys.HEART_HALF, 16, 16);
    graphics.clear();

    // Empty Heart
    graphics.lineStyle(2, 0x888888, 1);
    graphics.strokeCircle(8, 8, 8);
    graphics.generateTexture(AssetKeys.HEART_EMPTY, 16, 16);
    graphics.clear();

    // Gold Icon
    graphics.fillStyle(0xffd700);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture(AssetKeys.GOLD_ICON, 16, 16);
    graphics.clear();
  }

  private loadSpriteSheet(key: string, fileName: string, frameWidth: number, frameHeight: number): void {
    this.load.spritesheet(key, `assets/spritesheets/${fileName}`, {
      frameWidth,
      frameHeight,
    });
  }
}
