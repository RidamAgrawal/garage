/**
 * Balance Configuration
 * Constants tuning player, enemy stats and dungeon generation.
 * Game balance ko yahan se easily tweak kiya ja sakta hai.
 */

export const PLAYER_CONFIG = {
  maxHp: 6,           // 3 hearts × 2 HP each
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
    attackRange: 28,
    detectionRange: 150,
    knockbackForce: 150,
    goldDrop: { min: 1, max: 3 },
  },
  slime: {
    maxHp: 2,
    speed: 50,
    attackPower: 1,
    attackCooldownMs: 0,    // damages on contact
    attackRange: 0,
    detectionRange: 100,
    knockbackForce: 100,
    goldDrop: { min: 0, max: 2 },
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
  },
};

export const DUNGEON_CONFIG = {
  tileSize: 32,
  roomMinSize: 7,
  roomMaxSize: 13,
  mapWidth: 50,
  mapHeight: 50,
  maxRooms: 7,
  maxEnemiesPerRoom: 3,
};
