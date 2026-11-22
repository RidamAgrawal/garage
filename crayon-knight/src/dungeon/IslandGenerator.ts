import Phaser from "phaser";
import {
  AnimatedTile,
  IslandBuildResult,
  TerrainType,
} from "@/types/game.types";

/**
 * Procedural Island Generator
 *
 * Generates an organic island map in code with the exact 8 layers from firstMap.json:
 *  1. BG Color (Ocean)
 *  2. Water Foam & Stones 1 (Bottom waves + Rocks 01)
 *  3. Water Foam & Stones 2 (Right waves + Rocks 07)
 *  4. Water Foam & Stones 3 (Top waves)
 *  5. Water Foam & Stones 4 (Left waves)
 *  6. Flat Ground (3x3 autotile)
 *  7. Shadow (under elevated cliffs)
 *  8. Elevated Ground Cliff (cliff face)
 *  9. Elevated Ground (plateau 3x3 autotile)
 *  10. Boundaries (Arcade physics colliders for cliffs & ocean perimeter)
 */
export class IslandGenerator {
  private width: number;
  private height: number;
  private tileSize: number;

  constructor(width: number = 30, height: number = 18, tileSize: number = 64) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
  }

  private rnd: () => number = Math.random;
  private static makeRng(a: number) {
    // mulberry32
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  public generate(
    scene: Phaser.Scene,
    seed: number = Math.floor(Math.random() * 2 ** 31),
  ): IslandBuildResult {
    const W = this.width;
    const H = this.height;
    const ts = this.tileSize;

    this.rnd = IslandGenerator.makeRng(seed);
    // 1. Generate heightmap / terrain grid
    const grid = this.generateTerrainGrid(W, H, seed);

    // 2. Create empty tilemap
    const map = scene.make.tilemap({
      tileWidth: ts,
      tileHeight: ts,
      width: W,
      height: H,
    });

    // 3. Attach tileset images with distinct firstgids to prevent texture/animation collisions
    const tsWaterBg = map.addTilesetImage(
      "Water Background color",
      "Water Background color",
      ts,
      ts,
      0,
      0,
      1,
    )!;
    const tsFoam1 = map.addTilesetImage(
      "Water Foam1",
      "Water Foam1",
      ts,
      ts,
      0,
      0,
      2,
    )!;
    const tsFlat = map.addTilesetImage(
      "Tilemap_color3",
      "Tilemap_color3",
      ts,
      ts,
      0,
      0,
      200,
    )!;
    const tsShadow = map.addTilesetImage(
      "Shadow",
      "Shadow",
      ts,
      ts,
      0,
      0,
      260,
    )!;
    const tsElev = map.addTilesetImage(
      "Tilemap_color1",
      "Tilemap_color1",
      ts,
      ts,
      0,
      0,
      270,
    )!;
    const tsRocks1 = map.addTilesetImage(
      "Water_Rocks_01",
      "Water_Rocks_01",
      ts,
      ts,
      0,
      0,
      416,
    )!;
    const tsRocks7 = map.addTilesetImage(
      "Water_Rocks_07",
      "Water_Rocks_07",
      ts,
      ts,
      0,
      0,
      432,
    )!;

    // 4. Create blank layers in proper depth order
    const bgLayer = map.createBlankLayer("BG Color", tsWaterBg)!;
    const foam1Layer = map.createBlankLayer(
      "Water Foam And Stones 1",
      tsFoam1,
    )!;
    const foam2Layer = map.createBlankLayer(
      "Water Foam And Stones 2",
      tsFoam1,
    )!;
    const foam3Layer = map.createBlankLayer(
      "Water Foam And Stones 3",
      tsFoam1,
    )!;
    const foam4Layer = map.createBlankLayer(
      "Water Foam And Stones 4",
      tsFoam1,
    )!;
    const rocksLayer = map.createBlankLayer("Water Rocks", [
      tsRocks1,
      tsRocks7,
    ])!;
    const flatLayer = map.createBlankLayer("Flat Ground", tsFlat)!;
    const shadowLayer = map.createBlankLayer("Shadow", tsShadow)!;
    const cliffLayer = map.createBlankLayer("Elevated Ground Cliff", tsElev)!;
    const elevLayer = map.createBlankLayer("Elevated Ground", tsElev)!;

    bgLayer.setDepth(0);
    foam1Layer.setDepth(1);
    foam2Layer.setDepth(2);
    rocksLayer.setDepth(2.5);
    foam3Layer.setDepth(3);
    foam4Layer.setDepth(4);
    flatLayer.setDepth(5);
    shadowLayer.setDepth(6);
    cliffLayer.setDepth(7);
    elevLayer.setDepth(8);

    const animatedTiles: AnimatedTile[] = [];
    const isLand = (x: number, y: number) =>
      x >= 0 && x < W && y >= 0 && y < H && grid[y][x] !== TerrainType.WATER;
    const isElev = (x: number, y: number) =>
      x >= 0 && x < W && y >= 0 && y < H && grid[y][x] === TerrainType.ELEVATED;

    // 5. Populate layers
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        // Layer 1: BG Color (Sea/Ocean)
        bgLayer.putTileAt(tsWaterBg.firstgid + 0, x, y);

        const currentLand = isLand(x, y);

        // Layers 2-5: Water Foam (placed on water adjacent to land)
        if (!currentLand) {
          // Bottom Foam (Layer 1) - water tile below land
          if (isLand(x, y - 1)) {
            const tile = foam1Layer.putTileAt(tsFoam1.firstgid + 97, x, y)!;
            animatedTiles.push({
              tile,
              firstgid: tsFoam1.firstgid,
              baseIndex: 97,
              frameStep: 3,
              frameCount: 16,
            });
          } else if (isLand(x - 1, y - 1) && !isLand(x - 1, y)) {
            // Bottom-right diagonal corner: tile 98 below and to the right of land corner
            const tile = foam1Layer.putTileAt(tsFoam1.firstgid + 98, x, y)!;
            animatedTiles.push({
              tile,
              firstgid: tsFoam1.firstgid,
              baseIndex: 98,
              frameStep: 3,
              frameCount: 16,
            });
          }

          // Right Foam (Layer 2) - water tile to the right of land or diagonally top-right
          if (isLand(x - 1, y)) {
            const tile = foam2Layer.putTileAt(tsFoam1.firstgid + 50, x, y)!;
            animatedTiles.push({
              tile,
              firstgid: tsFoam1.firstgid,
              baseIndex: 50,
              frameStep: 3,
              frameCount: 16,
            });
          } else if (isLand(x - 1, y + 1) && !isLand(x, y + 1)) {
            // Top-right outer corner: tile 2 placed diagonally above-right of land
            const tile = foam2Layer.putTileAt(tsFoam1.firstgid + 2, x, y)!;
            animatedTiles.push({
              tile,
              firstgid: tsFoam1.firstgid,
              baseIndex: 2,
              frameStep: 3,
              frameCount: 16,
            });
          }

          // Top Foam (Layer 3) - water tile above land or diagonally top-left
          if (isLand(x, y + 1)) {
            const tile = foam3Layer.putTileAt(tsFoam1.firstgid + 1, x, y)!;
            animatedTiles.push({
              tile,
              firstgid: tsFoam1.firstgid,
              baseIndex: 1,
              frameStep: 3,
              frameCount: 16,
            });
          } else if (isLand(x + 1, y + 1) && !isLand(x + 1, y)) {
            // Top-left outer corner: tile 0 placed diagonally above-left of land
            const tile = foam3Layer.putTileAt(tsFoam1.firstgid + 0, x, y)!;
            animatedTiles.push({
              tile,
              firstgid: tsFoam1.firstgid,
              baseIndex: 0,
              frameStep: 3,
              frameCount: 16,
            });
          }

          // Left Foam (Layer 4) - water tile to the left of land or diagonally bottom-left
          if (isLand(x + 1, y)) {
            const tile = foam4Layer.putTileAt(tsFoam1.firstgid + 48, x, y)!;
            animatedTiles.push({
              tile,
              firstgid: tsFoam1.firstgid,
              baseIndex: 48,
              frameStep: 3,
              frameCount: 16,
            });
          } else if (isLand(x + 1, y - 1) && !isLand(x, y - 1)) {
            // Bottom-left outer corner: tile 96 placed diagonally below-left of land
            const tile = foam4Layer.putTileAt(tsFoam1.firstgid + 96, x, y)!;
            animatedTiles.push({
              tile,
              firstgid: tsFoam1.firstgid,
              baseIndex: 96,
              frameStep: 3,
              frameCount: 16,
            });
          }
        }

        // Layer 6: Flat Ground (3x3 autotile on Tilemap_color3)
        if (currentLand) {
          // Middle foam overlay (tile 49) on land perimeter edges
          const isPerimeter =
            !isLand(x - 1, y) ||
            !isLand(x + 1, y) ||
            !isLand(x, y + 1) ||
            !isLand(x, y - 1);
          if (isPerimeter) {
            const tile = foam1Layer.putTileAt(tsFoam1.firstgid + 49, x, y)!;
            animatedTiles.push({
              tile,
              firstgid: tsFoam1.firstgid,
              baseIndex: 49,
              frameStep: 3,
              frameCount: 16,
            });
          }
          const flatIdx = this.get3x3Index(x, y, isLand, {
            tl: 0,
            t: 1,
            tr: 2,
            l: 9,
            c: 10,
            r: 11,
            bl: 18,
            b: 19,
            br: 20,
            topCap: 3,
            verticalMiddleCap: 12,
            bottomCap: 21,
            leftCap: 27,
            horizontalMiddleCap: 28,
            rightCap: 29,
            roundCap: 35,
          });
          flatLayer.putTileAt(tsFlat.firstgid + flatIdx, x, y);
        }

        // Layer 8: Elevated Ground Cliff (cliff face when elevated drops down to flat)
        if (isElev(x, y - 1) && !isElev(x, y) && currentLand) {
          const isCliffLeft = !isElev(x - 1, y - 1);
          const isCliffRight = !isElev(x + 1, y - 1);
          const cliffIdx =
            isCliffLeft && isCliffRight
              ? 44
              : isCliffLeft
                ? 41
                : isCliffRight
                  ? 43
                  : 42;
          cliffLayer.putTileAt(tsElev.firstgid + cliffIdx, x, y);

          // Layer 7: Shadow (cast under cliff face)
          shadowLayer.putTileAt(tsShadow.firstgid + 4, x, y);
          if (y + 1 < H && isLand(x, y + 1) && !isElev(x, y + 1)) {
            shadowLayer.putTileAt(tsShadow.firstgid + 7, x, y + 1);
          }
        }

        // Layer 9: Elevated Ground (plateau surface 3x3 autotile)
        if (isElev(x, y)) {
          const elevIdx = this.get3x3Index(x, y, isElev, {
            tl: 5,
            t: 6,
            tr: 7,
            l: 14,
            c: 15,
            r: 16,
            bl: 23,
            b: 24,
            br: 25,
            topCap: 8,
            verticalMiddleCap: 17,
            bottomCap: 26,
            leftCap: 32,
            horizontalMiddleCap: 33,
            rightCap: 34,
            roundCap: 35,
          });
          elevLayer.putTileAt(tsElev.firstgid + elevIdx, x, y);
        }
      }
    }

    // 6. Water stones: scatter animated rocks in offshore water
    this.addWaterRocks(rocksLayer, tsRocks1, tsRocks7, isLand, animatedTiles);

    // 7. Setup tile animation timer (cycles foam & rock frames every 100ms)
    this.setupTileAnimations(scene, animatedTiles);

    // 8. Create collision boundaries (cliffs & water perimeter)
    const boundaries = this.createBoundaries(scene, grid);

    // 9. Find spawn points (Player + Enemies)
    const spawnPoints = this.findSpawnPoints(grid);

    const terrainAt = (wx: number, wy: number): TerrainType =>
      grid[Math.floor(wy / ts)]?.[Math.floor(wx / ts)] ?? TerrainType.WATER;
    return { map, boundaries, spawnPoints, terrainAt };
  }

  /** Generates organic island terrain matrix (Water, Flat, Elevated) */
  private generateTerrainGrid(
    W: number,
    H: number,
    _seed: number,
  ): TerrainType[][] {
    const grid: TerrainType[][] = Array.from({ length: H }, () =>
      Array(W).fill(TerrainType.WATER),
    );
    const cx = W / 2;
    const cy = H / 2;
    const r = this.rnd;
    const p1 = r() * 6.28,
      p2 = r() * 6.28,
      p3 = r() * 6.28;
    const f1 = 0.4 + r() * 0.3,
      f2 = 0.5 + r() * 0.3;

    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        // Keep 2-tile border as water
        if (x <= 1 || x >= W - 2 || y <= 1 || y >= H - 2) continue;

        const nx = (x - cx) / (W * 0.44);
        const ny = (y - cy) / (H * 0.42);
        const dist = Math.sqrt(nx * nx + ny * ny);

        // Sinusoidal noise layers for natural coastline curves
        const noise =
          (Math.sin(x * f1 + p1) + Math.cos(y * f2 + p2)) * 0.15 +
          Math.sin(x * 0.2 - y * 0.3 + p3) * 0.08;

        const h = 1.0 - dist + noise;

        if (h > 0.62 && dist < 0.52 && y < H - 4) {
          grid[y][x] = TerrainType.ELEVATED;
        } else if (h > 0.22) {
          grid[y][x] = TerrainType.FLAT;
        }
      }
    }

    // Smoothing pass: eliminate isolated single tiles
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        let landNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (grid[y + dy][x + dx] !== TerrainType.WATER) landNeighbors++;
          }
        }
        if (grid[y][x] === TerrainType.WATER && landNeighbors >= 5) {
          grid[y][x] = TerrainType.FLAT;
        } else if (grid[y][x] !== TerrainType.WATER && landNeighbors <= 2) {
          grid[y][x] = TerrainType.WATER;
        }
      }
    }

    return grid;
  }

  /** Standard 3x3 autotile lookup */
  private get3x3Index(
    x: number,
    y: number,
    check: (x: number, y: number) => boolean,
    idx: {
      tl: number;
      t: number;
      tr: number;
      l: number;
      c: number;
      r: number;
      bl: number;
      b: number;
      br: number;
      topCap: number;
      verticalMiddleCap: number;
      bottomCap: number;
      leftCap: number;
      horizontalMiddleCap: number;
      rightCap: number;
      roundCap: number;
    },
  ): number {
    const hasT = check(x, y - 1);
    const hasB = check(x, y + 1);
    const hasL = check(x - 1, y);
    const hasR = check(x + 1, y);

    if (!hasT && !hasL && !hasR && !hasB) return idx.roundCap;
    if (!hasT && !hasL && !hasR && hasB) return idx.topCap;
    if (hasT && !hasL && !hasR && !hasB) return idx.bottomCap;
    if (!hasT && !hasL && hasR && !hasB) return idx.leftCap;
    if (!hasT && hasL && !hasR && !hasB) return idx.rightCap;

    // 1-tile wide middle corridors (opposite sides bordered)
    if (!hasL && !hasR) return idx.verticalMiddleCap;
    if (!hasT && !hasB) return idx.horizontalMiddleCap;

    if (!hasT && !hasL) return idx.tl;
    if (!hasT && !hasR) return idx.tr;
    if (!hasT) return idx.t;
    if (!hasB && !hasL) return idx.bl;
    if (!hasB && !hasR) return idx.br;
    if (!hasB) return idx.b;
    if (!hasL) return idx.l;
    if (!hasR) return idx.r;
    return idx.c;
  }

  /** Scatter animated water rocks in offshore water */
  private addWaterRocks(
    rocksLayer: Phaser.Tilemaps.TilemapLayer,
    tsRocks1: Phaser.Tilemaps.Tileset,
    tsRocks7: Phaser.Tilemaps.Tileset,
    isLand: (x: number, y: number) => boolean,
    animatedTiles: AnimatedTile[],
  ) {
    const W = this.width,
      H = this.height;

    // open water, 2-tile margin with no land and no tiles already placed
    const spot = (size: number) => {
      for (let i = 0; i < 50; i++) {
        const x = 2 + Math.floor(this.rnd() * (W - 4 - size));
        const y = 2 + Math.floor(this.rnd() * (H - 4 - size));
        let ok = true;
        for (let dy = -2; dy <= size + 1; dy++) {
          for (let dx = -2; dx <= size + 1; dx++) {
            if (
              isLand(x + dx, y + dy) ||
              rocksLayer.hasTileAt(x + dx, y + dy)
            ) {
              ok = false;
              break;
            }
          }
          if (!ok) break;
        }
        if (ok) return { x, y };
      }
      return null;
    };

    for (let i = 0; i < 3; i++) {
      const p = spot(1);
      if (!p) continue;
      const tile = rocksLayer.putTileAt(tsRocks1.firstgid + 0, p.x, p.y);
      animatedTiles.push({
        tile,
        firstgid: tsRocks1.firstgid,
        baseIndex: 0,
        frameStep: 1,
        frameCount: 16,
      });
    }

    const p = spot(2);
    if (p) {
      for (const q of [
        { dx: 0, dy: 0, idx: 0 },
        { dx: 1, dy: 0, idx: 1 },
        { dx: 0, dy: 1, idx: 16 },
        { dx: 1, dy: 1, idx: 17 },
      ]) {
        const tile = rocksLayer.putTileAt(
          tsRocks7.firstgid + q.idx,
          p.x + q.dx,
          p.y + q.dy,
        );
        animatedTiles.push({
          tile,
          firstgid: tsRocks7.firstgid,
          baseIndex: q.idx,
          frameStep: 2,
          frameCount: 8,
        });
      }
    }
  }

  /** Tile animation timer (cycles frames every 100ms) */
  private setupTileAnimations(
    scene: Phaser.Scene,
    animatedTiles: AnimatedTile[],
  ) {
    let currentTick = 0;
    const timer = scene.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        currentTick++;
        for (const item of animatedTiles) {
          const frame = currentTick % item.frameCount;
          item.tile.index =
            item.firstgid + item.baseIndex + frame * item.frameStep;
        }
      },
    });

    scene.events.once("shutdown", () => timer.destroy());
  }

  /** Collision boundaries: cliff lines and island water perimeter */
  private createBoundaries(
    scene: Phaser.Scene,
    grid: TerrainType[][],
  ): Phaser.Physics.Arcade.StaticGroup {
    const boundaries = scene.physics.add.staticGroup();
    const W = this.width;
    const H = this.height;
    const ts = this.tileSize;

    const T = 2; // wall thickness in px
    const add = (cx: number, cy: number, w: number, h: number) => {
      const zone = scene.add.zone(cx, cy, w, h);
      zone.setData("cliff", true);
      scene.physics.add.existing(zone, true);
      boundaries.add(zone);
    };
    const E = TerrainType.ELEVATED,
      F = TerrainType.FLAT,
      WA = TerrainType.WATER;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const t = grid[y][x];

        // Cliff face: whole flat tile under an elevated tile is solid (cliff sprite sits here)
        if (t === F && y > 0 && grid[y - 1][x] === E) {
          add(x * ts + ts / 2, y * ts + ts / 2, ts, ts);
        }

        // Vertical wall on the shared edge with the right neighbour
        if (x < W - 1) {
          const r = grid[y][x + 1];
          if ((t === F && r === E) || (t === E && r === F)) {
            add((x + 1) * ts, y * ts + ts / 2, T, ts);
          }
        }

        // Horizontal wall on the plateau's top edge (flat above, elevated below)
        if (y < H - 1 && t === F && grid[y + 1][x] === E) {
          add(x * ts + ts / 2, (y + 1) * ts, ts, T);
        }

        // Water perimeter (unchanged)
        if (t === WA) {
          const land = (xx: number, yy: number) =>
            xx >= 0 && xx < W && yy >= 0 && yy < H && grid[yy][xx] !== WA;
          if (
            land(x, y - 1) ||
            land(x, y + 1) ||
            land(x - 1, y) ||
            land(x + 1, y)
          ) {
            add(x * ts + ts / 2, y * ts + ts / 2, ts, ts);
          }
        }
      }
    }

    return boundaries;
  }

  /** Safe spawn points for player and enemies */
  private findSpawnPoints(grid: TerrainType[][]): {
    player: { x: number; y: number } | null;
    enemies: { x: number; y: number; type: string }[];
  } {
    const W = this.width;
    const H = this.height;
    const ts = this.tileSize;

    const flatTiles: { x: number; y: number }[] = [];
    const elevTiles: { x: number; y: number }[] = [];

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (grid[y][x] === TerrainType.FLAT) {
          flatTiles.push({ x: x * ts + ts / 2, y: y * ts + ts / 2 });
        } else if (grid[y][x] === TerrainType.ELEVATED) {
          elevTiles.push({ x: x * ts + ts / 2, y: y * ts + ts / 2 });
        }
      }
    }

    // Player spawn: flat ground near center-left
    const playerSpawn =
      flatTiles.length > 0
        ? flatTiles[Math.floor(flatTiles.length * 0.3)]
        : { x: (W * ts) / 2, y: (H * ts) / 2 };

    // Enemy spawns: distributed on flat & elevated ground
    const enemies: { x: number; y: number; type: string }[] = [];

    if (flatTiles.length > 10) {
      enemies.push({
        x: flatTiles[Math.floor(flatTiles.length * 0.7)].x,
        y: flatTiles[Math.floor(flatTiles.length * 0.7)].y,
        type: "skeleton",
      });
      enemies.push({
        x: flatTiles[Math.floor(flatTiles.length * 0.8)].x,
        y: flatTiles[Math.floor(flatTiles.length * 0.8)].y,
        type: "slime",
      });
      enemies.push({
        x: flatTiles[Math.floor(flatTiles.length * 0.9)].x,
        y: flatTiles[Math.floor(flatTiles.length * 0.9)].y,
        type: "bombfish",
      });
    }

    if (elevTiles.length > 0) {
      enemies.push({
        x: elevTiles[Math.floor(elevTiles.length * 0.5)].x,
        y: elevTiles[Math.floor(elevTiles.length * 0.5)].y,
        type: "goblin", // Boss/Troll on top of the hill!
      });
    }

    return { player: playerSpawn, enemies };
  }
}
