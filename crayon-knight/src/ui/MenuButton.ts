import Phaser from "phaser";
import { CURSORS } from "./Cursors";

/**
 * MenuButton — Interactive 9-slice / 3-slice fantasy button
 * Uses Button_Blue_3Slides textures with hover, pressed states and retro text.
 */
export class MenuButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.NineSlice;
  private labelText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onClick?: () => void,
    width: number = 320,
    height: number = 64,
  ) {
    const bg = scene.add.nineslice(
      0,
      0,
      "Button_Blue_3Slides",
      0,
      width,
      height,
      64,
      64,
      0,
      0,
    );
    const labelText = scene.add
      .text(0, -4, label, {
        fontFamily: "'Press Start 2P'",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    super(scene, x, y, [bg, labelText]);

    this.bg = bg;
    this.labelText = labelText;

    this.setSize(width, height);
    this.setInteractive({ cursor: CURSORS.hand });

    const look = (key: string, textY: number, color: string) => {
      this.bg.setTexture(key);
      this.labelText.setY(textY).setColor(color);
    };

    this.on("pointerover", () => look("Button_Hover_3Slides", -4, "#ffe08a"));
    this.on("pointerout", () => look("Button_Blue_3Slides", -4, "#ffffff"));
    this.on("pointerdown", () =>
      look("Button_Blue_3Slides_Pressed", 0, "#ffffff"),
    );
    this.on("pointerup", () => {
      look("Button_Hover_3Slides", -4, "#ffe08a");
      onClick?.();
    });

    scene.add.existing(this);
  }
}
