import Phaser from "phaser";
import { Entity } from "@/entities/Entity";
import { StateMachine } from "@/fsm/StateMachine";
import { IdleState } from "@/fsm/states/IdleState";
import { RunState } from "@/fsm/states/RunState";
import { HurtState } from "@/fsm/states/HurtState";
import { PatrolState } from "@/fsm/states/PatrolState";
import { AttackState } from "@/fsm/states/AttackState";
import { DefendState } from "@/fsm/states/DefendState";
import { HealthComponent } from "@/components/HealthComponent";
import { MovementComponent } from "@/components/MovementComponent";
import { CombatComponent } from "@/components/CombatComponent";
import { EventBus } from "@/events/EventBus";
import { EventKeys } from "@/constants/EventKeys";
import type { Player } from "@/entities/player/Player";
import { attachHealthBar } from "@/ui/HealthBar";
import { ELEVATION_CONFIG, type EnemyConfig } from "@/config/BalanceConfig";
import { EnemyType } from "@/types/game.types";
import type {
  AnyProjectileConfig,
  AttackMode,
  EnemyDiedPayload,
  ProjectileFireRequest,
} from "@/types/combat.types";

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
  public readonly enemyType: EnemyType;
  public readonly attackMode: AttackMode;
  public readonly canDefend: boolean;

  protected target: Player | null = null;
  protected patrolTimer: number = 0;
  protected patrolDir: { x: number; y: number } = { x: 0, y: 0 };
  protected detectionRange: number;
  private projectileConfig?: AnyProjectileConfig;
  private scoreReward: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: EnemyConfig,
    enemyType: EnemyType,
  ) {
    super(scene, x, y, texture);

    // Animation prefix set karo — agar config mein nahi hai toh texture key hi use hoga
    this.animPrefix = config.animPrefix ?? texture;

    this.detectionRange = config.detectionRange;
    this.enemyType = enemyType;
    this.attackMode = config.attackMode;
    this.canDefend =
      config.canDefend === true &&
      scene.anims.exists(`${this.animPrefix}-defend`);
    this.projectileConfig = config.projectile;
    this.scoreReward = config.scoreReward;

    // Scale set karo (sprites 192px+ hain, game world 32px tile based)
    if (config.scale) {
      this.setScale(config.scale);
    }

    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      if('size' in config) {
        body.setSize(config.size.width, config.size.height);
      } else {
        body.setSize(40, 40);
      }
      if('offset' in config) {
        body.setOffset(config.offset.x, config.offset.y);
      } else {
        body.setOffset(76, 120);
      }
      body.setCollideWorldBounds(true);
    }

    // Components add karo — same pattern as Player
    this.health = new HealthComponent(config.maxHp);
    attachHealthBar(this, config.barTop);
    this.movement = new MovementComponent(config.speed);
    this.combat = new CombatComponent({
      attackPower: config.attackPower,
      cooldownMs: config.attackCooldownMs,
      attackRange: config.attackRange,
      knockbackForce: config.knockbackForce,
    });

    this.addComponent("health", this.health);
    this.addComponent("movement", this.movement);
    this.addComponent("combat", this.combat);

    // FSM setup
    this.fsm = new StateMachine();
    this.fsm.addState("idle", new IdleState(this));
    this.fsm.addState("patrol", new PatrolState(this));
    this.fsm.addState("chase", new RunState(this));
    this.fsm.addState("attack", new AttackState(this));
    this.fsm.addState("defend", new DefendState(this));
    this.fsm.addState("hurt", new HurtState(this));
    this.fsm.transition("idle");
  }

  setTarget(player: Player) {
    this.target = player;
  }

  protected preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    this.fsm.update(time, delta);
  }

  getDistanceToPlayer(): number {
    if (!this.target || !this.target.active) return Infinity;
    return Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y,
    );
  }

  isPlayerInRange(range: number): boolean {
    return this.getDistanceToPlayer() <= range;
  }

  getAttackRange(): number {
    return this.combat?.getAttackRange() ?? 0;
  }

  executeAttack() {
    this.combat.performAttack(this.scene.time.now);
    if (this.attackMode === "contact") return;
    if (this.attackMode === "ranged") {
      this.fireProjectile();
      return;
    }

    const range = this.getAttackRange();
    if (
      this.target &&
      this.target.active &&
      this.isPlayerInRange(range) &&
      !((this.target.elevation?.z ?? 0) > ELEVATION_CONFIG.HIT_Z)
    ) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.target.onDamaged(this.combat.getAttackPower(), {
        x: dx / dist,
        y: dy / dist,
      });
    }
  }

  private fireProjectile(): void {
    const config = this.projectileConfig;
    const fire = () => {
      const target = this.target;
      if (!config || !this.active || !target?.active || !this.body || !target.body)
        return;

      const from = this.body as Phaser.Physics.Arcade.Body;
      const to = target.body as Phaser.Physics.Arcade.Body;
      const request: ProjectileFireRequest = {
        x: from.center.x,
        y: from.center.y,
        targetX: to.center.x,
        targetY: to.center.y,
        damage: this.combat.getAttackPower(),
        config,
      };
      EventBus.emit(EventKeys.PROJECTILE_FIRE, request);
    };

    if (config?.fireDelayMs) {
      this.scene.time.delayedCall(config.fireDelayMs, fire);
    } else {
      fire();
    }
  }

  /** Player ki taraf move karo */
  chasePlayer() {
    if (!this.target || !this.target.active) return;

    // Stop moving when already within attack range so the attack state can fire cleanly
    const attackRange = this.getAttackRange();
    if (attackRange > 0 && this.isPlayerInRange(attackRange)) {
      this.movement.move(0, 0);
      return;
    }

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
  onDamaged(amount: number, knockbackDir: { x: number; y: number }) {
    if (this.health.isDead()) return;

    if (this.fsm.getCurrentStateKey() === "defend") {
      this.movement.applyKnockback(knockbackDir.x, knockbackDir.y, 40);
      return;
    }

    this.health.takeDamage(
      amount,
      new Phaser.Math.Vector2(knockbackDir.x, knockbackDir.y),
    );

    if (!this.health.isDead()) {
      this.fsm.transition("hurt");
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

    const body = this.body as Phaser.Physics.Arcade.Body;
    const payload: EnemyDiedPayload = {
      x: body.center.x,
      y: body.bottom,
      type: this.enemyType,
      scoreReward: this.scoreReward,
    };
    EventBus.emit(EventKeys.ENEMY_DIED, payload);

    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
