import { Room } from '@/dungeon/Room';
import { DUNGEON_CONFIG } from '@/config/BalanceConfig';

/**
 * Simple room-based dungeon generator.
 * Yeh class procedural generation handle karti hai. Single Responsibility Principle (SRP)
 * ko follow karte hue iska kaam sirf level design produce karna hai.
 */
export class DungeonGenerator {
  /**
   * Generates a new dungeon layout.
   * @returns Object containing the 2D grid and the list of generated rooms.
   */
  public generate(): { grid: number[][], rooms: Room[] } {
    // Initialize grid with all 0s (walls)
    const grid: number[][] = Array.from(
      { length: DUNGEON_CONFIG.mapHeight }, 
      () => Array(DUNGEON_CONFIG.mapWidth).fill(0)
    );
    const rooms: Room[] = [];

    // Attempt to place rooms randomly without overlap (with padding)
    const maxAttempts = DUNGEON_CONFIG.maxRooms * 3;
    for (let i = 0; i < maxAttempts; i++) {
      if (rooms.length >= DUNGEON_CONFIG.maxRooms) {
        break;
      }
      this.tryPlaceRoom(grid, rooms);
    }

    // Sort rooms by x position (left to right) to create a linear path
    rooms.sort((a, b) => a.x - b.x);

    // Connect each consecutive pair with an L-corridor
    for (let i = 0; i < rooms.length - 1; i++) {
      const roomA = rooms[i];
      const roomB = rooms[i + 1];
      this.carveCorridor(grid, roomA.getCenterX(), roomA.getCenterY(), roomB.getCenterX(), roomB.getCenterY());
    }

    // Define special rooms
    if (rooms.length > 0) {
      rooms[0].type = 'start';
      rooms[rooms.length - 1].type = 'boss';
    }

    // Place enemy spawns in normal rooms
    rooms.forEach(room => {
      if (room.type === 'normal') {
        this.placeEnemySpawns(room);
      }
    });

    return { grid, rooms };
  }

  /**
   * Tries to place a room in the grid if there's no overlap.
   */
  private tryPlaceRoom(grid: number[][], rooms: Room[]): void {
    const width = Math.floor(Math.random() * (DUNGEON_CONFIG.roomMaxSize - DUNGEON_CONFIG.roomMinSize + 1)) + DUNGEON_CONFIG.roomMinSize;
    const height = Math.floor(Math.random() * (DUNGEON_CONFIG.roomMaxSize - DUNGEON_CONFIG.roomMinSize + 1)) + DUNGEON_CONFIG.roomMinSize;
    
    const x = Math.floor(Math.random() * (DUNGEON_CONFIG.mapWidth - width - 4)) + 2;
    const y = Math.floor(Math.random() * (DUNGEON_CONFIG.mapHeight - height - 4)) + 2;

    let overlap = false;
    for (const room of rooms) {
      // Check no overlap with existing rooms (with 2-tile padding)
      if (x - 2 < room.x + room.width && x + width + 2 > room.x &&
          y - 2 < room.y + room.height && y + height + 2 > room.y) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      const newRoom = new Room(x, y, width, height);
      this.carveRoom(grid, newRoom);
      rooms.push(newRoom);
    }
  }

  /**
   * Set tiles to 1 inside room bounds.
   */
  private carveRoom(grid: number[][], room: Room): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        // Double-check bounds
        if (y >= 0 && y < DUNGEON_CONFIG.mapHeight && x >= 0 && x < DUNGEON_CONFIG.mapWidth) {
          grid[y][x] = 1; // 1 = floor
        }
      }
    }
  }

  /**
   * Carve L-corridor, set tiles to 2.
   */
  private carveCorridor(grid: number[][], x1: number, y1: number, x2: number, y2: number): void {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    // Horizontal corridor first, then vertical
    for (let x = minX; x <= maxX; x++) {
      if (y1 >= 0 && y1 < DUNGEON_CONFIG.mapHeight && x >= 0 && x < DUNGEON_CONFIG.mapWidth) {
        grid[y1][x] = 2; // 2 = corridor
      }
    }
    for (let y = minY; y <= maxY; y++) {
      if (y >= 0 && y < DUNGEON_CONFIG.mapHeight && x2 >= 0 && x2 < DUNGEON_CONFIG.mapWidth) {
        grid[y][x2] = 2;
      }
    }
  }

  /**
   * Add 1-3 random enemy spawns inside a room.
   */
  private placeEnemySpawns(room: Room): void {
    const enemyCount = Math.floor(Math.random() * 3) + 1;
    const enemyTypes = ['skeleton', 'slime', 'goblin'];

    for (let i = 0; i < enemyCount; i++) {
      const pos = room.getRandomFloorPosition();
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      room.enemySpawns.push({
        tileX: pos.x,
        tileY: pos.y,
        type: type
      });
    }
  }
}
