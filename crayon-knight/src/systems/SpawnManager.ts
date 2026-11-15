import Phaser from "phaser";
import { Player } from "@/entities/player/Player";
import { Enemy } from "@/entities/enemies/Enemy";
import { Skeleton } from "@/entities/enemies/Skeleton";
import { Slime } from "@/entities/enemies/Slime";
import { AssetKeys } from "@/constants/AssetKeys";
import { ENEMY_CONFIGS } from "@/config/BalanceConfig";
import { BombFish } from "@/entities/enemies/BombFish";

/**
 * SpawnManager — Factory Pattern ka example
 *
 * Hindi: Factory pattern mein ek class (yeh SpawnManager) decide karti hai
 * ki kaunsa object banaya jaaye based on type string.
 * Direct 'new Skeleton()' likhne ki jagah, SpawnManager ko bolo
 * "skeleton bana do" aur woh sahi class pick karke banayegi.
 *
 * Methods:
 *  - spawnEnemyAt(x, y, type) — Tiled Objects layer se direct coordinates mein spawn
 *  - spawnFallbackEnemies(...)  — Agar Objects layer nahi hai toh default positions
 */
export class SpawnManager {
  private scene: Phaser.Scene;
  private enemyGroup: Phaser.Physics.Arcade.Group;
  private player: Player;

  constructor(
    scene: Phaser.Scene,
    enemyGroup: Phaser.Physics.Arcade.Group,
    player: Player,
  ) {
    this.scene = scene;
    this.enemyGroup = enemyGroup;
    this.player = player;
  }

  /**
   * Ek enemy spawn karo given world coordinates pe.
   * Tiled Objects layer ke coordinates directly pass karo.
   *
   * Factory switch: type string → sahi Enemy subclass
   */
  public spawnEnemyAt(
    x: number,
    y: number,
    type: string = "skeleton",
  ): Enemy | null {
    let enemy: Enemy | null = null;

    switch (type.toLowerCase()) {
      case "skeleton":
        // Skull sprite se Skeleton represent hota hai
        enemy = new Skeleton(this.scene, x, y);
        break;

      case "slime":
        // Spider sprite se Slime represent hota hai
        enemy = new Slime(this.scene, x, y);
        break;

      case "bombfish":
        // Spider sprite se Slime represent hota hai
        enemy = new BombFish(this.scene, x, y);
        break;

      case "goblin":
      case "boss":
        // Troll sprite — bada aur powerful enemy
        enemy = new Enemy(
          this.scene,
          x,
          y,
          AssetKeys.TROLL_IDLE,
          ENEMY_CONFIGS.goblin,
        );
        enemy.enemyType = type === "boss" ? "boss" : "goblin";
        break;

      default:
        console.warn(
          `[SpawnManager] Unknown enemy type: "${type}" — skeleton use kar raha hoon`,
        );
        enemy = new Skeleton(this.scene, x, y);
    }

    if (enemy) {
      enemy.setTarget(this.player);
      enemy.setDepth(20);
      this.enemyGroup.add(enemy);
    }

    return enemy;
  }

  /**
   * Fallback spawn — Tiled mein koi Objects layer nahi hai toh
   * map ke alag-alag positions pe default enemies place karo
   */
  public spawnFallbackEnemies(mapWidth: number, mapHeight: number): void {
    const positions = [
      { x: mapWidth * 0.25, y: mapHeight * 0.25, type: "skeleton" },
      { x: mapWidth * 0.75, y: mapHeight * 0.25, type: "slime" },
      { x: mapWidth * 0.25, y: mapHeight * 0.75, type: "skeleton" },
      { x: mapWidth * 0.75, y: mapHeight * 0.75, type: "goblin" },
      { x: mapWidth * 0.5, y: mapHeight * 0.4, type: "bombfish" },
    ];

    for (const pos of positions) {
      this.spawnEnemyAt(pos.x, pos.y, pos.type);
    }

    console.log(
      "[SpawnManager] Fallback enemies spawned (Tiled Objects layer nahi mili)",
    );
  }
}
