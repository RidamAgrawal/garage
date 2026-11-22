import Phaser from "phaser";
import { Enemy } from "./Enemy";

const SHOOT_RANGE = 260;
const COOLDOWN_MS = 2500;
const FIRE_AT_MS = 400;
const AIR_MS = 700; // flight time
const ARC_H = 70; // peak height in px
const FUSE_MS = 1000; // was 600: total time on the ground before the blast
const BOUNCE_MS = 350; // length of the rebound hop
const BOUNCE_H = 25; // rebound peak height in px
const BLAST_R = 45; // damage radius in px

export class BombFish extends Enemy {
  private shooting = false;
  private nextShot = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "bombfish-idle", {
      maxHp: 3,
      speed: 40,
      attackPower: 1,
      attackCooldownMs: 1000,
      attackRange: 30,
      knockbackForce: 150,
      detectionRange: 300,
      goldDrop: { min: 2, max: 5 },
      animPrefix: "bombfish",
      scale: 0.5,
      barTop: 0.3,
    });
  }

  public preUpdate(time: number, delta: number) {
    if (this.shooting) {
      // Pause the FSM so idle/run can't replace the attack anim; only advance the animation
      (Phaser.GameObjects.Sprite.prototype as any).preUpdate.call(
        this,
        time,
        delta,
      );
      return;
    }
    super.preUpdate(time, delta);
    const p = this.target;
    if (
      p?.active &&
      time > this.nextShot &&
      Phaser.Math.Distance.Between(this.x, this.y, p.x, p.y) < SHOOT_RANGE
    ) {
      this.shoot(p, time);
    }
  }

  private shoot(_p: Phaser.Physics.Arcade.Sprite, time: number) {
    const A = "bombfish-attack";
    this.shooting = true;
    this.nextShot = time + COOLDOWN_MS;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0);
    this.play(A);
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + A, () => {
      this.shooting = false;
      if (this.active && !this.health.isDead()) this.fsm.transition("idle");
    });
    this.scene.time.delayedCall(FIRE_AT_MS, () => this.active && this.fire());
  }

  private fire() {
    const p = this.target;
    if (!p?.active) return;
    const scene = this.scene;
    if (!scene) return;
    const sx = this.x,
      sy = this.y - 10;
    const tx = p.x,
      ty = p.y; // aim where the player is now, so moving players can dodge
    const bomb = scene.add
      .sprite(sx, sy, "bomb-spin")
      .setDepth(20)
      .setScale(0.5)
      .play("bomb-spin");
    const f = { t: 0 };
    scene.tweens.add({
      targets: f,
      t: 1,
      duration: AIR_MS,
      onUpdate: () =>
        bomb.active &&
        bomb.setPosition(
          Phaser.Math.Linear(sx, tx, f.t),
          Phaser.Math.Linear(sy, ty, f.t) - 4 * ARC_H * f.t * (1 - f.t), // parabola, peaks at ARC_H
        ),
      onComplete: () => this.land(scene, bomb, tx, ty),
    });
  }

  private land(scene: Phaser.Scene, bomb: Phaser.GameObjects.Sprite, x: number, y: number) {
    if (!bomb.active) return;
    bomb.setPosition(x, y).play("bomb-fuse");
    const f = { t: 0 };
    scene.tweens.add({
      targets: f,
      t: 1,
      duration: BOUNCE_MS,
      onUpdate: () =>
        bomb.active && bomb.setY(y - 4 * BOUNCE_H * f.t * (1 - f.t)), // same parabola as the flight, so it ends back on the ground
    });
    scene.time.delayedCall(FUSE_MS, () => {
      if (!bomb.active) return;
      bomb
        .play("explosion1")
        .once(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
          bomb.destroy(),
        );
      const p = this.target;
      if (p?.active && Phaser.Math.Distance.Between(x, y, p.x, p.y) < BLAST_R) {
        const dx = p.x - x;
        const dy = p.y - y;
        const len = Math.hypot(dx, dy) || 1;
        p.onDamaged(1, { x: dx / len, y: dy / len });
      }
    });
  }
}
