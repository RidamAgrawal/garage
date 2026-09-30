import { IState } from '@/fsm/IState';

/**
 * Idle state for entities (Player/Enemy).
 * Hindi: State pattern ka use karke hum idle behavior encapsulate karte hain.
 */
export class IdleState implements IState {
    private entity: any;

    constructor(entity: any) {
        this.entity = entity;
    }

    enter(): void {
        const textureKey = this.entity.texture ? this.entity.texture.key : 'default';
        this.entity.play(`${textureKey}-idle`, true);
        if (this.entity.body) {
            this.entity.body.setVelocity(0, 0);
        }
    }

    update(): void {
        if (this.entity.getController) {
            // Player logic
            const controller = this.entity.getController();
            const dir = controller.getMovementDirection();
            if (dir.x !== 0 || dir.y !== 0) {
                this.entity.fsm.transition('run');
                return;
            }
            if (controller.isAttackPressed()) {
                this.entity.fsm.transition('attack');
            }
        } else if (this.entity.isEnemy) {
            // Enemy AI logic
            if (this.entity.isPlayerInRange && this.entity.isPlayerInRange(200)) {
                this.entity.fsm.transition('chase');
            }
        }
    }

    exit(): void {}
}
