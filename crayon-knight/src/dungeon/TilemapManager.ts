import Phaser from "phaser";
import { TILEMAPS } from "@/constants/AssetKeys";

/**
 * TilemapManager — Tiled JSON map ko Phaser mein load aur render karta hai
 *
 * Responsibilities:
 *  1. Preloaded JSON se tilemap create karo
 *  2. Saare tilesets attach karo (Tiled naam → Phaser cache key mapping)
 *  3. Saare tilelayers render karo (proper depth order mein)
 *  4. Object layers se spawn points aur collision bodies extract karo
 *
 * Key concept:
 *  Tiled editor mein tileset ka "name" hota hai (e.g. "Water Foam1").
 *  Phaser mein hum image load karte hain with a cache key (e.g. "tileset-water-foam-1").
 *  addTilesetImage(tiledName, phaserKey) in dono ko link karta hai.
 */
export class TilemapManager {
  private map!: Phaser.Tilemaps.Tilemap;

  /**
   * Tiled JSON se tilemap banao aur scene mein render karo.
   */
  public createTilemap(scene: Phaser.Scene): Phaser.Tilemaps.Tilemap {
    this.map = scene.make.tilemap({ key: TILEMAPS[0].key });

    this._addAllTilesets();
    this._createAllLayers();

    return this.map;
  }

  /**
   * Collision bodies banao — "boundaries" objectgroup se.
   * Tiled mein rectangle/line objects as static physics bodies.
   * @returns Static physics group containing all collision bodies
   */
  public createCliffColliders(
    scene: Phaser.Scene,
  ): Phaser.Physics.Arcade.StaticGroup {
    const staticGroup = scene.physics.add.staticGroup();

    const cliffLayer = this.map.getObjectLayer("boundaries");
    if (!cliffLayer) {
      console.warn('[TilemapManager] "boundaries" layer nahi mili.');
      return staticGroup;
    }

    for (const obj of cliffLayer.objects) {
      const x = obj.x ?? 0;
      const y = obj.y ?? 0;
      const w = obj.width ?? 0;
      const h = obj.height ?? 0;

      if (w === 0 && h === 0) continue; // Skip point objects

      // Rectangle objects → physics body
      // Tiled mein x,y top-left corner hai
      // Agar width=0 (vertical line), thoda width de do taaki collision ho
      // Agar height=0 (horizontal line), thoda height de do
      const finalW = Math.max(w, 2); // min 2px width for lines
      const finalH = Math.max(h, 2); // min 2px height for lines

      // Phaser zone as static body — invisible collision zone
      const zone = scene.add.zone(
        x + finalW / 2, // Zone center X
        y + finalH / 2, // Zone center Y
        finalW,
        finalH,
      );
      scene.physics.add.existing(zone, true); // true = static body
      staticGroup.add(zone);
    }

    console.log(
      `[TilemapManager] ${staticGroup.getLength()} cliff collision bodies created.`,
    );
    return staticGroup;
  }

  /**
   * Tile-based collision layer return karo (optional, "Elevated Ground Cliff" pe).
   */
  public getCollisionLayer(): Phaser.Tilemaps.TilemapLayer | null {
    const boundariesLayer =
      this.map.getLayer("boundaries")?.tilemapLayer ?? null;
    return boundariesLayer;
  }

  /**
   * "Objects" objectgroup se spawn points nikalo.
   */
  public getSpawnPoints(): {
    player: { x: number; y: number } | null;
    enemies: { x: number; y: number; type: string }[];
  } {
    const result: {
      player: { x: number; y: number } | null;
      enemies: { x: number; y: number; type: string }[];
    } = {
      player: null,
      enemies: [],
    };

    const objectLayer = this.map.getObjectLayer("Objects");
    if (!objectLayer) {
      console.warn(
        '[TilemapManager] "Objects" layer nahi mili. Fallback spawn use hoga.',
      );
      return result;
    }

    for (const obj of objectLayer.objects) {
      const x = obj.x ?? 0;
      const y = obj.y ?? 0;
      const name = obj.name?.toLowerCase() ?? "";
      const type = obj.type?.toLowerCase() ?? "";

      if (name === "player" || type === "player") {
        result.player = { x, y };
      } else if (name.startsWith("enemy") || type === "enemy") {
        const enemyTypeProp = obj.properties?.find(
          (p: { name: string; value: string }) => p.name === "enemyType",
        );
        result.enemies.push({
          x,
          y,
          type: enemyTypeProp?.value ?? "skeleton",
        });
      }
    }

    console.log(
      `[TilemapManager] Spawn: player=${result.player ? "found" : "fallback"}, enemies=${result.enemies.length}`,
    );
    return result;
  }

  public get widthInPixels(): number {
    return this.map.widthInPixels;
  }
  public get heightInPixels(): number {
    return this.map.heightInPixels;
  }

  public getWorldPosition(
    tileX: number,
    tileY: number,
  ): { x: number; y: number } {
    return {
      x: tileX * this.map.tileWidth + this.map.tileWidth / 2,
      y: tileY * this.map.tileHeight + this.map.tileHeight / 2,
    };
  }

  public getTilePosition(
    worldX: number,
    worldY: number,
  ): { x: number; y: number } {
    return {
      x: Math.floor(worldX / this.map.tileWidth),
      y: Math.floor(worldY / this.map.tileHeight),
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────

  /**
   * Saare tilesets ko Phaser tilemap mein attach karo.
   *
   * Flow:
   *  1. Phaser ne JSON parse karke this.map.tilesets banaya
   *  2. Har tileset ke "name" ko hum apne TILESET_IMAGES registry ke key se match karte hain
   *  3. addTilesetImage(tiledName, phaserCacheKey) se link karte hain
   *
   * External/broken tilesets skip hote hain (graceful handling).
   */
  private _addAllTilesets(): void {
    let attached = 0;
    let skipped = 0;

    for (const ts of this.map.tilesets) {
      const tiledName = ts.name;

      // Skip broken/unnamed tilesets (external .tsj references that Phaser couldn't resolve)
      if (!tiledName || tiledName === "undefined") {
        console.warn(
          `[TilemapManager] Skipping unnamed/external tileset (firstgid=${ts.firstgid})`,
        );
        skipped++;
        continue;
      }

      // Tiled naam → Phaser cache key mapping
      const phaserKey = tiledName;

      const result = this.map.addTilesetImage(tiledName, phaserKey);
      if (result) {
        attached++;
      } else {
        console.warn(
          `[TilemapManager] ❌ addTilesetImage failed: "${tiledName}" → key "${phaserKey}"`,
        );
        skipped++;
      }
    }

    console.log(
      `[TilemapManager] Tilesets: ${attached} attached, ${skipped} skipped.`,
    );
  }

  /**
   * Saare tile layers ko render karo (ordered by depth).
   * Objectgroup layers automatically skip hote hain (createLayer returns null for them).
   */
  private _createAllLayers(): void {
    // Successfully attached tilesets ka array
    const tilesets: Phaser.Tilemaps.Tileset[] = [];
    for (const ts of this.map.tilesets) {
      if (!ts.name || ts.name === "undefined") continue;
      const found = this.map.getTileset(ts.name);
      if (found) tilesets.push(found);
    }

    if (tilesets.length === 0) {
      console.error(
        "[TilemapManager] No valid tilesets! Map render nahi hoga.",
      );
      return;
    }

    // Layers create karo — objectgroup layers ke liye createLayer null return karega
    let depth = 0;
    let layerCount = 0;
    for (const layerData of this.map.layers) {
      const layer = this.map.createLayer(layerData.name, tilesets);
      if (layer) {
        layer.setDepth(depth++);
        layerCount++;
      }
      // null = objectgroup layer, skip silently (expected behavior)
    }

    console.log(`[TilemapManager] ${layerCount} tile layers rendered.`);
  }

  public getCollisionObjectLayer(): Phaser.Tilemaps.ObjectLayer | null {
    return this.map.getObjectLayer("boundaries");
  }
}
