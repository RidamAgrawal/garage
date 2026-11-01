import Phaser from "phaser";
import { SceneKeys } from "@/constants/SceneKeys";

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
    this.cameras.main.setBackgroundColor("#1a1a2e");

    // // Title
    // const title = this.add
    //   .text(width / 2, height / 2 - 100, "CRAYON KNIGHT", {
    //     fontSize: "52px",
    //     fontFamily: "Bungee",
    //     color: "#ffffff",
    //     stroke: "#ff6b35",
    //     strokeThickness: 6,
    //   })
    //   .setOrigin(0.5);
    // title.setScale(0.5);
    // title.setAlpha(0);

    // this.tweens.add({
    //   targets: title,
    //   scale: 1,
    //   alpha: 1,
    //   duration: 1000,
    //   ease: "Back.Out",
    // });
    // Animated title
    this.createWaveTitle(width / 2, height / 2 - 100, "CRAYON KNIGHT");

    // Subtitle
    this.add
      .text(width / 2, height / 2 - 40, "A Rogue-Lite Dungeon Crawler", {
        fontFamily: "Press Start 2P",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#aaaacc",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.createMenuItem(width / 2, height / 2 + 20, "NEW GAME");

    this.createMenuItem(width / 2, height / 2 + 80, "OPTIONS");

    this.createMenuItem(width / 2, height / 2 + 140, "QUIT GAME");
  }

  private createMenuItem(
    x: number,
    y: number,
    label: string,
  ): Phaser.GameObjects.Text {
    const menuText = this.add
      .text(x, y, label, {
        fontFamily: "'Press Start 2P'",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#efe1ab",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover effect
    menuText.on("pointerover", () => {
      this.tweens.add({
        targets: menuText,
        scale: 1.2,
        duration: 150,
        ease: "Back.Out",
      });

      menuText.setColor("#47aba9");
    });

    // Mouse leaves
    menuText.on("pointerout", () => {
      this.tweens.add({
        targets: menuText,
        scale: 1,
        duration: 150,
        ease: "Back.Out",
      });

      menuText.setColor("#efe1ab");
    });

    // Click effect
    menuText.on("pointerdown", () => {
      this.tweens.add({
        targets: menuText,
        scale: 0.9,
        duration: 100,
        yoyo: true,
      });

      if (label === "NEW GAME") {
        this.scene.start(SceneKeys.GAME);
      }
    });

    return menuText;
  }

  private createWaveTitle(x: number, y: number, text: string) {
    const letters: { object: Phaser.GameObjects.Text; originalY: number }[] =
      [];
    const fontSize = 52;
    const letterSpacing = 60;

    // Create individual letters
    for (let i = 0; i < text.length; i++) {
      const progress = i / Math.max(text.length - 1, 1);
      const color = this.getColorBetween("#2563eb", "#f97316", progress);

      const letter = this.add
        .text(x + i * letterSpacing, y, text[i], {
          fontFamily: '"Press Start 2P"',
          fontSize: `${fontSize}px`,
          fontStyle: "normal",
          color,
        })
        .setOrigin(0.5);

      letters.push({
        object: letter,
        originalY: y,
      });
    }

    // Center all letters
    const totalWidth = (text.length - 1) * letterSpacing;

    letters.forEach((item, i) => {
      item.object.x = x - totalWidth / 2 + i * letterSpacing;

      const letter = item.object;

      this.tweens.add({
        targets: letter,
        y: item.originalY - 18,
        scaleY: 1.2,
        scaleX: 1.08,
        duration: 450,
        delay: i * 100,
        ease: "Sine.InOut",
        yoyo: true,
        repeat: -1,
      });
    });

    return letters;
  }

  private getColorBetween(color1: string, color2: string, amount: number): string {
    const hex = (color: string) => {
      const value = parseInt(color.replace("#", ""), 16);

      return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
      };
    };

    const a = hex(color1);
    const b = hex(color2);

    const r = Math.round(a.r + (b.r - a.r) * amount);
    const g = Math.round(a.g + (b.g - a.g) * amount);
    const bl = Math.round(a.b + (b.b - a.b) * amount);

    return `#${[r, g, bl]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;
  }
}
