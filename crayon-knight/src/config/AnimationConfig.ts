import Phaser from "phaser";
import { AnimationAssets } from "@/constants/AssetKeys";

export interface AnimConfig {
  key: string;
  frames: Phaser.Types.Animations.AnimationFrame[];
  frameRate: number;
  repeat: number;
}

/**
 * Saari animations ek single file me
 */
export function registerAllAnimations(scene: Phaser.Scene): void {
  for (const animKey in AnimationAssets) {
    createSceneAnim(scene, {
      key: animKey,
      frames: scene.anims.generateFrameNumbers(animKey, {
        start: AnimationAssets[animKey].start,
        end: AnimationAssets[animKey].end,
      }),
      frameRate: AnimationAssets[animKey].frameRate,
      repeat: AnimationAssets[animKey].repeat,
    });
  }
}

function createSceneAnim(scene: Phaser.Scene, animConfig: AnimConfig) {
  return scene.anims.create(animConfig);
}
