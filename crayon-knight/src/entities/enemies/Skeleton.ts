import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { AssetKeys } from "@/constants/AssetKeys";
import { ENEMY_CONFIGS } from "@/config/BalanceConfig";
import { EnemyType } from "@/types/game.types";

/**
 * Skeleton Enemy — Melee attacker (uses Skull sprite)
 *
 * Polymorphism: Enemy base class se inherit karta hai
 * par apna specific attack behavior override karta hai
 */
export class Skeleton extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Skull sprite use karta hai — Skeleton texture nahi hai toh Skull se represent karte hain
    super(
      scene,
      x,
      y,
      AssetKeys.SKULL_IDLE,
      ENEMY_CONFIGS[EnemyType.SKELETON],
      EnemyType.SKELETON,
    );
  }
}
