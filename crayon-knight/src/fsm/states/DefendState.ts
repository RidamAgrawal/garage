import { IFSMState } from "@/fsm/IFSMState";

export class DefendState implements IFSMState {
  private entity: any;

  constructor(entity: any) {
    this.entity = entity;
  }

  private onAnimComplete = () => {
    if (this.entity.isEnemy) {
      if (this.entity.target?.isAttacking?.()) {
        this.entity.play(`${this.entity.animPrefix}-defend`, true);
      } else {
        const attackRange = this.entity.getAttackRange?.() ?? 48;
        if (
          this.entity.isPlayerInRange?.(attackRange) &&
          this.entity.combat?.canAttack(this.entity.scene.time.now)
        ) {
          this.entity.fsm.transition("attack");
        } else {
          this.entity.fsm.transition("chase");
        }
      }
      return;
    }

    const controller = this.entity.getController?.();
    if (!controller?.isDefenseDown?.()) {
      this.entity.fsm.transition("idle");
    }
  };

  enter(): void {
    this.entity.play(`${this.entity.animPrefix}-defend`, true);
    if (this.entity.body) {
      this.entity.body.setVelocity(0, 0);
    }
    this.entity.on("animationcomplete", this.onAnimComplete);
  }

  update(): void {
    if (this.entity.isEnemy) {
      const attackRange = this.entity.getAttackRange?.() ?? 48;
      // While player is attacking and near, maintain defense
      if (
        this.entity.target?.isAttacking?.() &&
        this.entity.isPlayerInRange?.(attackRange * 1.3)
      ) {
        return;
      }

      // Player stopped attacking or backed away
      if (
        !this.entity.target?.isAttacking?.() &&
        this.entity.isPlayerInRange?.(attackRange) &&
        this.entity.combat?.canAttack(this.entity.scene.time.now)
      ) {
        this.entity.fsm.transition("attack");
      } else {
        this.entity.fsm.transition("chase");
      }
      return;
    }

    const controller = this.entity.getController?.();
    if (controller) {
      if (!controller.isDefenseDown()) {
        this.entity.fsm.transition("idle");
        return;
      }
      if (controller.isAttackPressed()) {
        this.entity.attack();
      }
    }
  }

  exit(): void {
    this.entity.off("animationcomplete", this.onAnimComplete);
  }
}
