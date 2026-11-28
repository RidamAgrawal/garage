import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { AssetKeys } from "@/constants/AssetKeys";
import { ENEMY_CONFIGS } from "@/config/BalanceConfig";
import { EnemyType } from "@/types/game.types";

/**
 * Slime Enemy — Contact damage with bouncy movement (uses Spider sprite)
 *
 * Polymorphism: Same Enemy interface, different behavior
 * Slime ka patrol pattern bouncy hai — short bursts mein move karta hai
 */
export class Slime extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Spider sprite use karta hai
    super(
      scene,
      x,
      y,
      AssetKeys.SPIDER_IDLE,
      ENEMY_CONFIGS[EnemyType.SLIME],
      EnemyType.SLIME,
    );
  }

  /** Override patrol for bouncy movement pattern */
  patrol(time: number) {
    if (time > this.patrolTimer) {
      const angle = Math.random() * Math.PI * 2;
      this.patrolDir = { x: Math.cos(angle), y: Math.sin(angle) };
      this.patrolTimer = time + 1000 + Math.random() * 500;
    }

    // Bouncy: move fast briefly, then stop
    const timeLeft = this.patrolTimer - time;
    const burstMultiplier = timeLeft > 500 ? 1.5 : 0;
    this.movement.move(
      this.patrolDir.x * burstMultiplier,
      this.patrolDir.y * burstMultiplier,
    );
  }
}
