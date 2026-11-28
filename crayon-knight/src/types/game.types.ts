/**
 * Game Types
 * Core interfaces and types for the game.
 */

/**
 * Directions available in the game
 */
export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export enum TerrainType {
  WATER = 0,
  FLAT = 1,
  ELEVATED = 2,
}

export enum EnemyType {
  SKELETON = "skeleton",
  SLIME = "slime",
  BOMBFISH = "bombfish",
  GOBLIN = "goblin",
  GNOME = "gnome",
  LANCER = "lancer",
  HARPOON_FISH = "harpoonfish",
}

/**
 * Entity Configuration
 * Interface defining the base properties of any game entity (Player, Enemy, etc.)
 * Object-oriented pattern interface. Yeh blueprint hai game entities ke liye.
 */
export interface EntityConfig {
  x: number;
  y: number;
  texture: string;
  frame?: string | number;
  maxHp: number;
  speed: number;
  attackPower: number;
}

/**
 * Room Configuration
 * Specifies how a dungeon room should be generated
 */
export interface RoomConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "normal" | "start" | "boss" | "treasure";
  enemySpawns: { x: number; y: number; type: string }[];
}

/**
 * 2D Vector Type
 */
export type Vector2 = {
  x: number;
  y: number;
};

export interface IslandBuildResult {
  map: Phaser.Tilemaps.Tilemap;
  boundaries: Phaser.Physics.Arcade.StaticGroup;
  spawnPoints: {
    player: { x: number; y: number } | null;
    enemies: { x: number; y: number; type: EnemyType }[];
  };
  terrainAt: (worldX: number, worldY: number) => TerrainType;
}

export interface AnimatedTile {
  tile: Phaser.Tilemaps.Tile;
  firstgid: number;
  baseIndex: number;
  frameStep: number;
  frameCount: number;
}
