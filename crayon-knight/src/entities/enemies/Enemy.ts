import Phaser from 'phaser';
import { Entity } from '@/entities/Entity';
import { StateMachine } from '@/fsm/StateMachine';
import { IdleState } from '@/fsm/states/IdleState';
import { RunState } from '@/fsm/states/RunState';
import { HurtState } from '@/fsm/states/HurtState';
import { HealthComponent } from '@/components/HealthComponent';
import { MovementComponent } from '@/components/MovementComponent';
import { CombatComponent } from '@/components/CombatComponent';
import { EventBus } from '@/events/EventBus';
import { EventKeys } from '@/constants/EventKeys';
import type { Player } from '@/entities/player/Player';

/**
 * Enemy Base Class — Polymorphism ka example
 * 
 * Hindi: Yeh base enemy class hai. Skeleton, Slime, Goblin — sab isse extend karenge.
 * Har enemy ka behavior thoda alag hoga (polymorphism) par basic structure same hai.
 * 
 * Inheritance: Enemy extends Entity
 * Composition: Components se behavior attach hota hai
 */
export class Enemy extends Entity {
    public fsm: StateMachine;
    public isEnemy = true;
    public health: HealthComponent;
    public movement: MovementComponent;
    public combat: CombatComponent;
    public enemyType: string = 'enemy';
    
    protected target: Player | null = null;
    protected patrolTimer: number = 0;
    protected patrolDir: { x: number, y: number } = { x: 0, y: 0 };
    protected detectionRange: number;
    protected goldDrop: { min: number, max: number };

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        config: {
            maxHp: number;
            speed: number;
            attackPower: number;
            attackCooldownMs: number;
            attackRange: number;
            knockbackForce: number;
            detectionRange: number;
            goldDrop: { min: number; max: number };
        }
    ) {
        super(scene, x, y, texture);
        
        this.setDepth(4);
        this.detectionRange = config.detectionRange;
        this.goldDrop = config.goldDrop;

        if (this.body) {
            const body = this.body as Phaser.Physics.Arcade.Body;
            body.setSize(24, 24);
            body.setOffset(4, 4);
            body.setCollideWorldBounds(true);
        }
        
        // Components add karo — same pattern as Player
        this.health = new HealthComponent(config.maxHp);
        this.movement = new MovementComponent(config.speed);
        this.combat = new CombatComponent({
            attackPower: config.attackPower,
            cooldownMs: config.attackCooldownMs,
            attackRange: config.attackRange,
            knockbackForce: config.knockbackForce,
        });
        
        this.addComponent('health', this.health);
        this.addComponent('movement', this.movement);
        this.addComponent('combat', this.combat);
        
        // FSM setup
        this.fsm = new StateMachine();
        this.fsm.addState('idle', new IdleState(this));
        this.fsm.addState('chase', new RunState(this));
        this.fsm.addState('hurt', new HurtState(this));
        this.fsm.transition('idle');
    }

    setTarget(player: Player) {
        this.target = player;
    }

    protected preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        this.fsm.update(time, delta);
        
        // Simple AI: agar idle hai toh patrol karo, player range mein aaye toh chase karo
        const stateKey = this.fsm.getCurrentStateKey();
        if (stateKey === 'idle') {
            if (this.isPlayerInRange(this.detectionRange)) {
                this.fsm.transition('chase');
            } else {
                this.patrol(time);
            }
        } else if (stateKey === 'chase') {
            if (!this.isPlayerInRange(this.detectionRange * 2)) {
                this.fsm.transition('idle');
            } else {
                this.chasePlayer();
            }
        }
    }

    getDistanceToPlayer(): number {
        if (!this.target || !this.target.active) return Infinity;
        return Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    }

    isPlayerInRange(range: number): boolean {
        return this.getDistanceToPlayer() <= range;
    }

    /** Player ki taraf move karo */
    chasePlayer() {
        if (!this.target || !this.target.active) return;
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        this.movement.move(dx / dist, dy / dist);
    }

    /** Random direction mein slowly move karo — patrol behavior */
    patrol(time: number) {
        if (time > this.patrolTimer) {
            const angle = Math.random() * Math.PI * 2;
            this.patrolDir = { x: Math.cos(angle), y: Math.sin(angle) };
            this.patrolTimer = time + 2000 + Math.random() * 1000;
        }
        this.movement.move(this.patrolDir.x * 0.4, this.patrolDir.y * 0.4);
    }

    /** Jab enemy ko damage lage */
    onDamaged(amount: number, knockbackDir: { x: number, y: number }) {
        if (this.health.isDead()) return;
        
        this.health.takeDamage(amount, new Phaser.Math.Vector2(knockbackDir.x, knockbackDir.y));
        
        if (!this.health.isDead()) {
            this.fsm.transition('hurt');
            this.movement.applyKnockback(knockbackDir.x, knockbackDir.y, 150);
        } else {
            this.onDeath();
        }
    }

    /** Death handling — gold drop, event emit, destroy */
    onDeath() {
        if (this.body) {
            (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
            (this.body as Phaser.Physics.Arcade.Body).checkCollision.none = true;
        }
        
        // Gold drop emit karo — GameScene handle karega
        const goldAmount = Phaser.Math.Between(this.goldDrop.min, this.goldDrop.max);
        EventBus.emit(EventKeys.ENEMY_DIED, { gold: goldAmount, enemyType: this.enemyType });
        
        // Fade out and destroy
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}
