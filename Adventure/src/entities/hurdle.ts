import type { GameObj, KAPLAYCtx, Vec2 } from "kaplay";

export class HurdleEntity {
  k: KAPLAYCtx | null = null;
  map: GameObj | null = null;
  hurdle: GameObj | null = null;
  constructor(k: KAPLAYCtx, map: GameObj, position: Vec2) {
    this.k = k;
    this.map = map;
    this.hurdle = this.k.add([
      k.sprite("assets", {
        anim: "hurdle",
      }),
      k.pos(position),
      k.area({ shape: new k.Rect(k.vec2(0), 12, 8) }),
      k.anchor("center"),
      // k.body({ isStatic: true }),
      k.z(0),
      {
        damage: 0.5,
      },
      "hurdle",
    ]);
  }

  public activateSpikes() {
    this.hurdle?.play("hurdle");
  }
}
