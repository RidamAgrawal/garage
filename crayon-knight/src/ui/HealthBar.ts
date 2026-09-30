import Phaser from 'phaser';
import { EventBus } from '@/events/EventBus';
import { EventKeys } from '@/constants/EventKeys';

/**
 * HealthBar — Heart-based health display
 * 
 * Observer Pattern: HealthBar kisi ko directly check nahi karta.
 * EventBus pe listen karta hai PLAYER_HEALTH_CHANGED event ko.
 * Jab bhi player ka HP change ho, yeh automatically update hota hai.
 */
export class HealthBar {
    private scene: Phaser.Scene;
    private graphics: Phaser.GameObjects.Graphics;
    private x: number;
    private y: number;
    private heartSpacing: number = 24;
    private heartRadius: number = 8;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        this.graphics = this.scene.add.graphics();
        this.graphics.setScrollFactor(0);
        this.graphics.setDepth(100);
        
        // EventBus se health change event listen karo
        EventBus.on(EventKeys.PLAYER_HEALTH_CHANGED, this.handleHealthChanged, this);
        
        // Initial draw (3 hearts = 6 HP)
        this.updateHealth(6, 6);
    }

    /**
     * Event handler — EventBus emit karta hai (currentHp, maxHp) as separate args
     */
    private handleHealthChanged(currentHp: number, maxHp: number): void {
        this.updateHealth(currentHp, maxHp);
    }

    /**
     * Hearts draw karo based on current/max HP
     * 2 HP = 1 heart, so: 6 HP = ❤️❤️❤️, 5 HP = ❤️❤️💔, 3 HP = ❤️💔🖤
     */
    public updateHealth(currentHp: number, maxHp: number): void {
        this.graphics.clear();
        
        const totalHearts = Math.ceil(maxHp / 2);
        const fullHearts = Math.floor(currentHp / 2);
        const hasHalfHeart = currentHp % 2 !== 0;

        for (let i = 0; i < totalHearts; i++) {
            const cx = this.x + 10 + (i * this.heartSpacing);
            const cy = this.y + 10;

            if (i < fullHearts) {
                // Full Heart — red filled circle
                this.graphics.fillStyle(0xff0000, 1);
                this.graphics.fillCircle(cx, cy, this.heartRadius);
            } else if (i === fullHearts && hasHalfHeart) {
                // Half Heart — left half red, right half grey outline
                this.graphics.fillStyle(0xff0000, 1);
                this.graphics.beginPath();
                this.graphics.arc(cx, cy, this.heartRadius, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(270), false);
                this.graphics.fillPath();

                this.graphics.lineStyle(2, 0x888888, 1);
                this.graphics.beginPath();
                this.graphics.arc(cx, cy, this.heartRadius, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(90), false);
                this.graphics.strokePath();
            } else {
                // Empty Heart — grey outline
                this.graphics.lineStyle(2, 0x888888, 1);
                this.graphics.strokeCircle(cx, cy, this.heartRadius);
            }
        }
    }

    /**
     * Cleanup — EventBus listeners hamesha remove karo destroy mein
     * Warna memory leak hoga
     */
    public destroy(): void {
        EventBus.off(EventKeys.PLAYER_HEALTH_CHANGED, this.handleHealthChanged, this);
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
}
