import Phaser from 'phaser';

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
