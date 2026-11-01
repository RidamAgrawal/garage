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
        
        // Attack animation play karo — agar nahi hai toh idle se kaam chalao
        const attackKey = `${this.entity.animPrefix}-attack`;
        const anims = this.entity.scene.anims;
        if (anims.exists(attackKey)) {
            this.entity.play(attackKey, true);
            // Animation complete hone par idle mein jaao
            this.entity.once('animationcomplete', () => {
                this.entity.fsm.transition('idle');
            });
        } else {
            // Fallback: idle play karo, timer se attack duration simulate karo
            this.entity.play(`${this.entity.animPrefix}-idle`, true);
            this.entity.scene.time.delayedCall(400, () => {
                if (this.entity.active) {
                    this.entity.fsm.transition('idle');
                }
            });
        }
        
        if (this.entity.executeAttack) {
            this.entity.executeAttack();
        }
    }

    update(): void {
        // No movement allowed during attack
    }

    exit(): void {
        this.entity.off('animationcomplete');
    }
}
