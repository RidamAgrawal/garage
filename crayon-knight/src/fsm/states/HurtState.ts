import { IState } from '@/fsm/IState';

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
        const textureKey = this.entity.texture ? this.entity.texture.key : 'default';
        this.entity.play(`${textureKey}-hurt`, true);
        
        this.timerEvent = this.entity.scene.time.delayedCall(300, () => {
            if (this.entity.health && this.entity.health.isDead()) {
                this.entity.fsm.transition('dead');
            } else {
                this.entity.fsm.transition('idle');
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
