import type { GameObj, KAPLAYCtx } from "kaplay";
import { globalState } from "../state/stateManager";

// Shows the running coin total at the top-right of the screen, mirroring the
// health bar on the left. Auto-updates whenever globalState.coins changes.
// The count is drawn with the tileset's blackletter digit sprites
// ("digit-0".."digit-9" in worldBlocks.png) instead of a font.
const DIGIT_SCALE = 1.25;
const DIGIT_GAP = 4;

export default class CoinCounter {
  k: KAPLAYCtx;
  private digitObjs: GameObj[] = [];
  private lastCount = -1;

  constructor(k: KAPLAYCtx) {
    this.k = k;
  }

  init() {
    const k = this.k;
    const rightX = k.width() - 24;

    k.add([
      k.sprite("assets", { anim: "coin" }),
      k.pos(rightX - 96, 20),
      k.scale(2.5),
      k.fixed(),
      k.z(100),
      "coinCounter",
    ]);

    k.onUpdate(() => {
      if (this.lastCount !== globalState.coins) {
        this.lastCount = globalState.coins;
        this.renderCount(this.lastCount, rightX);
      }
    });
  }

  // Digits are laid out right-to-left from rightX so the number stays
  // right-aligned as it grows. Each digit glyph has its own width.
  private renderCount(count: number, rightX: number) {
    const k = this.k;
    this.digitObjs.forEach((obj) => obj.destroy());
    this.digitObjs = [];

    let x = rightX;
    for (const d of String(count).split("").reverse()) {
      const digitObj = k.add([
        k.sprite(`digit-${d}`),
        k.pos(x, 24),
        k.anchor("topright"),
        k.scale(DIGIT_SCALE),
        k.fixed(),
        k.z(100),
        "coinCounter",
      ]);
      x -= digitObj.width * DIGIT_SCALE + DIGIT_GAP;
      this.digitObjs.push(digitObj);
    }
  }
}
