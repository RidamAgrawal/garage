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
    const centreX = width / 2;
    const centreY = height / 2;

    // Background
    this.cameras.main.setBackgroundColor("#47aba9");
    this.tiledBackground("Carved_9Slides", width, height);
    this.bannerPanel(centreX, centreY, 640, 448);

    // Animated title
    this.add
      .nineslice(
        centreX,
        centreY - 220,
        "Ribbon_Blue_3Slides",
        0,
        400,
        64,
        64,
        64,
        0,
        0,
      )
      .setScale(2);
    this.createWaveTitle(centreX, centreY - 224, "CRAYON KNIGHT");

    // Subtitle
    this.add
      .text(
        centreX,
        centreY - 110,
        "A Rogue-Lite Dungeon Crawler\nFight through endless crayon-drawn\ndungeons. Die. Learn. Repeat.",
        {
          fontFamily: "Press Start 2P",
          fontSize: "24px",
          color: "#3b2a1a",
          align: "center",
          lineSpacing: 10,
        },
      )
      .setOrigin(0.5);

    this.createMenuItem(centreX, centreY - 40, "NEW GAME");

    this.createMenuItem(centreX, centreY + 40, "OPTIONS");

    this.createMenuItem(centreX, centreY + 120, "QUIT GAME");
  }

  private createMenuItem(x: number, y: number, label: string) {
    const menuItemBg = this.add.nineslice(
      0,
      0,
      "Button_Blue_3Slides",
      0,
      320,
      64,
      64,
      64,
      0,
      0,
    );
    const menuItemText = this.add
      .text(0, -4, label, {
        fontFamily: "'Press Start 2P'",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const menuItem = this.add
      .container(x, y, [menuItemBg, menuItemText])
      .setSize(320, 64)
      .setInteractive({ useHandCursor: true });

    // The pressed art sits lower, so the label drops 4px with it
    const look = (key: string, textY: number, color: string) => {
      menuItemBg.setTexture(key);
      menuItemText.setY(textY).setColor(color);
    };

    menuItem.on("pointerover", () => look("Button_Hover_3Slides", -4, "#ffe08a"));
    menuItem.on("pointerout", () => look("Button_Blue_3Slides", -4, "#ffffff"));
    menuItem.on("pointerdown", () =>
      look("Button_Blue_3Slides_Pressed", 0, "#ffffff"),
    );
    menuItem.on("pointerup", () => {
      look("Button_Hover_3Slides", -4, "#ffe08a");
      if (label === "NEW GAME") this.scene.start(SceneKeys.GAME);
    });

    return menuItem;
  }

  private createWaveTitle(x: number, y: number, text: string) {
    const letters: { object: Phaser.GameObjects.Text; originalY: number }[] =
      [];
    const fontSize = 40;
    const letterSpacing = 40;

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

  private getColorBetween(
    color1: string,
    color2: string,
    amount: number,
  ): string {
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

  private tiledBackground(key: string, w: number, h: number): void {
    const tex = this.textures.get(key);
    const xs = [0, 64, w - 64],
      ws = [64, w - 128, 64];
    const ys = [0, 64, h - 64],
      hs = [64, h - 128, 64];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const f = `${r}${c}`;
        if (!tex.has(f)) tex.add(f, 0, 64 * c, 64 * r, 64, 64);
        this.add.tileSprite(xs[c], ys[r], ws[c], hs[r], key, f).setOrigin(0);
      }
    }
  }

  private bannerPanel(cx: number, cy: number, w: number, h: number): void {
    const key = "Banner";
    const tex = this.textures.get(key);
    // [first cell, cell count] per band: start/end bands are 2 cells (128px), middle is 1 (64px)
    const bands = [
      [0, 2],
      [3, 1],
      [5, 2],
    ];
    const xs = [0, 128, w - 128],
      ws = [128, w - 256, 128];
    const ys = [0, 128, h - 128],
      hs = [128, h - 256, 128];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const f = `b${r}${c}`;
        if (!tex.has(f))
          tex.add(
            f,
            0,
            bands[c][0] * 64,
            bands[r][0] * 64,
            bands[c][1] * 64,
            bands[r][1] * 64,
          );
        this.add
          .tileSprite(
            cx - w / 2 + xs[c],
            cy - h / 2 + ys[r],
            ws[c],
            hs[r],
            key,
            f,
          )
          .setOrigin(0);
      }
    }
  }
}
