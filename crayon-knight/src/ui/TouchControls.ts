import Phaser from "phaser";
const K = Phaser.Input.Keyboard.KeyCodes;

// EDIT THESE to the keys Player actually reads. Movement sends arrows + WASD together.
const MOVE = {
  left: [K.LEFT, K.A],
  right: [K.RIGHT, K.D],
  up: [K.UP, K.W],
  down: [K.DOWN, K.S],
};
// Action buttons for Crayon Knight: Attack (SPACE) & Defend (SHIFT / L)
const ACTIONS = [
  { label: "ATK", key: K.SPACE, x: 0.8, y: -0.5 },
  { label: "DEF", key: K.SHIFT, x: -0.8, y: 0.5 },
];

export const stickDirs = (dx: number, dy: number, dz: number) => ({
  left: dx < -dz,
  right: dx > dz,
  up: dy < -dz,
  down: dy > dz,
});

export class TouchControls {
  private root: Phaser.GameObjects.Container;
  private thumb!: Phaser.GameObjects.Arc;
  private held = new Set<number>();
  private stickId = -1;
  private home = { x: 0, y: 0, r: 1 };

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
  }

  private layout() {
    const s = this.scene;
    this.releaseAll();
    this.root.removeAll(true);
    const { width, height } = s.scale;
    const u = s.scale.displayScale.x; // game units per CSS px
    const m = 24 * u,
      R = 56 * u,
      r = 34 * u,
      d = 1.5 * r;
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
    this.thumb = s.add.circle(sx, sy, R * 0.45, 0x47aba9, 0.7);
    this.root.add([base, this.thumb]);

    // Actions: bottom-right
    const cx = width - m - d - r,
      cy = height - m - d - r;
    for (const a of ACTIONS) {
      const x = cx + a.x * d,
        y = cy + a.y * d;
      const b = s.add
        .circle(x, y, r, 0x47aba9, 0.55)
        .setStrokeStyle(3 * u, 0xefe1ab, 0.8);
      b.setInteractive(new circle(r, r, r), circle.Contains);
      const up = () => {
        this.release(a.key);
        b.setFillStyle(0x47aba9, 0.55);
      };
      b.on("pointerdown", () => {
        this.press(a.key);
        b.setFillStyle(0xefe1ab, 0.6);
      });
      b.on("pointerup", up);
      b.on("pointerout", up); // finger slid off
      const t = s.add
        .text(x, y, a.label, {
          fontFamily: "'Press Start 2P'",
          fontSize: `${Math.round(10 * u)}px`,
          color: "#efe1ab",
        })
        .setOrigin(0.5);
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
  }
}
