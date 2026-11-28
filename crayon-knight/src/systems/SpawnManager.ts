import Phaser from "phaser";
import { Player } from "@/entities/player/Player";
import { Enemy } from "@/entities/enemies/Enemy";
import { Skeleton } from "@/entities/enemies/Skeleton";
import { Slime } from "@/entities/enemies/Slime";
import { ENEMY_CONFIGS } from "@/config/BalanceConfig";
import { EnemyType } from "@/types/game.types";

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
   * Configured types use the base Enemy; only custom behavior keeps a subclass.
   */
  public spawnEnemyAt(
    x: number,
    y: number,
    type: string = "skeleton",
  ): Enemy | null {
    const rawType = type.toLowerCase();
    const enemyType =
      rawType === "boss"
        ? EnemyType.GOBLIN
        : Object.values(EnemyType).includes(rawType as EnemyType)
          ? (rawType as EnemyType)
          : null;
    if (!enemyType) {
      console.warn(`[SpawnManager] Unknown enemy type: "${type}"`);
      return null;
    }

    const config = ENEMY_CONFIGS[enemyType];
    const enemy =
      enemyType === EnemyType.SKELETON
        ? new Skeleton(this.scene, x, y)
        : enemyType === EnemyType.SLIME
          ? new Slime(this.scene, x, y)
          : new Enemy(
              this.scene,
              x,
              y,
              `${config.animPrefix ?? enemyType}-idle`,
              config,
              enemyType,
            );
    enemy.setTarget(this.player);
    this.enemyGroup.add(enemy);

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
      { x: mapWidth * 0.35, y: mapHeight * 0.55, type: "gnome" },
      { x: mapWidth * 0.65, y: mapHeight * 0.55, type: "lancer" },
      { x: mapWidth * 0.5, y: mapHeight * 0.75, type: "harpoonfish" },
    ];

    for (const pos of positions) {
      this.spawnEnemyAt(pos.x, pos.y, pos.type);
    }

    console.log(
      "[SpawnManager] Fallback enemies spawned (Tiled Objects layer nahi mili)",
    );
  }
}
