import { IState } from "../IState";

export class DefendState implements IState {
  private entity: any;

  constructor(entity: any) {
    this.entity = entity;
  }

  enter(): void {
    this.entity.play(`${this.entity.animPrefix}-defend`, true);
    if (this.entity.body) {
      this.entity.body.setVelocity(0, 0);
    }

    this.entity.once("animationcomplete", () => {
      const controller = this.entity.getController?.();
      if (!controller?.isDefenseDown?.()) {
        this.entity.fsm.transition("idle");
      }
    });
  }

  update(): void {
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
    this.entity.off("animationcomplete");
  }
}
