import { IState } from "@/fsm/IState";

export class AttackState implements IState {
  private entity: any;

  constructor(entity: any) {
    this.entity = entity;
  }

  enter(): void {
    if (this.entity.body) {
      this.entity.body.setVelocity(0, 0);
    }

    // Current state decides which animation to play
    const currentState = this.entity.fsm.getCurrentStateKey();
    const attackNumber = currentState === "attack2" ? "attack2" : "attack";

    const attackKey = `${this.entity.animPrefix}-${attackNumber}`;
    const anims = this.entity.scene.anims;

    if (anims.exists(attackKey)) {
      this.entity.play(attackKey, true);

      this.entity.once("animationcomplete", () => {
        this.entity.fsm.transition("idle");
      });
    } else {
      this.entity.play(`${this.entity.animPrefix}-idle`, true);

      this.entity.scene.time.delayedCall(400, () => {
        if (this.entity.active) {
          this.entity.fsm.transition("idle");
        }
      });
    }

    if (this.entity.executeAttack) {
      this.entity.executeAttack();
    }
  }

  update(): void {}

  exit(): void {
    this.entity.off("animationcomplete");
  }
}
