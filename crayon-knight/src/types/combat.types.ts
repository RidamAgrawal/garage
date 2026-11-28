import Phaser from "phaser";
import type { EnemyType } from "@/types/game.types";

/**
 * Combat Types
 * Definess classes and interfaces used for combat systems.
 */

/**
 * Information about damage dealt in combat
 * Object encapsulation for damage events. Damage ki details yahan define hoti hain.
 */
export interface DamageInfo {
  amount: number;
  source: Phaser.GameObjects.GameObject;
  knockbackDirection?: Phaser.Math.Vector2;
  isCritical?: boolean;
}

/**
 * Configuration for an attack
 */
export interface AttackConfig {
  damage: number;
  range: number;
  cooldownMs: number;
  knockbackForce: number;
}

export type ProjectileShape =
| "circle"
| "rectangle";
export type AttackMode = "melee" | "contact" | "ranged";
export type ProjectileBehavior =
  | "linear"
  | "arc"
  | "bounce"
  | "explosive";

interface ProjectileConfig {
  id: string;
  animKey: string;

  //Visual properties
  scale?: number;
  originOffset: Phaser.Math.Vector2;

  // Movement
  behavior: ProjectileBehavior;
  speed: number;

  // Collision
  collision: ProjectileCollisionConfig;

  // Lifetime
  lifetimeMs?: number;

  // Timing
  fireDelayMs?: number;
}

interface ProjectileCollisionConfig {
  shape: ProjectileShape;

  // Circle collision
  radius?: number;

  // Rectangle collision
  width?: number;
  height?: number;
}

interface LinearProjectileConfig extends ProjectileConfig {
  behavior: "linear";
}

interface ArcProjectileConfig extends ProjectileConfig {
  behavior: "arc";

  flightMs: number;
  arcHeight: number;
}

interface BounceProjectileConfig extends ProjectileConfig {
  behavior: "bounce";

  bounceMs: number;
  bounceHeight: number;
}

interface ExplosiveProjectileConfig extends ProjectileConfig {
  behavior: "explosive";

  fuseMs: number;
  explodeRadius: number;

  fuseAnimKey?: string;
  explodeAnimKey?: string;

  // Flight duration
  flightMs?: number;

  arcHeight?: number;
  bounceMs?: number;
  bounceHeight?: number;
  rotation?: {
    enabled: boolean;
    speed?: number;
  };
}

export type AnyProjectileConfig =
  | LinearProjectileConfig
  | ArcProjectileConfig
  | BounceProjectileConfig
  | ExplosiveProjectileConfig;

export interface ProjectileFireRequest {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  damage: number;
  config: AnyProjectileConfig;
}

export interface ProjectileExplodedPayload {
  x: number;
  y: number;
  radius: number;
  damage: number;
}

export interface EnemyDiedPayload {
  x: number;
  y: number;
  type: EnemyType;
  scoreReward: number;
}
