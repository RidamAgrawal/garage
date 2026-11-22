import Phaser from "phaser";
import { EventBus } from "@/events/EventBus";
import { EventKeys } from "@/constants/EventKeys";
const K = Phaser.Input.Keyboard.KeyCodes;

// EDIT THESE to the keys Player actually reads. Movement sends arrows + WASD together.
const MOVE = {
  left: [K.LEFT, K.A],
  right: [K.RIGHT, K.D],
  up: [K.UP, K.W],
  down: [K.DOWN, K.S],
};
// Action buttons for Crayon Knight: standard gamepad diamond layout
// West: ATK (SPACE) | East: DEF (SHIFT) | South: JMP (C) | North: SP (X)
const ACTIONS = [
  { label: "ATK", key: K.SPACE, x: -1, y: 0 },
  { label: "DEF", key: K.SHIFT, x: 1, y: 0 },
  { label: "JMP", key: K.C, x: 0, y: 1 },
  { label: "SP", key: K.X, x: 0, y: -1 },
];

export const stickDirs = (dx: number, dy: number, dz: number) => ({
  left: dx < -dz,
  right: dx > dz,
  up: dy < -dz,
  down: dy > dz,
});

export class TouchControls {
  private root: Phaser.GameObjects.Container;
  private thumb!: Phaser.GameObjects.Image;
  private held = new Set<number>();
  private stickId = -1;
  private home = { x: 0, y: 0, r: 1 };
  private defEnabled = false;
  private defBtn?: Phaser.GameObjects.Image;
  private defText?: Phaser.GameObjects.Text;

  // Primary pointer, so touchscreen laptops and desktops stay false
  static isTouchDevice = () =>
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  constructor(private scene: Phaser.Scene) {
    this.root = scene.add.container(0, 0).setDepth(100);
    this.layout();
    scene.scale.on("resize", this.layout, this);
    scene.input.on("pointermove", this.onMove, this);
    scene.input.on("pointerup", this.onUp, this);
    scene.events.once("shutdown", this.destroy, this);
    EventBus.on(EventKeys.SHIELD_PICKED_UP, this.enableDef, this);
  }

  private enableDef = () => {
    this.defEnabled = true;
    if (this.defBtn) {
      this.defBtn.setTexture("SmallBlueRoundButton_Regular");
    }
    if (this.defText) {
      this.defText.setColor("#efe1ab");
    }
  };

  private layout() {
    const s = this.scene;
    this.releaseAll();
    this.root.removeAll(true);
    const { width, height } = s.scale;
    const u = s.scale.displayScale.x || 1; // game units per CSS px
    const minDim = Math.min(width, height);
    const r = Math.max(24 * u, Math.min(32 * u, minDim * 0.055));
    const d = 1.45 * r;
    const m = Math.max(16 * u, Math.min(24 * u, minDim * 0.04));
    const R = Math.max(48 * u, Math.min(56 * u, minDim * 0.1));
    const circle = Phaser.Geom.Circle;

    // Stick: bottom-left
    const sx = m + R,
      sy = height - m - R;
    this.home = { x: sx, y: sy, r: R };
    const base = s.add
      .circle(sx, sy, R, 0x1a1a2e, 0.35)
      .setStrokeStyle(3 * u, 0xefe1ab, 0.6);
    base.setInteractive(new circle(R, R, R), circle.Contains);
    base.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.stickId = p.id;
      this.onMove(p);
    });
    this.thumb = s.add
      .image(sx, sy, "TinyRoundBlueButton")
      .setDisplaySize(R, R);
    this.root.add([base, this.thumb]);

    // Actions: bottom-right (center of diamond gamepad cluster)
    const cx = width - m - d - r,
      cy = height - m - d - r;
    for (const a of ACTIONS) {
      const x = cx + a.x * d,
        y = cy + a.y * d;
      const isDef = a.key === K.SHIFT;
      const b = s.add
        .image(
          x,
          y,
          isDef && !this.defEnabled
            ? "SmallBlueRoundButton_Disabled_Regular"
            : "SmallBlueRoundButton_Regular",
        )
        .setDisplaySize(2 * r, 2 * r);
      // Hit area is in unscaled texture space, so a circle on the frame size stays round at any scale
      b.setInteractive(
        new circle(b.width / 2, b.height / 2, b.width / 2),
        circle.Contains,
      );
      const up = () => {
        this.release(a.key);
        b.setTexture(
          isDef && !this.defEnabled
            ? "SmallBlueRoundButton_Disabled_Regular"
            : "SmallBlueRoundButton_Regular",
        );
      };
      b.on("pointerdown", () => {
        if (isDef && !this.defEnabled) return;
        this.press(a.key);
        b.setTexture("SmallBlueRoundButton_Pressed");
      });
      b.on("pointerup", up);
      b.on("pointerout", up); // finger slid off
      if (isDef) this.defBtn = b;
      const t = s.add
        .text(x, y, a.label, {
          fontFamily: "'Press Start 2P'",
          fontSize: `${Math.round(10 * u)}px`,
          color: isDef && !this.defEnabled ? "#888" : "#efe1ab",
        })
        .setOrigin(0.5);
      if (isDef) this.defText = t;
      this.root.add([b, t]);
    }
  }

  private onMove(p: Phaser.Input.Pointer) {
    if (p.id !== this.stickId) return;
    const { x, y, r } = this.home;
    const dx = p.x - x,
      dy = p.y - y,
      k = Math.min(1, r / (Math.hypot(dx, dy) || 1));
    this.thumb.setPosition(x + dx * k, y + dy * k);
    const dirs = stickDirs(dx, dy, r * 0.3);
    (Object.keys(MOVE) as (keyof typeof MOVE)[]).forEach((n) =>
      MOVE[n].forEach((c) => (dirs[n] ? this.press(c) : this.release(c))),
    );
  }

  private onUp(p: Phaser.Input.Pointer) {
    if (p.id !== this.stickId) return;
    this.stickId = -1;
    this.thumb.setPosition(this.home.x, this.home.y);
    Object.values(MOVE)
      .flat()
      .forEach((c) => this.release(c));
  }

  private press(code: number) {
    if (this.held.has(code)) return;
    this.held.add(code);
    this.emit("keydown", code);
  }

  private release(code: number) {
    if (this.held.delete(code)) this.emit("keyup", code);
  }

  private releaseAll() {
    [...this.held].forEach((c) => this.release(c));
    this.stickId = -1;
  }

  // Phaser listens on window; include key & code so mobile WebViews don't discard synthetic events
  private emit(type: string, code: number) {
    const keyMap: Record<number, { key: string; code: string }> = {
      [K.SPACE]: { key: " ", code: "Space" },
      [K.SHIFT]: { key: "Shift", code: "ShiftLeft" },
      [K.L]: { key: "l", code: "KeyL" },
      [K.LEFT]: { key: "ArrowLeft", code: "ArrowLeft" },
      [K.RIGHT]: { key: "ArrowRight", code: "ArrowRight" },
      [K.UP]: { key: "ArrowUp", code: "ArrowUp" },
      [K.DOWN]: { key: "ArrowDown", code: "ArrowDown" },
      [K.A]: { key: "a", code: "KeyA" },
      [K.D]: { key: "d", code: "KeyD" },
      [K.W]: { key: "w", code: "KeyW" },
      [K.S]: { key: "s", code: "KeyS" },
      [K.C]: { key: "c", code: "KeyC" },
      [K.X]: { key: "x", code: "KeyX" },
    };
    const info = keyMap[code] || {};
    window.dispatchEvent(
      new KeyboardEvent(type, {
        keyCode: code,
        which: code,
        key: info.key || "",
        code: info.code || "",
        bubbles: true,
      }),
    );
  }

  private destroy() {
    this.releaseAll(); // no stuck keys if the scene stops mid-touch
    this.scene.scale.off("resize", this.layout, this);
    this.scene.input.off("pointermove", this.onMove, this);
    this.scene.input.off("pointerup", this.onUp, this);
    EventBus.off(EventKeys.SHIELD_PICKED_UP, this.enableDef, this);
  }
}
