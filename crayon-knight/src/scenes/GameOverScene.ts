import Phaser from "phaser";
import { SceneKeys } from "@/constants/SceneKeys";
import { MenuButton } from "@/ui/MenuButton";
import { runState } from "@/state/RunState";
import { storageService } from "@/services/StorageService";
import { PLAYER_CONFIG } from "@/config/BalanceConfig";

/**
 * Game Over Scene
 * Jab player mar jata hai tab yeh scene dikhaya jata hai.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.GAME_OVER });
  }

  create() {
    storageService.updateHighScore(runState.score);
    const saved = storageService.load();

    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // Semi-transparent overlay
    this.add.rectangle(cx, cy, width, height, 0x000000, 0.75);

    // Main death text
    this.add
      .text(cx, cy - 140, "YOU DIED", {
        fontSize: "44px",
        fontFamily: "'Press Start 2P', monospace",
        color: "#ef4444",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Stats
    this.add
      .text(cx, cy - 70, `Score: ${runState.score}`, {
        fontSize: "16px",
        fontFamily: "'Press Start 2P', monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 44, `Best: ${saved.highScore}`, {
        fontSize: "16px",
        fontFamily: "'Press Start 2P', monospace",
        color: "#ffd700",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 18, `Gold: ${runState.gold}`, {
        fontSize: "16px",
        fontFamily: "'Press Start 2P', monospace",
        color: "#ffd700",
      })
      .setOrigin(0.5);

    const doRetry = () => {
      runState.reset(PLAYER_CONFIG.maxHp);
      this.scene.stop(SceneKeys.GAME_OVER);
      this.scene.start(SceneKeys.GAME);
    };

    // Retry & Main Menu buttons
    new MenuButton(this, cx, cy + 25, "RETRY", doRetry);

    new MenuButton(this, cx, cy + 105, "MAIN MENU", () => {
      runState.reset(PLAYER_CONFIG.maxHp);
      this.scene.stop(SceneKeys.GAME_OVER);
      this.scene.stop(SceneKeys.UI);
      this.scene.start(SceneKeys.MAIN_MENU);
    });

    // Spacebar keyboard shortcut for quick restart
    this.input.keyboard?.once("keydown-SPACE", doRetry);
  }
}
