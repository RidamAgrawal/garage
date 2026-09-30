import { IComponent } from '@/components/IComponent';
import { Entity } from '@/entities/Entity';

export interface CombatConfig {
    attackPower: number;
    cooldownMs: number;
    attackRange: number;
    knockbackForce: number;
}

export class CombatComponent implements IComponent {
    // Entity reference — future use for combat calculations
    protected entity!: Entity;
    private attackPower: number;
    private cooldownMs: number;
    private lastAttackTime: number = 0;
    private attackRange: number;
    private knockbackForce: number;

    constructor(config: CombatConfig) {
        this.attackPower = config.attackPower;
        this.cooldownMs = config.cooldownMs;
        this.attackRange = config.attackRange;
        this.knockbackForce = config.knockbackForce;
    }

    init(_entity: any): void {
        this.entity = _entity as Entity;
    }

    update(_time: number, _delta: number): void {
        // Empty
    }

    canAttack(time: number): boolean {
        return (time - this.lastAttackTime) >= this.cooldownMs;
    }

    performAttack(time: number): void {
        this.lastAttackTime = time;
    }

    getAttackPower(): number {
        return this.attackPower;
    }

    getAttackRange(): number {
        return this.attackRange;
    }

    getKnockbackForce(): number {
        return this.knockbackForce;
    }

    destroy(): void {
        // Cleanup
    }
}
