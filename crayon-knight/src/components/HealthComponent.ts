import Phaser from 'phaser';
import { IComponent } from '@/components/IComponent';
import { Entity } from '@/entities/Entity';
import { EventBus } from '@/events/EventBus';
import { EventKeys } from '@/constants/EventKeys';

/**
 * HealthComponent — Entity ka HP manage karta hai
 * 
 * Encapsulation ka example: currentHp private hai,
 * bahar se directly change nahi ho sakta. Sirf takeDamage() aur heal() se hoga.
 */
export class HealthComponent implements IComponent {
    private entity!: Entity;
    private currentHp: number;
    private maxHp: number;
    private isInvulnerable: boolean = false;
    private iframeDuration: number;

    constructor(maxHp: number, iframeDurationMs: number = 800) {
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.iframeDuration = iframeDurationMs;
    }

    init(entity: any): void {
        this.entity = entity as Entity;
    }

    update(_time: number, _delta: number): void {
        // Health doesn't need per-frame updates
    }

    /**
     * Damage apply karta hai with i-frames and knockback
     * I-frames = Invincibility frames — jab damage liya, thodi der ke liye
     * dobara damage nahi lagega (jaise Mario mein hota hai)
     */
    takeDamage(amount: number, knockbackDir?: Phaser.Math.Vector2): void {
        if (this.isInvulnerable || this.isDead()) return;

        this.currentHp = Phaser.Math.Clamp(this.currentHp - amount, 0, this.maxHp);
        
        // I-frame trigger — flashing tween + temporary invulnerability
        this.isInvulnerable = true;
        
        if (this.entity.scene) {
            this.entity.scene.tweens.add({
                targets: this.entity,
                alpha: 0.2,
                yoyo: true,
                repeat: 3,
                duration: this.iframeDuration / 8,
                onComplete: () => {
                    this.isInvulnerable = false;
                    if (this.entity.active) {
                        this.entity.alpha = 1;
                    }
                }
            });
        }

        // Knockback apply karo agar direction diya hai
        if (knockbackDir && this.entity.body) {
            const kbForce = 200;
            this.entity.setVelocity(knockbackDir.x * kbForce, knockbackDir.y * kbForce);
        }

        // Event emit — UI ko bata do HP change hua
        EventBus.emit(EventKeys.PLAYER_HEALTH_CHANGED, this.currentHp, this.maxHp);

        if (this.currentHp <= 0) {
            EventBus.emit(EventKeys.PLAYER_DIED, this.entity);
            EventBus.emit(EventKeys.ENEMY_DIED, this.entity);
        }
    }

    heal(amount: number): void {
        if (this.isDead()) return;
        this.currentHp = Phaser.Math.Clamp(this.currentHp + amount, 0, this.maxHp);
        EventBus.emit(EventKeys.PLAYER_HEALTH_CHANGED, this.currentHp, this.maxHp);
    }

    isDead(): boolean {
        return this.currentHp <= 0;
    }

    getCurrentHp(): number {
        return this.currentHp;
    }

    getMaxHp(): number {
        return this.maxHp;
    }

    destroy(): void {
        // Cleanup — no direct listeners to remove
    }
}
