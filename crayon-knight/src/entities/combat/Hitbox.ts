import Phaser from 'phaser';

/**
 * Temporary attack hitbox for combat interactions.
 */
export class Hitbox extends Phaser.GameObjects.Zone {
    private damage: number;
    private knockbackForce: number;
    private sourceEntity: any;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        damage: number,
        knockbackForce: number,
        sourceEntity: any
    ) {
        super(scene, x, y, width, height);
        
        this.damage = damage;
        this.knockbackForce = knockbackForce;
        this.sourceEntity = sourceEntity;

        scene.add.existing(this);
        scene.physics.add.existing(this, false);
        
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);

        // Auto-destroy
        scene.time.delayedCall(150, () => {
            this.destroy();
        });
    }

    getDamage(): number {
        return this.damage;
    }

    getKnockbackForce(): number {
        return this.knockbackForce;
    }

    getSource(): any {
        return this.sourceEntity;
    }

    destroy(fromScene?: boolean): void {
        super.destroy(fromScene);
    }
}
