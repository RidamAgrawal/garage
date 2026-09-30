import { IState } from '@/fsm/IState';

/**
 * Run state for entities.
 * Hindi: State pattern ka use entity movement ko manage karne ke liye kiya gaya hai.
 */
export class RunState implements IState {
    private entity: any;

    constructor(entity: any) {
        this.entity = entity;
    }

    enter(): void {
        const textureKey = this.entity.texture ? this.entity.texture.key : 'default';
        this.entity.play(`${textureKey}-run`, true);
    }

    update(): void {
        if (this.entity.getController) {
            const controller = this.entity.getController();
            const dir = controller.getMovementDirection();
            
            if (dir.x === 0 && dir.y === 0) {
                this.entity.fsm.transition('idle');
                return;
            }
            
            if (controller.isAttackPressed()) {
                this.entity.fsm.transition('attack');
            }
            
            this.entity.handleMovement();
        } else if (this.entity.isEnemy) {
            if (!this.entity.isPlayerInRange || !this.entity.isPlayerInRange(250)) {
                this.entity.fsm.transition('idle');
            } else if (this.entity.isPlayerInRange(40)) {
                this.entity.fsm.transition('attack');
            } else {
                this.entity.chasePlayer();
            }
        }
    }

    exit(): void {}
}
