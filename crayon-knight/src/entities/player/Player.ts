import Phaser from 'phaser';
import { Entity } from '@/entities/Entity';
import { PlayerController } from './PlayerController';
import { StateMachine } from '@/fsm/StateMachine';
import { IdleState } from '@/fsm/states/IdleState';
import { RunState } from '@/fsm/states/RunState';
import { AttackState } from '@/fsm/states/AttackState';
import { HurtState } from '@/fsm/states/HurtState';
import { HealthComponent } from '@/components/HealthComponent';
import { MovementComponent } from '@/components/MovementComponent';
import { CombatComponent } from '@/components/CombatComponent';
import { AssetKeys } from '@/constants/AssetKeys';
import { PLAYER_CONFIG } from '@/config/BalanceConfig';

/**
 * Player Class — Inheritance ka sabse important example
 * 
 * Player extends Entity (jo Phaser.Physics.Arcade.Sprite extend karta hai)
 * Inheritance chain: Sprite → Entity → Player
 * 
 * Par behavior ke liye hum Composition use karte hain:
 * Player ke andar HealthComponent, MovementComponent, CombatComponent add hote hain
 * Isse code modular rehta hai aur reuse hota hai
 */
export class Player extends Entity {
    public fsm: StateMachine;
    public health: HealthComponent;
    public movement: MovementComponent;
    public combat: CombatComponent;
    
    private controller: PlayerController;
    private enemyGroup?: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, AssetKeys.PLAYER);
        
        // Physics body setup — hitbox ko sprite se chhota rakhte hain
        // taaki collision natural feel kare
        if (this.body) {
            const body = this.body as Phaser.Physics.Arcade.Body;
            body.setSize(20, 24);
            body.setOffset(6, 4);
            body.setCollideWorldBounds(true);
        }
        this.setDepth(5);
        
        // === Composition Pattern ===
        // Har component ek specific behavior handle karta hai
        // Entity.addComponent() se components register hote hain
        this.health = new HealthComponent(PLAYER_CONFIG.maxHp, PLAYER_CONFIG.iframeDurationMs);
        this.movement = new MovementComponent(PLAYER_CONFIG.speed);
        this.combat = new CombatComponent({
            attackPower: PLAYER_CONFIG.attackPower,
            cooldownMs: PLAYER_CONFIG.attackCooldownMs,
            attackRange: PLAYER_CONFIG.attackRange,
            knockbackForce: PLAYER_CONFIG.knockbackForce,
        });

        this.addComponent('health', this.health);
        this.addComponent('movement', this.movement);
        this.addComponent('combat', this.combat);
        
        // Input Controller — Player ke input ko alag class mein handle karna
        // Single Responsibility Principle: Player class input reading nahi karti
        this.controller = new PlayerController(scene);
        
        // === State Machine Setup ===
        // Complex if-else chains ki jagah, har behavior ek State class mein hai
        this.fsm = new StateMachine();
        this.fsm.addState('idle', new IdleState(this));
        this.fsm.addState('run', new RunState(this));
        this.fsm.addState('attack', new AttackState(this));
        this.fsm.addState('hurt', new HurtState(this));
        this.fsm.transition('idle');
    }

    /**
     * preUpdate har frame call hota hai
     * Pehle Entity ka preUpdate (components update karta hai)
     * Phir FSM update (current state ka update chalta hai)
     */
    protected preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        this.fsm.update(time, delta);
    }

    /**
     * Movement handle karo — Controller se direction lo, MovementComponent ko do
     * Called by RunState.update()
     */
    handleMovement() {
        const dir = this.controller.getMovementDirection();
        this.movement.move(dir.x, dir.y);
    }

    /**
     * Melee attack execute karo
     * 1. Facing direction figure out karo
     * 2. Ek temporary hitbox zone banao facing direction mein
     * 3. Enemy group ke saath overlap check karo
     * 4. 150ms baad hitbox destroy karo
     */
    executeAttack() {
        const facingVec = this.movement.getFacingVector();
        const offsetX = facingVec.x * 24;
        const offsetY = facingVec.y * 24;
        
        // Temporary attack zone create karo
        const zone = this.scene.add.zone(this.x + offsetX, this.y + offsetY, 30, 30);
        this.scene.physics.add.existing(zone, false);
        
        const body = zone.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(false);
        }
        
        // Enemy group ke saath overlap check — agar hit ho toh damage do
        if (this.enemyGroup) {
            this.scene.physics.add.overlap(zone, this.enemyGroup, (_hitbox, enemyObj) => {
                const enemy = enemyObj as any;
                if (enemy.onDamaged && enemy.active) {
                    const knockbackDir = {
                        x: facingVec.x,
                        y: facingVec.y
                    };
                    enemy.onDamaged(this.combat.getAttackPower(), knockbackDir);
                }
            });
        }
        
        // Hitbox ko 150ms baad destroy karo (attack window)
        this.scene.time.delayedCall(150, () => {
            if (zone && zone.active) {
                zone.destroy();
            }
        });
        
        // Combat cooldown start karo
        this.combat.performAttack(this.scene.time.now);
    }

    /**
     * Jab player ko damage lage
     * @param amount - Kitna damage
     * @param knockbackDir - Kis direction mein dhakka
     */
    onDamaged(amount: number, knockbackDir: { x: number, y: number }) {
        this.health.takeDamage(amount, new Phaser.Math.Vector2(knockbackDir.x, knockbackDir.y));
        if (!this.health.isDead()) {
            this.fsm.transition('hurt');
            this.movement.applyKnockback(knockbackDir.x, knockbackDir.y, PLAYER_CONFIG.knockbackForce);
        }
    }

    /** Enemy group set karo taaki attack hitbox overlap check ho sake */
    setEnemyGroup(group: Phaser.Physics.Arcade.Group) {
        this.enemyGroup = group;
    }

    /** Controller getter — States ko input check karne ke liye chahiye */
    getController(): PlayerController {
        return this.controller;
    }

    destroy(fromScene?: boolean) {
        if (this.controller) {
            this.controller.destroy();
        }
        super.destroy(fromScene);
    }
}
