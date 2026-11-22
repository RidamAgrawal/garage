import { IFSMState } from "@/fsm/IFSMState";

/**
 * Run state for entities.
 * Hindi: State pattern ka use entity movement ko manage karne ke liye kiya gaya hai.
 */
export class RunState implements IFSMState {
  private entity: any;

  constructor(entity: any) {
    this.entity = entity;
  }

  enter(): void {
    this.entity.play(`${this.entity.animPrefix}-run`, true);
  }

  update(): void {
    if (this.entity.getController) {
      const controller = this.entity.getController();

      if (controller.isDefensePressed?.() || controller.isDefenseDown?.()) {
        this.entity.defend();
        return;
      }

      const dir = controller.getMovementDirection();

      if (dir.x === 0 && dir.y === 0) {
        this.entity.fsm.transition("idle");
        return;
      }

      if (controller.isAttackPressed()) {
        this.entity.attack();
      }

      this.entity.handleMovement();
    } else if (this.entity.isEnemy) {
      const attackRange = this.entity.getAttackRange?.() ?? 0;
      if (attackRange > 0 && this.entity.isPlayerInRange?.(attackRange)) {
        if (this.entity.target?.isAttacking?.()) {
          this.entity.fsm.transition("defend");
          return;
        }
        if (this.entity.combat?.canAttack(this.entity.scene.time.now)) {
          this.entity.fsm.transition("attack");
          return;
        }
      }

      // Lost aggro — return to idle/patrol cycle
      const aggroRange = (this.entity.detectionRange ?? 200) * 1.5;
      if (
        !this.entity.isPlayerInRange ||
        !this.entity.isPlayerInRange(aggroRange)
      ) {
        this.entity.fsm.transition("idle");
      } else {
        this.entity.chasePlayer();
      }
    }
  }

  exit(): void {}
}
