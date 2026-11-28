import Phaser from "phaser";
import { EventKeys } from "@/constants/EventKeys";
import { EventBus } from "@/events/EventBus";
import { PROJECTILE_CONFIG } from "@/config/BalanceConfig";
import type {
  AnyProjectileConfig,
  ProjectileBehavior,
  ProjectileExplodedPayload,
  ProjectileFireRequest,
} from "@/types/combat.types";

type ProjectileState = "linear" | "flight" | "fuse" | "exploding";

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public behavior: ProjectileBehavior = "linear";
  public damage = 0;
  public config?: AnyProjectileConfig;
  public state: ProjectileState = "linear";
  public updateProjectile?: (
    projectile: Projectile,
    now: number,
    delta: number,
  ) => void;
  public expiresAt = 0;
  public launchAt = 0;
  public flightMs = 0;
  public landedAt = 0;
  public fuseEndsAt = 0;
  public startX = 0;
  public startY = 0;
  public targetX = 0;
  public targetY = 0;

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.updateProjectile?.(this, this.scene.time.now, delta);
  }
}

export class ProjectileSystem {
  public group!: Phaser.Physics.Arcade.Group;

  private scene?: Phaser.Scene;
  private boundaryCollider?: Phaser.Physics.Arcade.Collider;

  private onFire = (request: ProjectileFireRequest): void => {
    this.fire(request);
  };

  init(scene: Phaser.Scene): void {
    this.scene = scene;
    this.group = scene.physics.add.group({
      classType: Projectile,
      maxSize: PROJECTILE_CONFIG.POOL_SIZE,
      runChildUpdate: true,
      allowGravity: false,
    });
    EventBus.on(EventKeys.PROJECTILE_FIRE, this.onFire);
  }

  attachBoundaries(boundaries: Phaser.Physics.Arcade.StaticGroup): void {
    if (!this.scene) return;
    this.boundaryCollider = this.scene.physics.add.collider(
      this.group,
      boundaries,
      (projectile) => this.release(projectile as Projectile),
      (_projectile, wall) =>
        (wall as Phaser.GameObjects.Zone).getData("boundaryType") === "cliff",
    );
  }

  detonate(projectile: Projectile): void {
    if (
      !this.scene ||
      !projectile.active ||
      projectile.behavior !== "explosive" ||
      projectile.state === "exploding"
    ) {
      return;
    }

    const config = projectile.config;
    if (!config || config.behavior !== "explosive") return;
    projectile.state = "exploding";
    projectile.setRotation(0);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.stop();
    body.enable = false;

    const payload: ProjectileExplodedPayload = {
      x: projectile.x,
      y: projectile.y,
      radius: config.explodeRadius ?? PROJECTILE_CONFIG.EXPLODE_RADIUS,
      damage: projectile.damage,
    };
    EventBus.emit(EventKeys.PROJECTILE_EXPLODED, payload);

    if (config.explodeAnimKey && this.scene.anims.exists(config.explodeAnimKey)) {
      projectile.play(config.explodeAnimKey, true);
      projectile.once(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        () => this.release(projectile),
      );
    } else {
      this.release(projectile);
    }
  }

  release(projectile: Projectile): void {
    projectile.removeAllListeners(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
    );
    const body = projectile.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.stop();
      body.enable = false;
    }
    projectile.stop();
    projectile.config = undefined;
    projectile.updateProjectile = undefined;
    projectile.setActive(false).setVisible(false);
  }

  destroy(): void {
    EventBus.off(EventKeys.PROJECTILE_FIRE, this.onFire);
    this.boundaryCollider?.destroy();
    this.group?.destroy(true);
    this.scene = undefined;
  }

  private fire(request: ProjectileFireRequest): void {
    if (!this.scene) return;
    const config = request.config;
    const projectile = this.group.get(
      request.x,
      request.y,
      config.animKey,
    ) as Projectile | null;
    if (!projectile) return;

    const x = request.x + config.originOffset.x;
    const y = request.y + config.originOffset.y;
    projectile
      .setTexture(config.animKey)
      .setPosition(x, y)
      .setScale(config.scale ?? 1);
    projectile.setActive(true).setVisible(true);
    projectile.removeAllListeners(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
    );

    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(x, y);
    body.setAllowGravity(false);
    body.setCollideWorldBounds(false);
    if (config.collision.shape === "circle") {
      const radius = config.collision.radius ?? PROJECTILE_CONFIG.BODY_RADIUS;
      body.setCircle(
        radius,
        projectile.width / 2 - radius,
        projectile.height / 2 - radius,
      );
    } else {
      const width = config.collision.width ?? projectile.width;
      const height = config.collision.height ?? projectile.height;
      body.setSize(width, height, true);
    }
    body.setVelocity(0, 0);

    projectile.config = config;
    projectile.behavior = config.behavior;
    projectile.damage = request.damage;
    projectile.updateProjectile = this.updateProjectile;
    projectile.setRotation(0);
    projectile.play(config.animKey, true);

    const now = this.scene.time.now;
    projectile.targetX = request.targetX;
    projectile.targetY = request.targetY;

    if (config.behavior === "linear") {
      const dx = request.targetX - x;
      const dy = request.targetY - y;
      const distance = Math.hypot(dx, dy) || 1;
      body.setVelocity(
        (dx / distance) * config.speed,
        (dy / distance) * config.speed,
      );
      projectile.setRotation(Math.atan2(dy, dx));
      projectile.state = "linear";
      projectile.expiresAt =
        now + (config.lifetimeMs ?? PROJECTILE_CONFIG.LIFETIME_MS);
      return;
    }

    projectile.state = "flight";
    projectile.startX = x;
    projectile.startY = y;
    projectile.launchAt = now;
    const distance = Phaser.Math.Distance.Between(
      x,
      y,
      request.targetX,
      request.targetY,
    );
    const fallbackFlightMs = Math.max(1, (distance / config.speed) * 1000);
    projectile.flightMs =
      config.behavior === "bounce"
        ? 1
        : (config.flightMs ?? fallbackFlightMs);
  }

  private updateProjectile = (
    projectile: Projectile,
    now: number,
    delta: number,
  ): void => {
    const config = projectile.config;
    if (!config || !projectile.active) return;

    const body = projectile.body as Phaser.Physics.Arcade.Body;
    if (projectile.state === "linear") {
      projectile.setDepth(body.bottom);
      if (now >= projectile.expiresAt) this.release(projectile);
      return;
    }

    if (projectile.state === "flight") {
      const t = Math.min(1, (now - projectile.launchAt) / projectile.flightMs);
      const arcHeight =
        config.behavior === "arc" || config.behavior === "explosive"
          ? (config.arcHeight ?? 0)
          : 0;
      projectile.setPosition(
        Phaser.Math.Linear(projectile.startX, projectile.targetX, t),
        Phaser.Math.Linear(projectile.startY, projectile.targetY, t) -
          4 * arcHeight * t * (1 - t),
      );
      if (config.behavior === "explosive" && config.rotation?.enabled) {
        projectile.rotation += delta * (config.rotation.speed ?? 0.006);
      }
      projectile.setDepth(body.bottom);

      if (t >= 1) {
        projectile.setPosition(projectile.targetX, projectile.targetY);
        if (config.behavior === "arc") {
          this.release(projectile);
          return;
        }
        projectile.state = "fuse";
        projectile.landedAt = now;
        if (config.behavior === "explosive") {
          projectile.fuseEndsAt =
            now + (config.fuseMs ?? PROJECTILE_CONFIG.DEFAULT_FUSE_MS);
          if (config.fuseAnimKey) projectile.play(config.fuseAnimKey, true);
        } else if (config.behavior === "bounce") {
          projectile.fuseEndsAt = now + (config.lifetimeMs ?? config.bounceMs);
        }
      }
      return;
    }

    if (projectile.state === "fuse") {
      const bounceMs =
        config.behavior === "bounce" || config.behavior === "explosive"
          ? config.bounceMs
          : undefined;
      const bounceHeight =
        config.behavior === "bounce" || config.behavior === "explosive"
          ? (config.bounceHeight ?? 0)
          : 0;
      const bounceElapsed = now - projectile.landedAt;
      if (bounceMs && bounceElapsed < bounceMs) {
        const t = bounceElapsed / bounceMs;
        projectile.setPosition(
          projectile.targetX,
          projectile.targetY - 4 * bounceHeight * t * (1 - t),
        );
      } else {
        projectile.setPosition(projectile.targetX, projectile.targetY);
      }
      if (config.behavior === "explosive" && config.rotation?.enabled) {
        projectile.rotation += delta * (config.rotation.speed ?? 0.006);
      }
      projectile.setDepth(body.bottom);
      if (now >= projectile.fuseEndsAt) {
        if (config.behavior === "explosive") this.detonate(projectile);
        else this.release(projectile);
      }
    }
  };
}
