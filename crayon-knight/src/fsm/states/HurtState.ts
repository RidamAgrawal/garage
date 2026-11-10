import { IState } from "@/fsm/IState";

/**
 * Hurt state for entities.
 */
export class HurtState implements IState {
  private entity: any;
  private timerEvent: Phaser.Time.TimerEvent | null = null;

  constructor(entity: any) {
    this.entity = entity;
  }

  enter(): void {
    if (this.entity.body) {
      this.entity.body.setVelocity(0, 0);
    }

    // Hurt animation try karo, agar nahi hai toh idle play karo as fallback
    const hurtKey = `${this.entity.animPrefix}-hurt`;
    const anims = this.entity.scene.anims;
    if (anims.exists(hurtKey)) {
      this.entity.play(hurtKey, true);
    } else {
      // Fallback: idle animation play karo + red tint flash se damage dikhao
      this.entity.play(`${this.entity.animPrefix}-idle`, true);
    }

    // Visual feedback: red tint flash (damage feel)
    this.entity.setTint(0xff0000);
    this.entity.scene.time.delayedCall(150, () => {
      if (this.entity.active) {
        this.entity.clearTint();
      }
    });

    this.timerEvent = this.entity.scene.time.delayedCall(300, () => {
      if (this.entity.health && this.entity.health.isDead()) {
        this.entity.fsm.transition("dead");
      } else {
        this.entity.fsm.transition("idle");
      }
    });
  }

  update(): void {
    // No input processed during hurt
  }

  exit(): void {
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = null;
    }
  }
}
