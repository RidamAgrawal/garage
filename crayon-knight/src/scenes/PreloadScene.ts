import Phaser from "phaser";
import { SceneKeys } from "@/constants/SceneKeys";
import {
  AnimationAssets,
  TILESET_IMAGES,
  TILEMAPS,
  BANNER_FRAMES,
} from "@/constants/AssetKeys";
import { registerAllAnimations } from "@/config/AnimationConfig";

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

    const loadingText = this.add
      .text(width / 2, height / 2 - 50, "0%", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      loadingText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    for (const assetKey in AnimationAssets) {
      const assetData = AnimationAssets[assetKey];
      this.loadSpriteSheet(
        assetKey,
        assetData.path,
        assetData.frameWidth,
        assetData.frameHeight,
      );
    }
    this.loadTileSetImages();
    this.loadTileMapJson();
  }

  create() {
    registerAllAnimations(this);
    document.fonts.ready.then(() => {
      this.scene.start(SceneKeys.MAIN_MENU);
    });
  }

  private loadSpriteSheet(
    key: string,
    fileName: string,
    frameWidth: number,
    frameHeight: number,
  ): void {
    this.load.spritesheet(key, fileName, {
      frameWidth,
      frameHeight,
    });
  }

  /**
   * Tileset images load karo — TILESET_IMAGES registry se loop karke
   * Naya tileset add karna ho toh bas AssetKeys.ts mein entry add karo!
   */
  private loadTileSetImages(): void {
    for (const tileset of TILESET_IMAGES) {
      this.load.image(tileset.key, tileset.path);
    }
    for (let i = 1; i <= BANNER_FRAMES; i++) {
      const n = String(i).padStart(2, "0");
      this.load.image(
        `banner_${n}`,
        `assets/UI Elements/Banners/output/composite_${n}.png`,
      );
    }
  }

  /**
   * Tilemap JSON load karo — TILEMAPS registry se loop karke
   */
  private loadTileMapJson(): void {
    for (const tilemap of TILEMAPS) {
      this.load.tilemapTiledJSON(tilemap.key, tilemap.path);
    }
  }
}
