import { ELEVATION_CONFIG } from "@/config/BalanceConfig";
import { IFSMState } from "../IFSMState";

export class JumpState implements IFSMState {
  constructor(private entity: any) {}

  enter(): void {
    this.entity.elevation.jump();
    const jump = `${this.entity.animPrefix}-jump`;
    const run = `${this.entity.animPrefix}-run`;
    this.entity.play(this.entity.scene.anims.exists(jump) ? jump : run, true);
  }

  update(): void {
    const e = this.entity;
    const dir = e.getController().getMovementDirection();
    e.movement.move(
      dir.x * ELEVATION_CONFIG.AIR_CONTROL,
      dir.y * ELEVATION_CONFIG.AIR_CONTROL,
    );
    if (e.elevation.isGrounded) {
      e.fsm.transition(dir.x !== 0 || dir.y !== 0 ? "run" : "idle");
    }
  }
}
