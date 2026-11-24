const url = (n: number, hx: number, hy: number, fallback: string) =>
  `url("assets/UI Elements/Cursors/Cursor_0${n}.png") ${hx} ${hy}, ${fallback}`;

// The hotspot is the pixel that counts as the click point. CALIBRATE hx/hy to your art.
export const CURSORS = {
  arrow: url(1, 0, 0, "auto"),
  hand: url(2, 20, 6, "pointer"),
  no: url(3, 16, 16, "not-allowed"),
};

// Expand button: only on browsers that support fullscreen, and only from a tap/click
export function addFullscreenButton(scene: Phaser.Scene) {
  if (!scene.scale.fullscreen.available) return;
  const btn = scene.add
    .image(0, 0, "maximize")
    .setDepth(100)
    .setInteractive({ cursor: CURSORS.hand });
  const place = () => {
    const u = scene.scale.displayScale.x; // game units per CSS px, so the tap target stays ~44px
    btn
      .setDisplaySize(44 * u, 44 * u)
      .setPosition(scene.scale.width - 30 * u, 30 * u);
  };
  place();
  scene.scale.on("resize", place);
  btn.on("pointerup", () => {
    scene.scale.toggleFullscreen();
    btn.texture.key === "maximize" ? btn.setTexture("minimize") : btn.setTexture("maximize");
  }); // pointerup counts as a user gesture on touch
  scene.events.once("shutdown", () => scene.scale.off("resize", place));
}
