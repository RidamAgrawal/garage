export type RoomType = 'start' | 'normal' | 'boss' | 'treasure';

export interface EnemySpawn {
  tileX: number;
  tileY: number;
  type: string; // 'skeleton', 'slime', 'goblin'
}

/**
 * Data class representing a dungeon room.
 * Yeh class room ka data aur logic encapsulate karti hai (OOP Encapsulation).
 */
export class Room {
  constructor(
    public x: number,          // top-left tile X
    public y: number,          // top-left tile Y  
    public width: number,      // width in tiles
    public height: number,     // height in tiles
    public type: RoomType = 'normal',
    public enemySpawns: EnemySpawn[] = [],
    public isCleared: boolean = false
  ) {}

  /** 
   * Room ka center point X (tiles mein) 
   * @returns The horizontal center of the room in tile coordinates.
   */
  public getCenterX(): number { 
    return Math.floor(this.x + this.width / 2); 
  }

  /** 
   * Room ka center point Y (tiles mein)
   * @returns The vertical center of the room in tile coordinates.
   */
  public getCenterY(): number { 
    return Math.floor(this.y + this.height / 2); 
  }

  /** 
   * Check if a tile position is inside this room bounds
   * @param tileX The x coordinate to check
   * @param tileY The y coordinate to check
   * @returns True if the coordinate is within the room boundaries.
   */
  public contains(tileX: number, tileY: number): boolean {
    return tileX >= this.x && tileX < this.x + this.width &&
           tileY >= this.y && tileY < this.y + this.height;
  }

  /** 
   * Get a random floor position inside the room (with 1 tile wall padding)
   * Is function ka main purpose safely enemies ya items place karna hai.
   * @returns An object containing random x and y tile coordinates inside the room.
   */
  public getRandomFloorPosition(): { x: number, y: number } {
    // Ensuring a 1-tile padding so entities don't spawn on walls
    const floorWidth = Math.max(1, this.width - 2);
    const floorHeight = Math.max(1, this.height - 2);
    
    const floorX = this.x + 1 + Math.floor(Math.random() * floorWidth);
    const floorY = this.y + 1 + Math.floor(Math.random() * floorHeight);
    
    return { x: floorX, y: floorY };
  }
}
