import { IState } from "@/fsm/IState";

/**
 * Idle state for entities (Player/Enemy).
 * Hindi: State pattern ka use karke hum idle behavior encapsulate karte hain.
 *
 * Enemy: stays still for 2–4s playing idle anim, then transitions to patrol.
 *        If player enters detection range, transitions to chase immediately.
 */
export class IdleState implements IState {
  private entity: any;
  private idleUntil = 0;

  constructor(entity: any) {
    this.entity = entity;
  }

  enter(): void {
    this.entity.play(`${this.entity.animPrefix}-idle`, true);
    this.entity.body?.setVelocity(0, 0);

    // Enemy: schedule how long to stay idle (2–4s)
    if (this.entity.isEnemy) {
      this.idleUntil = this.entity.scene.time.now + 2000 + Math.random() * 2000;
    }
  }

  update(time: number): void {
    if (this.entity.getController) {
      // Player logic
      const controller = this.entity.getController();
      if (controller.isDefensePressed?.() || controller.isDefenseDown?.()) {
        this.entity.defend();
        return;
      }
      const dir = controller.getMovementDirection();
      if (dir.x !== 0 || dir.y !== 0) {
        this.entity.fsm.transition("run");
        return;
      }
      if (controller.isAttackPressed()) {
        this.entity.attack();
      }
    } else if (this.entity.isEnemy) {
      // Chase takes priority
      if (
        this.entity.isPlayerInRange &&
        this.entity.isPlayerInRange(this.entity.detectionRange ?? 200)
      ) {
        this.entity.fsm.transition("chase");
        return;
      }
      // Idle timer done → patrol
      if (time >= this.idleUntil) {
        this.entity.fsm.transition("patrol");
      }
    }
  }

  exit(): void {}
}
