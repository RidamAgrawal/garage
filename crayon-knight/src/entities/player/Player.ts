import Phaser from "phaser";
import { Entity } from "@/entities/Entity";
import { PlayerController } from "./PlayerController";
import { StateMachine } from "@/fsm/StateMachine";
import { IdleState } from "@/fsm/states/IdleState";
import { RunState } from "@/fsm/states/RunState";
import { AttackState } from "@/fsm/states/AttackState";
import { HurtState } from "@/fsm/states/HurtState";
import { HealthComponent } from "@/components/HealthComponent";
import { MovementComponent } from "@/components/MovementComponent";
import { CombatComponent } from "@/components/CombatComponent";
import { AssetKeys } from "@/constants/AssetKeys";
import { ELEVATION_CONFIG, PLAYER_CONFIG } from "@/config/BalanceConfig";
import { DefendState } from "@/fsm/states/DefendState";
import { JumpState } from "@/fsm/states/JumpState";
import { EventBus } from "@/events/EventBus";
import { EventKeys } from "@/constants/EventKeys";
import {
  TerrainQuery,
  ElevationComponent,
} from "@/components/ElevationComponent";

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
  public elevation: ElevationComponent | null = null;

  private controller: PlayerController;
  private enemyGroup?: Phaser.Physics.Arcade.Group;
  private lastAttackTime = 0;
  private lastAttackAnim: "attack" | "attack2" = "attack";
  public hasShield = false;
  private isFallingInWater = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, AssetKeys.WARRIOR_IDLE);

    // Animation prefix — FSM states isse use karke animation build karte hain
    // e.g. "warrior" → "warrior-idle", "warrior-run", "warrior-attack"
    this.animPrefix = "warrior";

    // Physics body setup — hitbox ko sprite se chhota rakhte hain
    // taaki collision natural feel kare
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setSize(24, 16);
      body.setOffset(84, 112);
      this.setScale(0.5);
      body.setCollideWorldBounds(true);
    }
    this.setDepth(5);

    // === Composition Pattern ===
    // Har component ek specific behavior handle karta hai
    // Entity.addComponent() se components register hote hain
    this.health = new HealthComponent(
      PLAYER_CONFIG.maxHp,
      PLAYER_CONFIG.iframeDurationMs,
    );
    this.movement = new MovementComponent(PLAYER_CONFIG.speed);
    this.combat = new CombatComponent({
      attackPower: PLAYER_CONFIG.attackPower,
      cooldownMs: PLAYER_CONFIG.attackCooldownMs,
      attackRange: PLAYER_CONFIG.attackRange,
      knockbackForce: PLAYER_CONFIG.knockbackForce,
    });

    this.addComponent("health", this.health);
    this.addComponent("movement", this.movement);
    this.addComponent("combat", this.combat);

    // Input Controller — Player ke input ko alag class mein handle karna
    // Single Responsibility Principle: Player class input reading nahi karti
    this.controller = new PlayerController(scene);

    // === State Machine Setup ===
    // Complex if-else chains ki jagah, har behavior ek State class mein hai
    this.fsm = new StateMachine();
    this.fsm.addState("idle", new IdleState(this));
    this.fsm.addState("run", new RunState(this));
    this.fsm.addState("attack", new AttackState(this));
    this.fsm.addState("attack2", new AttackState(this));
    this.fsm.addState("hurt", new HurtState(this));
    this.fsm.addState("defend", new DefendState(this));
    this.fsm.addState("jump", new JumpState(this));
    this.fsm.transition("idle");
  }

  /**
   * preUpdate har frame call hota hai
   * Pehle Entity ka preUpdate (components update karta hai)
   * Phir FSM update (current state ka update chalta hai)
   */
  protected preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.isFallingInWater) {
      this.fsm.update(time, delta);
    }
  }

  /**
   * Movement handle karo — Controller se direction lo, MovementComponent ko do
   * Called by RunState.update()
   */
  handleMovement() {
    if (this.isFallingInWater) return;
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
    const zone = this.scene.add.zone(
      this.x + offsetX,
      this.y + offsetY,
      30,
      30,
    );
    this.scene.physics.add.existing(zone, false);

    const body = zone.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
    }

    // Enemy group ke saath overlap check — agar hit ho toh damage do
    if (this.enemyGroup) {
      this.scene.physics.add.overlap(
        zone,
        this.enemyGroup,
        (_hitbox, enemyObj) => {
          const enemy = enemyObj as any;
          if (enemy.onDamaged && enemy.active) {
            const knockbackDir = {
              x: facingVec.x,
              y: facingVec.y,
            };
            enemy.onDamaged(this.combat.getAttackPower(), knockbackDir);
          }
        },
      );
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
  onDamaged(amount: number, knockbackDir: { x: number; y: number }) {
    if (this.fsm.getCurrentStateKey() === "defend") {
      // Defending blocks damage; apply reduced knockback
      this.movement.applyKnockback(
        knockbackDir.x,
        knockbackDir.y,
        PLAYER_CONFIG.knockbackForce * 0.3,
      );
      return;
    }

    this.health.takeDamage(
      amount,
      new Phaser.Math.Vector2(knockbackDir.x, knockbackDir.y),
    );
    if (!this.health.isDead()) {
      this.fsm.transition("hurt");
      this.movement.applyKnockback(
        knockbackDir.x,
        knockbackDir.y,
        PLAYER_CONFIG.knockbackForce,
      );
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
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

  attack() {
    if (this.isFallingInWater) return;
    const now = this.scene.time.now;
    let pick: "attack" | "attack2" = "attack";

    if (now - this.lastAttackTime <= 500) {
      // Rapid: alternate from whatever was last used
      pick = this.lastAttackAnim === "attack" ? "attack2" : "attack";
    }

    this.lastAttackTime = now;
    this.lastAttackAnim = pick;
    this.fsm.transition(pick);
  }

  isAttacking(): boolean {
    const key = this.fsm.getCurrentStateKey();
    return key === "attack" || key === "attack2";
  }

  public defend(): void {
    if (this.isFallingInWater || !this.hasShield) return;
    this.fsm.transition("defend");
  }

  override play(
    key:
      | string
      | Phaser.Animations.Animation
      | Phaser.Types.Animations.PlayAnimationConfig,
    ignoreIfPlaying?: boolean,
  ): this {
    if (this.hasShield && typeof key === "string") {
      if (key === AssetKeys.WARRIOR_IDLE)
        key = AssetKeys.WARRIOR_IDLE_WITH_SHIELD;
      else if (key === AssetKeys.WARRIOR_RUN)
        key = AssetKeys.WARRIOR_RUN_WITH_SHIELD;
    }
    return super.play(key, ignoreIfPlaying);
  }

  pickupShield(): void {
    if (this.hasShield) return;
    this.hasShield = true;

    // Immediately replay current idle/run animation with shield
    const curKey = this.fsm.getCurrentStateKey();
    if (curKey === "idle" || curKey === "run") {
      this.play(`${this.animPrefix}-${curKey}`);
    }

    EventBus.emit(EventKeys.SHIELD_PICKED_UP);
  }

  public attachElevation(terrainAt: TerrainQuery): void {
    this.elevation = new ElevationComponent(terrainAt, () =>
      this.fellInWater(),
    );
    this.addComponent("elevation", this.elevation); // call after body.setSize/setOffset
  }

  public jump(): void {
    if (this.isFallingInWater) return;
    if (this.elevation?.isGrounded) this.fsm.transition("jump");
  }

  private fellInWater(): void {
    if (this.isFallingInWater) return;
    this.isFallingInWater = true;

    this.movement.stop();
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }

    // Water splash effect
    const splash = this.scene.add.sprite(
      this.x,
      this.y,
      AssetKeys.SPLASH_EFFECT,
    );
    splash.setScale(0.7);
    splash.setDepth(this.depth + 1);
    splash.play(AssetKeys.SPLASH_EFFECT);
    splash.once("animationcomplete", () => {
      splash.destroy();
    });

    // Fade player out like defeated enemies
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.health.takeDamage(ELEVATION_CONFIG.WATER_DAMAGE);
        if (!this.health.isDead()) {
          this.elevation?.respawn();
          this.alpha = 1;
          this.fsm.transition("idle");
        }
        this.isFallingInWater = false;
      },
    });
  }

  destroy(fromScene?: boolean) {
    if (!this.scene) return;
    if (this.controller) {
      this.controller.destroy();
    }
    super.destroy(fromScene);
  }
}
