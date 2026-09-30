/**
 * Enum for Event Bus Keys
 * Global events track karne ke liye constants.
 */
export enum EventKeys {
  PLAYER_HEALTH_CHANGED = 'PLAYER_HEALTH_CHANGED',
  PLAYER_DIED = 'PLAYER_DIED',
  ENEMY_DIED = 'ENEMY_DIED',
  GOLD_CHANGED = 'GOLD_CHANGED',
  GAME_OVER = 'GAME_OVER',
  ROOM_CLEARED = 'ROOM_CLEARED',
  DUNGEON_COMPLETE = 'DUNGEON_COMPLETE'
}
