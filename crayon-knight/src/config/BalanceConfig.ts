/**
 * Balance Configuration
 * Constants tuning player, enemy stats and island generation.
 * Game balance ko yahan se easily tweak kiya ja sakta hai.
 */

import { TerrainType } from "@/types/game.types";
export const PLAYER_CONFIG = {
  maxHp: 6, // 3 hearts × 2 HP each
  speed: 160,
  attackPower: 2,
  attackCooldownMs: 400,
  attackRange: 32,
  knockbackForce: 200,
  iframeDurationMs: 800,
};

export const ENEMY_CONFIGS = {
  skeleton: {
    maxHp: 4,
    speed: 80,
    attackPower: 1,
    attackCooldownMs: 1000,
    attackRange: 48,
    detectionRange: 150,
    knockbackForce: 150,
    goldDrop: { min: 1, max: 3 },
    animPrefix: "skull", // FSM animation keys: gnome-idle, gnome-walk, gnome-attack
    scale: 0.5, // 192px sprite → ~96px in-game
  },
  slime: {
    maxHp: 2,
    speed: 50,
    attackPower: 1,
    attackCooldownMs: 0, // damages on contact
    attackRange: 0,
    detectionRange: 100,
    knockbackForce: 100,
    goldDrop: { min: 0, max: 2 },
    animPrefix: "spider", // FSM animation keys: spider-idle, spider-run, spider-attack
    scale: 0.5,
  },
  goblin: {
    maxHp: 3,
    speed: 100,
    attackPower: 1,
    attackCooldownMs: 800,
    attackRange: 24,
    detectionRange: 180,
    knockbackForce: 130,
    goldDrop: { min: 2, max: 5 },
    animPrefix: "troll", // FSM animation keys: troll-idle, troll-walk, troll-attack
    scale: 0.35, // 384px sprite → ~134px in-game (BOSS size)
  },
};

export const ELEVATION_CONFIG = {
  GRAVITY_Z: 950,
  JUMP_VELOCITY: 360,
  CLIFF_HEIGHT: 32,
  CLIFF_CLEAR_RATIO: 0.75,
  AIR_CONTROL: 0.85,
  WATER_DAMAGE: 1,
  HIT_Z: 16, // above this, ground melee/contact cannot connect
} as const;

// total height an airborne entity needs to pass a cliff rect (56: within 8px of the plateau top)
export const CLIFF_CLEAR_TOTAL =
  (TerrainType.ELEVATED - (1 - ELEVATION_CONFIG.CLIFF_CLEAR_RATIO)) *
  ELEVATION_CONFIG.CLIFF_HEIGHT;
