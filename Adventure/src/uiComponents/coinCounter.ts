import type { GameObj, KAPLAYCtx } from "kaplay";
import { globalState } from "../state/stateManager";

// Shows the running coin total at the top-right of the screen, mirroring the
// health bar on the left. Auto-updates whenever globalState.coins changes.
export default class CoinCounter {
  k: KAPLAYCtx;
  countText: GameObj | null = null;
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

    this.countText = k.add([
      k.text(String(globalState.coins), { font: "gameboy", size: 32 }),
      k.pos(rightX, 24),
      k.anchor("topright"),
      k.color(255, 214, 92),
      k.fixed(),
      k.z(100),
      "coinCounter",
    ]);

    k.onUpdate(() => {
      if (!this.countText) return;
      if (this.lastCount !== globalState.coins) {
        this.lastCount = globalState.coins;
        this.countText.text = String(globalState.coins);
      }
    });
  }
}
