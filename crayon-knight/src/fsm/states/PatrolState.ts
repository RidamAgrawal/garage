import { IState } from "@/fsm/IState";

/**
 * PatrolState — Enemy slowly wanders horizontally, then returns to idle.
 * Transitions: player in range → chase, patrol timer done → idle.
 */
export class PatrolState implements IState {
  private entity: any;
  private endTime = 0;
  private dirX = 1;

  constructor(entity: any) {
    this.entity = entity;
  }

  enter(): void {
    this.entity.play(`${this.entity.animPrefix}-run`, true);

    // Patrol for 2–3 seconds
    this.endTime = this.entity.scene.time.now + 2000 + Math.random() * 1000;

    // Pick horizontal direction, flip a coin
    this.dirX = Math.random() < 0.5 ? -1 : 1;
  }

  update(time: number): void {
    // Chase takes priority
    if (
      this.entity.isPlayerInRange &&
      this.entity.isPlayerInRange(this.entity.detectionRange ?? 200)
    ) {
      this.entity.fsm.transition("chase");
      return;
    }

    if (time >= this.endTime) {
      this.entity.fsm.transition("idle");
      return;
    }

    // Slow horizontal movement (40% of normal speed)
    this.entity.movement.move(this.dirX * 0.4, 0);
  }

  exit(): void {
    if (this.entity.body) {
      this.entity.body.setVelocity(0, 0);
    }
  }
}
