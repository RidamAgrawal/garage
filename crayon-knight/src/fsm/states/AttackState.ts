import { IState } from '@/fsm/IState';

/**
 * Attack state for entities.
 */
export class AttackState implements IState {
    private entity: any;

    constructor(entity: any) {
        this.entity = entity;
    }

    enter(): void {
        if (this.entity.body) {
            this.entity.body.setVelocity(0, 0); // Stop movement
        }
        const textureKey = this.entity.texture ? this.entity.texture.key : 'default';
        this.entity.play(`${textureKey}-attack`, true);
        
        if (this.entity.executeAttack) {
            this.entity.executeAttack();
        }
        
        this.entity.once('animationcomplete', () => {
            this.entity.fsm.transition('idle');
        });
    }

    update(): void {
        // No movement allowed during attack
    }

    exit(): void {
        this.entity.off('animationcomplete');
    }
}
