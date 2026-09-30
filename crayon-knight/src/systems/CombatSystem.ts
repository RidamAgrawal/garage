import Phaser from 'phaser';

/**
 * Static utility class for combat calculations.
 * Yeh class pure functions hold karti hai jo combat math ke liye zaroori hain.
 * Static methods ka fayda yeh hai ki inko bina instantiate kiye use kar sakte hain.
 */
export class CombatSystem {
  /**
   * Calculates actual damage taken after defense.
   * @param baseDamage The raw damage dealt by the attacker.
   * @param defense The defense stat of the defender.
   * @returns Calculated final damage, minimum 1.
   */
  public static calculateDamage(baseDamage: number, defense: number = 0): number {
    return Math.max(1, baseDamage - defense);
  }

  /**
   * Gets the normalized vector direction for knockback from a source to a target.
   * @param source The attacker's position.
   * @param target The defender's position.
   * @returns Normalized Phaser Vector2 pointing away from the source.
   */
  public static getKnockbackDirection(
    source: { x: number, y: number }, 
    target: { x: number, y: number }
  ): Phaser.Math.Vector2 {
    const dir = new Phaser.Math.Vector2(target.x - source.x, target.y - source.y);
    return dir.normalize();
  }

  /**
   * Checks if target b is within a certain distance of source a.
   * @param a The first point.
   * @param b The second point.
   * @param range The maximum allowed distance.
   * @returns Boolean indicating if they are within range.
   */
  public static isInRange(
    a: { x: number, y: number }, 
    b: { x: number, y: number }, 
    range: number
  ): boolean {
    const distSq = Phaser.Math.Distance.Squared(a.x, a.y, b.x, b.y);
    return distSq <= (range * range);
  }
}
