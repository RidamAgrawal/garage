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
  WARRIOR_IDLE_WITH_SHIELD = "warrior-idle-with-shield",
  WARRIOR_RUN_WITH_SHIELD = "warrior-run-with-shield",
  WARRIOR_RUN = "warrior-run",
  WARRIOR_ATTACK = "warrior-attack", // FSM ke liye standardized key
  WARRIOR_ATTACK2 = "warrior-attack2",
  WARRIOR_GUARD = "warrior-defend",

  // === Gnome Sprite Keys ===
  GNOME_IDLE = "gnome-idle",
  GNOME_RUN = "gnome-run", // File hai Gnome_Walk par FSM "run" expect karta hai
  GNOME_ATTACK = "gnome-attack",

  // === Skull Sprite Keys ===
  SKULL_IDLE = "skull-idle",
  SKULL_RUN = "skull-run", // File hai Skull_Walk par FSM "run" expect karta hai
  SKULL_ATTACK = "skull-attack",
  SKULL_GUARD = "skull-defend",

  // === Spider Sprite Keys ===
  SPIDER_IDLE = "spider-idle",
  SPIDER_RUN = "spider-run",
  SPIDER_ATTACK = "spider-attack",

  // === Troll Sprite Keys ===
  TROLL_IDLE = "troll-idle",
  TROLL_RUN = "troll-run", // File hai Troll_Walk par FSM "run" expect karta hai
  TROLL_ATTACK = "troll-attack",

  // === Bomb Fish Sprite Keys ===
  BOMBFISH_IDLE = "bombfish-idle",
  BOMBFISH_RUN = "bombfish-run", // File hai Troll_Walk par FSM "run" expect karta hai
  BOMBFISH_ATTACK = "bombfish-attack",

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
  BOMB_SPIN = "bomb-spin",
  BOMB_FUSE = "bomb-fuse",

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
  [AssetKeys.WARRIOR_IDLE_WITH_SHIELD]: {
    path: "assets/characters/Player/Warrior/Warrior_Idle.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 7,
    repeat: -1,
  },
  [AssetKeys.WARRIOR_IDLE]: {
    path: "assets/characters/Player/Warrior/Warrior_Idle_Without_Shield.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 7,
    repeat: -1,
  },
  [AssetKeys.WARRIOR_RUN_WITH_SHIELD]: {
    path: "assets/characters/Player/Warrior/Warrior_Run.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 8,
    start: 0,
    end: 5,
    repeat: -1,
  },
  [AssetKeys.WARRIOR_RUN]: {
    path: "assets/characters/Player/Warrior/Warrior_Run_Without_Shield.png",
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
    frameRate: 12, // Attack fast feel kare
    start: 0,
    end: 3,
    repeat: 0, // Attack sirf ek baar chale, phir idle mein jaaye
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
    path: "assets/characters/Enemies/Skull/Skull_Run.png", // File naam Run hai, key bhi "run"
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
    end: 6,
    repeat: 0,
  },
  [AssetKeys.SKULL_GUARD]: {
    path: "assets/characters/Enemies/Skull/Skull_Guard.png",
    frameWidth: 192,
    frameHeight: 192,
    frameRate: 10,
    start: 0,
    end: 6,
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
    path: "assets/characters/Enemies/Gnome/Gnome_Run.png", // File naam Run hai, key bhi "run"
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
    path: "assets/characters/Enemies/Troll/Troll_Walk.png", // Walk file par "run" key
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
  [AssetKeys.BOMBFISH_IDLE]: {
    path: "assets/characters/Enemies/Bomb Fish/Bomb Fish_Idle.png",
    frameWidth: 192,
    frameHeight: 192,
    start: 0,
    end: 7,
    frameRate: 10,
    repeat: -1,
  },
  [AssetKeys.BOMBFISH_RUN]: {
    path: "assets/characters/Enemies/Bomb Fish/Bomb Fish_Run.png",
    frameWidth: 192,
    frameHeight: 192,
    start: 0,
    end: 5,
    frameRate: 10,
    repeat: -1,
  },
  [AssetKeys.BOMBFISH_ATTACK]: {
    path: "assets/characters/Enemies/Bomb Fish/Bomb Fish_Shoot.png",
    frameWidth: 192,
    frameHeight: 192,
    start: 0,
    end: 6,
    frameRate: 10,
    repeat: 0,
  },
  [AssetKeys.BOMB_SPIN]: {
    path: "assets/characters/Enemies/Bomb/Bomb_Spinning.png",
    frameWidth: 128,
    frameHeight: 128,
    start: 0,
    end: 3,
    frameRate: 12,
    repeat: -1,
  },
  [AssetKeys.BOMB_FUSE]: {
    path: "assets/characters/Enemies/Bomb/Bomb_FuseLit.png",
    frameWidth: 128,
    frameHeight: 128,
    start: 0,
    end: 3,
    frameRate: 12,
    repeat: -1,
  },
  explosion1: {
    path: "assets/Particle FX/Explosion_01.png",
    frameWidth: 192,
    frameHeight: 192,
    start: 0,
    end: 7,
    frameRate: 16,
    repeat: 0,
  },
};

// =============================================
// 🗺️ Tileset Image Registry
// =============================================
// PreloadScene isse loop karke this.load.image() call karta hai
// Har entry ka key Tiled editor mein tileset ka naam match karna chahiye

export interface TilesetImageEntry {
  key: string; // Phaser cache key (Tiled tileset naam match karna chahiye)
  path: string; // public/ folder ke relative path
}

export const TILESET_IMAGES: TilesetImageEntry[] = [
  // ─── Terrain / Ground Tilesets ───
  { key: "Shadow", path: "assets/tilesets/Shadow.png" },
  { key: "Tilemap_color1", path: "assets/tilesets/Tilemap_color1.png" },
  { key: "Tilemap_color2", path: "assets/tilesets/Tilemap_color2.png" },
  { key: "Tilemap_color3", path: "assets/tilesets/Tilemap_color3.png" },
  { key: "Tilemap_color4", path: "assets/tilesets/Tilemap_color4.png" },
  { key: "Tilemap_color5", path: "assets/tilesets/Tilemap_color5.png" },
  { key: "Tilemap_Elevation", path: "assets/tilesets/Tilemap_Elevation.png" },
  { key: "Tilemap_Flat", path: "assets/tilesets/Tilemap_Flat.png" },
  { key: "Tilemap_zindex", path: "assets/tilesets/Tilemap_zindex.png" },

  // ─── Water Tilesets ───
  {
    key: "Water Background color",
    path: "assets/tilesets/Water Background color.png",
  },
  {
    key: "Water Background color2",
    path: "assets/tilesets/Water Background color2.png",
  },
  { key: "Water Foam1", path: "assets/tilesets/Water Foam1.png" },
  { key: "Water Foam2", path: "assets/tilesets/Water Foam2.png" },
  { key: "Water_Rocks_01", path: "assets/tilesets/Water_Rocks_01.png" },
  { key: "Water_Rocks_02", path: "assets/tilesets/Water_Rocks_02.png" },
  { key: "Water_Rocks_03", path: "assets/tilesets/Water_Rocks_03.png" },
  { key: "Water_Rocks_04", path: "assets/tilesets/Water_Rocks_04.png" },
  { key: "Water_Rocks_05", path: "assets/tilesets/Water_Rocks_05.png" },
  { key: "Water_Rocks_06", path: "assets/tilesets/Water_Rocks_06.png" },
  { key: "Water_Rocks_07", path: "assets/tilesets/Water_Rocks_07.png" },
  { key: "Water_Rocks_08", path: "assets/tilesets/Water_Rocks_08.png" },

  // ─── Structure Tilesets ───
  { key: "Bridge_All", path: "assets/tilesets/structures/Bridge_All.png" },
  { key: "Tree", path: "assets/tilesets/structures/Tree.png" },
  { key: "Tree1", path: "assets/tilesets/structures/Tree1.png" },
  { key: "Tree2", path: "assets/tilesets/structures/Tree2.png" },
  { key: "Tree3", path: "assets/tilesets/structures/Tree3.png" },
  { key: "Tree4", path: "assets/tilesets/structures/Tree4.png" },

  // ─── UI Elements ───
  { key: "Banner", path: "assets/UI Elements/Banners/Banner.png" },
  {
    key: "Carved_9Slides",
    path: "assets/UI Elements/Banners/Carved_9Slides.png",
  },
  {
    key: "Ribbon_Blue_3Slides",
    path: "assets/UI Elements/Ribbons/Ribbon_Blue_3Slides.png",
  },
  {
    key: "Button_Blue_3Slides",
    path: "assets/UI Elements/Buttons/Button_Blue_3Slides.png",
  },
  {
    key: "Button_Blue_3Slides_Pressed",
    path: "assets/UI Elements/Buttons/Button_Blue_3Slides_Pressed.png",
  },
  {
    key: "Button_Disable_3Slides",
    path: "assets/UI Elements/Buttons/Button_Disable_3Slides.png",
  },
  {
    key: "Button_Hover_3Slides",
    path: "assets/UI Elements/Buttons/Button_Hover_3Slides.png",
  },
  {
    key: "SmallBlueRoundButton_Regular",
    path: "assets/UI Elements/Buttons/SmallBlueRoundButton_Regular.png",
  },
  {
    key: "SmallBlueRoundButton_Pressed",
    path: "assets/UI Elements/Buttons/SmallBlueRoundButton_Pressed.png",
  },
  {
    key: "TinyRoundBlueButton",
    path: "assets/UI Elements/Buttons/TinyRoundBlueButton.png",
  },
  {
    key: "BigBar_Base",
    path: "assets/UI Elements/Bars/BigBar_Base.png",
  },
  {
    key: "BigBar_Fill",
    path: "assets/UI Elements/Bars/BigBar_Fill.png",
  },
  {
    key: "SmallBar_Base",
    path: "assets/UI Elements/Bars/SmallBar_Base.png",
  },
  {
    key: "SmallBar_Fill",
    path: "assets/UI Elements/Bars/SmallBar_Fill.png",
  },
  { key: "Cursor_1", path: "assets/UI Elements/Cursors/Cursor_01.png" },
  { key: "Cursor_2", path: "assets/UI Elements/Cursors/Cursor_02.png" },
  { key: "Cursor_3", path: "assets/UI Elements/Cursors/Cursor_03.png" },
  { key: "Cursor_4", path: "assets/UI Elements/Cursors/Cursor_04.png" },
];

// =============================================
// 🗺️ Tilemap JSON Registry
// =============================================
export interface TilemapEntry {
  key: string; // Phaser cache key (this.make.tilemap({ key }) mein use hoga)
  path: string; // public/ ke relative path
}

export const TILEMAPS: TilemapEntry[] = [
  { key: "map", path: "map/firstMap.json" },
];

export const BANNER_FRAMES = 64;
