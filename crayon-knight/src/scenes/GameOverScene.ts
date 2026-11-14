import Phaser from "phaser";
import { SceneKeys } from "@/constants/SceneKeys";
import { MenuButton } from "@/ui/MenuButton";

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
    const cx = width / 2;
    const cy = height / 2;

    // Semi-transparent overlay
    this.add.rectangle(cx, cy, width, height, 0x000000, 0.75);

    // Main death text
    this.add
      .text(cx, cy - 120, "YOU DIED", {
        fontSize: "44px",
        fontFamily: "'Press Start 2P', monospace",
        color: "#ef4444",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Stats
    this.add
      .text(cx, cy - 50, `Gold: ${this.gold}`, {
        fontSize: "18px",
        fontFamily: "'Press Start 2P', monospace",
        color: "#ffd700",
      })
      .setOrigin(0.5);

    // Retry & Main Menu buttons
    new MenuButton(this, cx, cy + 25, "RETRY", () => {
      this.scene.stop(SceneKeys.GAME_OVER);
      this.scene.start(SceneKeys.GAME);
    });

    new MenuButton(this, cx, cy + 105, "MAIN MENU", () => {
      this.scene.stop(SceneKeys.GAME_OVER);
      this.scene.stop(SceneKeys.UI);
      this.scene.start(SceneKeys.MAIN_MENU);
    });

    // Spacebar keyboard shortcut for quick restart
    this.input.keyboard?.once("keydown-SPACE", () => {
      this.scene.stop(SceneKeys.GAME_OVER);
      this.scene.start(SceneKeys.GAME);
    });
  }
}
