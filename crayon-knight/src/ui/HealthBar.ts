import Phaser from "phaser";

const CELL = 64; // base sheet = 64px cells; caps are cells 0 and 4, the stretchable middle is cell 2
const BIGBAR_PAD = 51; // wooden frame thickness inside each end cap, in texture px. CALIBRATE to your art.
const SMALLBAR_PAD = 57;
/**
 * HealthBar — Heart-based health display
 *
 * Observer Pattern: HealthBar kisi ko directly check nahi karta.
 * EventBus pe listen karta hai PLAYER_HEALTH_CHANGED event ko.
 * Jab bhi player ka HP change ho, yeh automatically update hota hai.
 */
export class HealthBar {
  readonly container: Phaser.GameObjects.Container;
  private fill: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    kind: "big" | "small",
    x: number,
    y: number,
  ) {
    const k = kind === "big" ? "Big" : "Small";
    const tex = scene.textures.get(`${k}Bar_Base`);
    for (const i of [0, 2, 4])
      if (!tex.has(`${i}`)) tex.add(`${i}`, 0, i * CELL, 0, CELL, CELL);

    const cap = (cx: number, f: string) =>
      scene.add.image(cx, 0, `${k}Bar_Base`, f).setOrigin(0, 0.5);
    const pad = kind === "big" ? BIGBAR_PAD : SMALLBAR_PAD;
    this.fill = scene.add
      .image(pad, 0, `${k}Bar_Fill`)
      .setOrigin(0, 0.5)
      .setScale((3 * CELL - 2 * pad) / CELL, 1); // stretch to the full inner slot, caps included
    // Fill goes last so it sits over the caps' dark slot but inside their frame
    this.container = scene.add.container(x, y, [
      cap(CELL, "2"),
      cap(0, "0"),
      cap(2 * CELL, "4"),
      this.fill,
    ]);
  }

  public setFraction(f: number): void {
    f = Phaser.Math.Clamp(f, 0, 1);
    this.fill
      .setVisible(f > 0)
      .setCrop(0, 0, this.fill.width * f, this.fill.height);
  }

  /**
   * Cleanup — EventBus listeners hamesha remove karo destroy mein
   * Warna memory leak hoga
   */
  public destroy(): void {
    if (this.container) {
      this.container.destroy();
    }
  }
}

// Enemy bar: follows the hitbox, polls health each frame (no HealthComponent hooks needed), dies with the entity.
export function attachHealthBar(
  e: Phaser.Physics.Arcade.Sprite & {
    health: { getCurrentHp(): number; getMaxHp(): number };
  },
  headTop = 0.2, // fraction of frame height that is empty above the head; differs per sprite
) {
  const S = 0.35; // 3 cells * 64 * 0.35 = ~67px wide
  const bar = new HealthBar(e.scene, "small", 0, 0);
  bar.container.setScale(S).setDepth(30);
  const sync = () => {
    const t = e.getTopCenter(); // follows scale and origin, so no body math
    bar.container
      .setVisible(e.active)
      .setPosition(
        t.x - (3 * CELL * S) / 2,
        t.y + e.displayHeight * headTop - 6,
      );
    bar.setFraction(e.health.getCurrentHp() / e.health.getMaxHp());
  };
  e.scene.events.on("postupdate", sync);
  e.once("destroy", () => {
    e.scene.events.off("postupdate", sync);
    bar.destroy();
  });
}
