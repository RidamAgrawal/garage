import Phaser from 'phaser';

/**
 * TilemapManager handles the conversion of a 2D generation grid into a Phaser Tilemap.
 * Yeh utility class map data aur Phaser rendering ke beech ka bridge hai.
 */
export class TilemapManager {
  /**
   * Converts the 2D grid to a Phaser Tilemap.
   * @param scene The active Phaser scene.
   * @param grid The 2D array representation of the dungeon (0=wall, 1=floor, 2=corridor).
   * @param tileSize The size of the tiles in pixels (e.g., 32).
   * @returns The generated Phaser Tilemap.
   */
  public createTilemap(scene: Phaser.Scene, grid: number[][], tileSize: number): Phaser.Tilemaps.Tilemap {
    const mapHeight = grid.length;
    const mapWidth = grid[0].length;

    // Create a blank tilemap
    const map = scene.make.tilemap({
      tileWidth: tileSize,
      tileHeight: tileSize,
      width: mapWidth,
      height: mapHeight
    });

    // AssetKeys.DUNGEON_TILES ko yahan assume kar rahe hain as 'dungeon-tiles'
    // Ensure you have loaded this image in your Preloader scene
    const tileset = map.addTilesetImage('dungeon-tiles', 'dungeon-tiles');
    if (!tileset) {
      throw new Error("Tileset 'dungeon-tiles' not found. Ensure it is loaded.");
    }

    // Create 2 layers: 'ground' and 'walls'
    const groundLayer = map.createBlankLayer('ground', tileset);
    const wallsLayer = map.createBlankLayer('walls', tileset);

    if (!groundLayer || !wallsLayer) {
        throw new Error("Failed to create tilemap layers.");
    }

    // Loop through grid to populate layers
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tileType = grid[y][x];

        if (tileType === 0) {
          // Wall tile
          wallsLayer.putTileAt(1, x, y);
        } else if (tileType === 1 || tileType === 2) {
          // Floor or Corridor tile
          groundLayer.putTileAt(0, x, y);
        }
      }
    }

    // Set collision on walls layer (all tiles with index > -1)
    wallsLayer.setCollisionByExclusion([-1]);

    // Set depths
    groundLayer.setDepth(0);
    wallsLayer.setDepth(1);

    return map;
  }

  /**
   * Converts tile coordinates to world pixel coordinates (center of the tile).
   * @param tileX X index of the tile.
   * @param tileY Y index of the tile.
   * @param tileSize Size of each tile in pixels.
   * @returns An object with world x and y coordinates.
   */
  public getWorldPosition(tileX: number, tileY: number, tileSize: number): { x: number, y: number } {
    return {
      x: tileX * tileSize + (tileSize / 2),
      y: tileY * tileSize + (tileSize / 2)
    };
  }

  /**
   * Converts world coordinates to tile coordinates.
   * @param worldX World X coordinate.
   * @param worldY World Y coordinate.
   * @param tileSize Size of each tile in pixels.
   * @returns An object with tile x and y indices.
   */
  public getTilePosition(worldX: number, worldY: number, tileSize: number): { x: number, y: number } {
    return {
      x: Math.floor(worldX / tileSize),
      y: Math.floor(worldY / tileSize)
    };
  }
}
