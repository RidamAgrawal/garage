/**
 * Balance Configuration
 * Constants tuning player, enemy stats and island generation.
 * Game balance ko yahan se easily tweak kiya ja sakta hai.
 */

import Phaser from "phaser";
import { TerrainType } from "@/types/game.types";
import { EnemyType } from "@/types/game.types";
import { AssetKeys } from "@/constants/AssetKeys";
import type { AnyProjectileConfig, AttackMode } from "@/types/combat.types";

export interface EnemyConfig {
  maxHp: number;
  speed: number;
  attackPower: number;
  attackCooldownMs: number;
  attackRange: number;
  knockbackForce: number;
  detectionRange: number;
  goldDrop: { min: number; max: number };
  scoreReward: number;
  attackMode: AttackMode;
  canDefend?: boolean;
  projectile?: AnyProjectileConfig;
  animPrefix?: string;
  scale?: number;
  barTop?: number;
  size: { width: number; height: number };
  offset: { x: number; y: number };
}

export const PLAYER_CONFIG = {
  maxHp: 6, // 3 hearts × 2 HP each
  speed: 160,
  attackPower: 2,
  attackCooldownMs: 400,
  attackRange: 32,
  knockbackForce: 200,
  iframeDurationMs: 800,
};

export const PROJECTILE_CONFIG = {
  POOL_SIZE: 30,
  LIFETIME_MS: 2500,
  DEFAULT_FUSE_MS: 1800,
  BODY_RADIUS: 12,
  EXPLODE_RADIUS: 56,
} as const;

export const LOOT_CONFIG = {
  HEART_CHANCE: 0.2,
  HEART_HEAL: 1,
  POP_PX: 14,
  SCATTER_PX: 14,
  DESPAWN_MS: 10_000,
  MAX_PICKUPS: 60,
} as const;

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  [EnemyType.SKELETON]: {
    maxHp: 4,
    speed: 80,
    attackPower: 1,
    attackCooldownMs: 1000,
    attackRange: 48,
    detectionRange: 150,
    knockbackForce: 150,
    goldDrop: { min: 1, max: 3 },
    scoreReward: 100,
    attackMode: "melee",
    canDefend: true,
    animPrefix: "skull", // FSM animation keys: skull-idle, skull-walk, skull-attack
    scale: 0.5, // 192px sprite → ~96px in-game
    size: { width: 64, height: 64 },
    offset: { x: 64, y: 64 },
  },
  [EnemyType.SLIME]: {
    maxHp: 2,
    speed: 50,
    attackPower: 1,
    attackCooldownMs: 0, // damages on contact
    attackRange: 0,
    detectionRange: 100,
    knockbackForce: 100,
    goldDrop: { min: 0, max: 2 },
    scoreReward: 50,
    attackMode: "melee",
    animPrefix: "spider", // FSM animation keys: spider-idle, spider-run, spider-attack
    scale: 0.5,
    size: { width: 96, height: 80 },
    offset: { x: 48, y: 64 },
  },
  [EnemyType.GOBLIN]: {
    maxHp: 3,
    speed: 100,
    attackPower: 1,
    attackCooldownMs: 800,
    attackRange: 24,
    detectionRange: 180,
    knockbackForce: 130,
    goldDrop: { min: 2, max: 5 },
    scoreReward: 200,
    attackMode: "melee",
    animPrefix: "troll", // FSM animation keys: troll-idle, troll-walk, troll-attack
    scale: 0.35, // 384px sprite → ~134px in-game (BOSS size)
    size: { width: 192, height: 192 },
    offset: { x: 96, y: 96 },
  },
  [EnemyType.BOMBFISH]: {
    maxHp: 3,
    speed: 40,
    attackPower: 1,
    attackCooldownMs: 2500,
    attackRange: 180,
    detectionRange: 300,
    knockbackForce: 150,
    goldDrop: { min: 2, max: 5 },
    scoreReward: 150,
    attackMode: "ranged",
    animPrefix: "bombfish",
    scale: 0.5,
    size: { width: 64, height: 64 },
    offset: { x: 64, y: 64 },
    barTop: 0.3,
    projectile: {
      id: "bomb",
      animKey: AssetKeys.BOMB_SPIN,
      speed: 160,
      behavior: "explosive",
      fireDelayMs: 400,
      fuseMs: 1000,
      fuseAnimKey: AssetKeys.BOMB_FUSE,
      explodeAnimKey: AssetKeys.EXPLOSION,
      explodeRadius: 45,
      flightMs: 700,
      arcHeight: 70,
      bounceMs: 350,
      bounceHeight: 25,
      rotation: { enabled: false, speed: 0.006 },
      scale: 0.5,
      originOffset: new Phaser.Math.Vector2(0, -10),
      collision: {
        shape: 'circle',
        radius: 16,
      }
    },
  },
  [EnemyType.GNOME]: {
    maxHp: 3,
    speed: 115,
    attackPower: 1,
    attackCooldownMs: 700,
    attackRange: 20,
    detectionRange: 220,
    knockbackForce: 120,
    goldDrop: { min: 2, max: 4 },
    scoreReward: 125,
    attackMode: "melee",
    animPrefix: "gnome",
    scale: 0.5,
    size: { width: 64, height: 64 },
    offset: { x: 64, y: 64 },
  },
  [EnemyType.LANCER]: {
    maxHp: 5,
    speed: 70,
    attackPower: 2,
    attackCooldownMs: 1400,
    attackRange: 20,
    detectionRange: 260,
    knockbackForce: 180,
    goldDrop: { min: 4, max: 7 },
    scoreReward: 175,
    attackMode: "melee",
    animPrefix: "lancer",
    scale: 0.5,
    size: { width: 64, height: 64 },
    offset: { x: 96, y: 96 },
  },
  [EnemyType.HARPOON_FISH]: {
    maxHp: 3,
    speed: 60,
    attackPower: 1,
    attackCooldownMs: 1800,
    attackRange: 200,
    detectionRange: 180,
    knockbackForce: 100,
    goldDrop: { min: 3, max: 6 },
    scoreReward: 150,
    attackMode: "ranged",
    animPrefix: "harpoonfish",
    scale: 0.5,
    size: { width: 64, height: 64 },
    offset: { x: 64, y: 64 },
    projectile: {
      id: "harpoon",
      animKey: AssetKeys.HARPOON_PROJECTILE,
      speed: 280,
      behavior: "linear",
      lifetimeMs: 1600,
      collision: {
        shape: "rectangle",
        height: 20,
        width: 128,
      },
      scale: 0.5,
      originOffset: new Phaser.Math.Vector2(0,0),
    },
  },
};

export const ELEVATION_CONFIG = {
  GRAVITY_Z: 950,
  JUMP_VELOCITY: 360,
  CLIFF_HEIGHT: 32,
  CLIFF_CLEAR_RATIO: 0.75,
  AIR_CONTROL: 0.85,
  WATER_DAMAGE: 1,
  HIT_Z: 20, // above this, ground melee/contact cannot connect
} as const;

// total height an airborne entity needs to pass a cliff rect (56: within 8px of the plateau top)
export const CLIFF_CLEAR_TOTAL =
  (TerrainType.ELEVATED - (1 - ELEVATION_CONFIG.CLIFF_CLEAR_RATIO)) *
  ELEVATION_CONFIG.CLIFF_HEIGHT;
