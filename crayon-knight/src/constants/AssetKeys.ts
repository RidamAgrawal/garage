/**
 * Enum for Asset Keys (Textures, Audio, etc.)
 * Phaser resource cache ke string keys.
 */
export enum AssetKeys {
  // Characters (placeholder — will be removed once all sprites are loaded)
  PLAYER = "PLAYER",
  SKELETON = "SKELETON",
  SLIME = "SLIME",
  GOBLIN = "GOBLIN",

  // === Warrior Sprite Keys (used as spritesheet texture keys in Phaser cache) ===
  WARRIOR_IDLE = "warrior-idle",
  WARRIOR_RUN = "warrior-run",
  WARRIOR_ATTACK = "warrior-attack",   // FSM ke liye standardized key
  WARRIOR_ATTACK2 = "warrior-attack2",
  WARRIOR_GUARD = "warrior-guard",

  // === Gnome Sprite Keys ===
  GNOME_IDLE = "gnome-idle",
  GNOME_RUN = "gnome-run",             // File hai Gnome_Walk par FSM "run" expect karta hai
  GNOME_ATTACK = "gnome-attack",

  // === Skull Sprite Keys ===
  SKULL_IDLE = "skull-idle",
  SKULL_RUN = "skull-run",             // File hai Skull_Walk par FSM "run" expect karta hai
  SKULL_ATTACK = "skull-attack",

  // === Spider Sprite Keys ===
  SPIDER_IDLE = "spider-idle",
  SPIDER_RUN = "spider-run",
  SPIDER_ATTACK = "spider-attack",

  // === Troll Sprite Keys ===
  TROLL_IDLE = "troll-idle",
  TROLL_RUN = "troll-run",             // File hai Troll_Walk par FSM "run" expect karta hai
  TROLL_ATTACK = "troll-attack",

  // Tilesets
  DUNGEON_TILES = "DUNGEON_TILES",

  // UI
  HEART_FULL = "HEART_FULL",
  HEART_HALF = "HEART_HALF",
  HEART_EMPTY = "HEART_EMPTY",
  GOLD_ICON = "GOLD_ICON",

  // Effects
  SLASH_EFFECT = "SLASH_EFFECT",
  HIT_EFFECT = "HIT_EFFECT",

  // Audio
  BGM_DUNGEON = "BGM_DUNGEON",
  SFX_SWORD = "SFX_SWORD",
  SFX_HIT = "SFX_HIT",
  SFX_PICKUP = "SFX_PICKUP",
  SFX_DEATH = "SFX_DEATH",
}

// =============================================
// 🎬 Animation Asset Registry
// =============================================
// Yahan saare spritesheets define hote hain with their loading info + animation config.
// PreloadScene isse read karke load.spritesheet() call karta hai
// AnimationConfig isse read karke scene.anims.create() call karta hai
//
// KEY RULE: Animation keys FSM pattern follow karein:
//   ${animPrefix}-idle, ${animPrefix}-run, ${animPrefix}-attack, ${animPrefix}-hurt
//
// Agar koi sprite file ka naam alag hai (e.g. "Gnome_Walk.png"),
// toh bhi key "gnome-run" hona chahiye taaki FSM ke saath match kare.

export const AnimationAssets: Record<
  string,
  {
    path: string;
    frameWidth: number;
    frameHeight: number;
    frameRate: number;
    start: number;
    end: number;
    repeat: -1 | 0;
  }
> = {
  // ─── Warrior (Player) ───
  [AssetKeys.WARRIOR_IDLE]: {
    path: "assets/characters/Player/Warrior/Warrior_Idle.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 7,
    repeat: -1,
  },
  [AssetKeys.WARRIOR_RUN]: {
    path: "assets/characters/Player/Warrior/Warrior_Run.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 5,
    repeat: -1,
  },
  [AssetKeys.WARRIOR_ATTACK]: {
    path: "assets/characters/Player/Warrior/Warrior_Attack1.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 12,     // Attack fast feel kare
    start: 0,
    end: 3,
    repeat: 0,         // Attack sirf ek baar chale, phir idle mein jaaye
  },
  [AssetKeys.WARRIOR_ATTACK2]: {
    path: "assets/characters/Player/Warrior/Warrior_Attack2.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 12,
    start: 0,
    end: 3,
    repeat: 0,
  },
  [AssetKeys.WARRIOR_GUARD]: {
    path: "assets/characters/Player/Warrior/Warrior_Guard.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 5,
    repeat: 0,
  },

  // ─── Skull (used by Skeleton enemy) ───
  [AssetKeys.SKULL_IDLE]: {
    path: "assets/characters/Enemies/Skull/Skull_Idle.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 7,
    repeat: -1,
  },
  [AssetKeys.SKULL_RUN]: {
    path: "assets/characters/Enemies/Skull/Skull_Run.png",  // File naam Run hai, key bhi "run"
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 5,
    repeat: -1,
  },
  [AssetKeys.SKULL_ATTACK]: {
    path: "assets/characters/Enemies/Skull/Skull_Attack.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 10,
    start: 0,
    end: 5,
    repeat: 0,
  },
  // ─── Gnome (used by GNOME enemy) ───
  [AssetKeys.GNOME_IDLE]: {
    path: "assets/characters/Enemies/Gnome/Gnome_Idle.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 7,
    repeat: -1,
  },
  [AssetKeys.GNOME_RUN]: {
    path: "assets/characters/Enemies/Gnome/Gnome_Run.png",  // File naam Run hai, key bhi "run"
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 5,
    repeat: -1,
  },
  [AssetKeys.GNOME_ATTACK]: {
    path: "assets/characters/Enemies/Gnome/Gnome_Attack.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 10,
    start: 0,
    end: 5,
    repeat: 0,
  },

  // ─── Spider (used by Slime enemy) ───
  [AssetKeys.SPIDER_IDLE]: {
    path: "assets/characters/Enemies/Spider/Spider_Idle.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 7,
    repeat: -1,
  },
  [AssetKeys.SPIDER_RUN]: {
    path: "assets/characters/Enemies/Spider/Spider_Run.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 4,
    repeat: -1,
  },
  [AssetKeys.SPIDER_ATTACK]: {
    path: "assets/characters/Enemies/Spider/Spider_Attack.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 10,
    start: 0,
    end: 7,
    repeat: 0,
  },

  // ─── Troll (used by Goblin enemy / future Boss) ───
  [AssetKeys.TROLL_IDLE]: {
    path: "assets/characters/Enemies/Troll/Troll_Idle.png",
    frameWidth: 384,
    frameHeight: 384,
    frameRate: 8,
    start: 0,
    end: 11,
    repeat: -1,
  },
  [AssetKeys.TROLL_RUN]: {
    path: "assets/characters/Enemies/Troll/Troll_Walk.png",  // Walk file par "run" key
    frameWidth: 384,
    frameHeight: 384,
    frameRate: 8,
    start: 0,
    end: 9,
    repeat: -1,
  },
  [AssetKeys.TROLL_ATTACK]: {
    path: "assets/characters/Enemies/Troll/Troll_Attack.png",
    frameWidth: 384,
    frameHeight: 384,
    frameRate: 10,
    start: 0,
    end: 5,
    repeat: 0,
  },
};

// =============================================
// 🗺️ Tileset Image Registry
// =============================================
// PreloadScene isse loop karke this.load.image() call karta hai
// Har entry ka key Tiled editor mein tileset ka naam match karna chahiye

export interface TilesetImageEntry {
  key: string;          // Phaser cache key (Tiled tileset naam match karna chahiye)
  path: string;         // public/ folder ke relative path
}

export const TILESET_IMAGES: TilesetImageEntry[] = [
  // ─── Terrain / Ground Tilesets ───
  { key: "tileset-shadow",               path: "assets/tilesets/Shadow.png" },
  { key: "tileset-tilemap-color-1",      path: "assets/tilesets/Tilemap_color1.png" },
  { key: "tileset-tilemap-color-2",      path: "assets/tilesets/Tilemap_color2.png" },
  { key: "tileset-tilemap-color-3",      path: "assets/tilesets/Tilemap_color3.png" },
  { key: "tileset-tilemap-color-4",      path: "assets/tilesets/Tilemap_color4.png" },
  { key: "tileset-tilemap-color-5",      path: "assets/tilesets/Tilemap_color5.png" },
  { key: "tileset-tilemap-elevation",    path: "assets/tilesets/Tilemap_Elevation.png" },
  { key: "tileset-tilemap-flat",         path: "assets/tilesets/Tilemap_Flat.png" },
  { key: "tileset-tilemap-zindex",       path: "assets/tilesets/Tilemap_zindex.png" },

  // ─── Water Tilesets ───
  { key: "tileset-water-background-color",   path: "assets/tilesets/Water Background color.png" },
  { key: "tileset-water-background-color-2", path: "assets/tilesets/Water Background color2.png" },
  { key: "tileset-water-foam-1",             path: "assets/tilesets/Water Foam1.png" },
  { key: "tileset-water-foam-2",             path: "assets/tilesets/Water Foam2.png" },
  { key: "tileset-water-rocks-01",           path: "assets/tilesets/Water_Rocks_01.png" },
  { key: "tileset-water-rocks-02",           path: "assets/tilesets/Water_Rocks_02.png" },
  { key: "tileset-water-rocks-03",           path: "assets/tilesets/Water_Rocks_03.png" },
  { key: "tileset-water-rocks-04",           path: "assets/tilesets/Water_Rocks_04.png" },
  { key: "tileset-water-rocks-05",           path: "assets/tilesets/Water_Rocks_05.png" },
  { key: "tileset-water-rocks-06",           path: "assets/tilesets/Water_Rocks_06.png" },
  { key: "tileset-water-rocks-07",           path: "assets/tilesets/Water_Rocks_07.png" },
  { key: "tileset-water-rocks-08",           path: "assets/tilesets/Water_Rocks_08.png" },

  // ─── Structure Tilesets ───
  { key: "tileset-bridge",  path: "assets/tilesets/structures/Bridge_All.png" },
  { key: "tileset-tree",    path: "assets/tilesets/structures/Tree.png" },
  { key: "tileset-tree1",   path: "assets/tilesets/structures/Tree1.png" },
  { key: "tileset-tree2",   path: "assets/tilesets/structures/Tree2.png" },
  { key: "tileset-tree3",   path: "assets/tilesets/structures/Tree3.png" },
  { key: "tileset-tree4",   path: "assets/tilesets/structures/Tree4.png" },
];

// =============================================
// 🗺️ Tilemap JSON Registry
// =============================================
export interface TilemapEntry {
  key: string;          // Phaser cache key (this.make.tilemap({ key }) mein use hoga)
  path: string;         // public/ ke relative path
}

export const TILEMAPS: TilemapEntry[] = [
  { key: "map", path: "map/firstMap.json" },
];
