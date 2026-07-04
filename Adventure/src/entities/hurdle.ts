import type { GameObj, KAPLAYCtx, Vec2 } from "kaplay";

// Metal thorn frames from the "assets" sheet.
// If the visuals look inverted (thorns showing while idle), swap these two.
const SPIKE_DOWN_FRAME = 460; // retracted — safe to stand on
const SPIKE_UP_FRAME = 459; // extended — damages the player

const DAMAGE = 0.5;
// Distance (px) at which the player triggers the thorns to rise. Slightly
// larger than the collision area so the spikes are already up on contact.
const TRIGGER_RANGE = 18;

export class HurdleEntity {
  k: KAPLAYCtx | null = null;
  map: GameObj | null = null;
  hurdle: GameObj | null = null;
  constructor(k: KAPLAYCtx, map: GameObj, position: Vec2) {
    this.k = k;
    this.map = map;
    this.hurdle = this.k.add([
      k.sprite("assets", {
        frame: SPIKE_DOWN_FRAME,
      }),
      k.pos(position),
      k.area({ shape: new k.Rect(k.vec2(0), 12, 8) }),
      k.anchor("center"),
      // k.body({ isStatic: true }),
      k.z(0),
      {
        // No damage while retracted; toggled on when the spikes rise.
        damage: 0,
        isUp: false,
      },
      "hurdle",
    ]);
  }

  public raise() {
    if (!this.hurdle || this.hurdle.isUp) return;
    this.hurdle.isUp = true;
    this.hurdle.frame = SPIKE_UP_FRAME;
    this.hurdle.damage = DAMAGE;
  }

  public lower() {
    if (!this.hurdle || !this.hurdle.isUp) return;
    this.hurdle.isUp = false;
    this.hurdle.frame = SPIKE_DOWN_FRAME;
    this.hurdle.damage = 0;
  }

  // Raise the spikes only while the player is standing over (or right next to)
  // this thorn tile, and retract them once the player moves away.
  public watchPlayer(player: GameObj | null) {
    if (!this.hurdle || !player) return;
    this.hurdle.onUpdate(() => {
      const near = this.hurdle!.pos.dist(player.pos) <= TRIGGER_RANGE;
      if (near) {
        this.raise();
      } else {
        this.lower();
      }
    });
  }
}
