import type { GameObj, KAPLAYCtx, KEventController, Vec2 } from "kaplay";
import { playAnimIfNotPlaying } from "../utils";

const TILE = 16;
// Player must be within this Manhattan distance (~4 tiles) for the ghost to chase.
const CHASE_RANGE = 4 * TILE;
// How far the ghost drifts to each side of its spawn point while patrolling.
const PATROL_RANGE = 2 * TILE;
const PATROL_SPEED = 25;
const CHASE_SPEED = 55;
// Hearts of damage dealt to the player on contact.
const COLLISION_DAMAGE = 1;

export class GhostEntity {
  private k: KAPLAYCtx;
  public map: GameObj;
  public ghostGameObj: GameObj | null = null;
  private updateRef: KEventController | null = null;
  private origin: Vec2;
  private patrolDir: 1 | -1 = 1;

  constructor(k: KAPLAYCtx, map: GameObj, pos: Vec2) {
    this.k = k;
    this.map = map;
    this.origin = pos;
    this.ghostGameObj = k.add([
      k.sprite("assets", { anim: "ghost-walk-down" }),
      k.area({ shape: new k.Rect(k.vec2(2, 2), 12, 12) }),
      k.body(),
      k.pos(pos),
      k.opacity(),
      k.z(2),
      k.health(1),
      {
        speed: PATROL_SPEED,
        attackPower: COLLISION_DAMAGE,
        isAttacking: false,
        // Guards against the sword + player-collision both firing in one frame.
        isDefeated: false,
      },
      "ghost",
    ]);
  }

  // Patrol to-and-fro around the spawn point; chase the player once they come
  // within CHASE_RANGE (Manhattan distance).
  public setGhostAi(player: GameObj | null) {
    const k = this.k;
    const ghost = this.ghostGameObj;
    if (!ghost) return;

    this.updateRef = k.onUpdate(() => {
      if (!ghost.exists()) return;

      const chasing =
        player &&
        Math.abs(player.pos.x - ghost.pos.x) +
          Math.abs(player.pos.y - ghost.pos.y) <=
          CHASE_RANGE;

      let dx: number, dy: number;
      if (chasing && player) {
        const dir = player.pos.sub(ghost.pos).unit();
        dx = dir.x * CHASE_SPEED;
        dy = dir.y * CHASE_SPEED;
      } else {
        if (ghost.pos.x >= this.origin.x + PATROL_RANGE) this.patrolDir = -1;
        else if (ghost.pos.x <= this.origin.x - PATROL_RANGE) this.patrolDir = 1;
        dx = this.patrolDir * PATROL_SPEED;
        dy = 0;
      }
      ghost.move(dx, dy);
      playAnimIfNotPlaying(ghost, "ghost-walk-" + this.facingFor(dx, dy));
    });

    ghost.onDestroy(() => this.updateRef?.cancel());
    k.onSceneLeave(() => this.updateRef?.cancel());
  }

  // Pick the facing sprite from the dominant movement axis.
  private facingFor(dx: number, dy: number): "up" | "down" | "left" | "right" {
    if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
    return dy >= 0 ? "down" : "up";
  }
}
