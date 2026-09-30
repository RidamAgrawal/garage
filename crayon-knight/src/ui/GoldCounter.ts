import Phaser from 'phaser';
import { EventBus } from '@/events/EventBus';
import { EventKeys } from '@/constants/EventKeys';

/**
 * GoldCounter — Gold display UI component
 * 
 * Loose Coupling: Yeh component Player ko directly access nahi karta.
 * EventBus se GOLD_CHANGED event listen karta hai.
 * Jab GameScene gold update karta hai, yeh automatically show karta hai.
 */
export class GoldCounter {
    private scene: Phaser.Scene;
    private textObject: Phaser.GameObjects.Text;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        
        this.textObject = this.scene.add.text(x, y, '💰 0', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        });
        
        this.textObject.setScrollFactor(0);
        this.textObject.setDepth(100);

        // EventBus se gold change event listen karo
        EventBus.on(EventKeys.GOLD_CHANGED, this.handleGoldChanged, this);
    }

    private handleGoldChanged(amount: number): void {
        this.updateGold(amount);
    }

    public updateGold(amount: number): void {
        this.textObject.setText(`💰 ${amount}`);

        // Bounce animation on gold change
        this.scene.tweens.add({
            targets: this.textObject,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeInOut'
        });
    }

    public destroy(): void {
        EventBus.off(EventKeys.GOLD_CHANGED, this.handleGoldChanged, this);
        if (this.textObject) {
            this.textObject.destroy();
        }
    }
}
