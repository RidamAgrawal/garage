import Phaser from 'phaser';
import { IComponent } from '@/components/IComponent';
import { Entity } from '@/entities/Entity';
import { Direction } from '@/types/game.types';

/**
 * MovementComponent — Entity ki movement handle karta hai
 * 
 * Composition pattern: Yeh component kisi bhi Entity mein add ho sakta hai
 * Player, Enemy, NPC — sabke liye same movement logic reuse hota hai
 */
export class MovementComponent implements IComponent {
    private entity!: Entity;
    private speed: number;
    private facing: Direction = Direction.DOWN;

    constructor(speed: number) {
        this.speed = speed;
    }

    init(entity: any): void {
        this.entity = entity as Entity;
    }

    update(_time: number, _delta: number): void {
        // Movement is triggered externally via move() — no per-frame auto-move
    }

    /**
     * Entity ko given direction mein move karo
     * Diagonal normalization — agar dono axes pe move ho raha hai toh
     * speed ko 0.707 se multiply karo taaki diagonal speed same rahe
     */
    move(dirX: number, dirY: number): void {
        let vx = dirX;
        let vy = dirY;
        
        // Diagonal normalization (Pythagoras: 1/√2 ≈ 0.707)
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }
        
        if (this.entity.body) {
            this.entity.setVelocity(vx * this.speed, vy * this.speed);
        }

        // Facing direction update — bada axis decide karega direction
        if (Math.abs(dirX) > Math.abs(dirY)) {
            this.facing = dirX > 0 ? Direction.RIGHT : Direction.LEFT;
        } else if (Math.abs(dirY) > Math.abs(dirX)) {
            this.facing = dirY > 0 ? Direction.DOWN : Direction.UP;
        }

        // Sprite flip based on horizontal direction
        if (this.facing === Direction.LEFT) {
            this.entity.setFlipX(true);
        } else if (this.facing === Direction.RIGHT) {
            this.entity.setFlipX(false);
        }
    }

    stop(): void {
        if (this.entity.body) {
            this.entity.setVelocity(0, 0);
        }
    }

    /**
     * Knockback apply karo — jab damage laga toh entity ko push karo
     * @param dirX - X direction (-1 to 1)
     * @param dirY - Y direction (-1 to 1)
     * @param force - Knockback force in pixels/sec
     */
    applyKnockback(dirX: number, dirY: number, force: number): void {
        if (this.entity.body) {
            this.entity.setVelocity(dirX * force, dirY * force);
        }
    }

    getFacing(): Direction {
        return this.facing;
    }

    /**
     * Facing direction ko vector mein convert karo
     * Useful for attack hitbox placement
     */
    getFacingVector(): Phaser.Math.Vector2 {
        switch (this.facing) {
            case Direction.UP: return new Phaser.Math.Vector2(0, -1);
            case Direction.DOWN: return new Phaser.Math.Vector2(0, 1);
            case Direction.LEFT: return new Phaser.Math.Vector2(-1, 0);
            case Direction.RIGHT: return new Phaser.Math.Vector2(1, 0);
            default: return new Phaser.Math.Vector2(0, 1);
        }
    }

    getSpeed(): number {
        return this.speed;
    }

    destroy(): void {
        // Cleanup
    }
}
