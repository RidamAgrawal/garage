import type { GameObj, KAPLAYCtx, Vec2 } from "kaplay";
import { dialogue } from "../uiComponents/dialog";
import oldmanLines from "../content/oldManContent";
import { globalState } from "../state/stateManager";

export type Facing = "left" | "up" | "right" | "down";

export class OldManEntity {
  k: KAPLAYCtx;
  map: GameObj;
  oldMan: GameObj;
  animMap: Record<Facing, string> = {
    left: "oldman-idle-left",
    up: "oldman-idle-up",
    right: "oldman-idle-right",
    down: "oldman-idle-down",
  };
  constructor(k: KAPLAYCtx, map: GameObj, pos: Vec2) {
    this.k = k;
    this.map = map;
    this.oldMan = k.add([
      k.sprite("assets", { anim: "oldman-idle-down" }),
      k.area({ shape: new k.Rect(k.vec2(3, 4), 10, 12) }),
      k.body({ isStatic: true }),
      k.pos(pos),
      k.opacity(),
      {
        speed: 100,
        attackPower: 1,
        direction: "down",
        isAttacking: false,
      },
      "oldMan",
    ]);
  }

  public async noticePlayer(player: GameObj | null) {
    if (!player) return;
    const angle = this.oldMan.pos.angle(player.pos);
    const facingDirection = this.angleToFacing(angle);

    const anim = this.animMap[facingDirection];
    if (this.oldMan.curAnim() != anim) {
      this.oldMan.play(anim);
    }
  }

  getGameObj() {
    return this.oldMan;
  }

  public angleToFacing(angle: number): Facing {
    if (angle > 50 && angle <= 125) return "up";
    if (angle < -50 && angle >= -125) return "down";
    if (Math.abs(angle) > 125) return "right";
    return "left";
  }

  public startInteraction() {
    return dialogue(
      this.k,
      this.k.vec2(50, 50),
      globalState.talkedToOldman
        ? oldmanLines.english[1 + Math.floor(Math.random() * 2)]
        : oldmanLines.english[0]
    );
  }
}
