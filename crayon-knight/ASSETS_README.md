# 🎨 Asset Requirements — Crayon Knight

> **NOTE:** This project uses **paid/licensed sprite assets** that are NOT included in this repository.
> You must obtain your own assets to run the game with full graphics.

## Quick Start (Without Assets)

The game will run with **placeholder colored shapes** even without sprite assets.
Just run:
```bash
npm install
npm run dev
```
The PreloadScene automatically generates colored rectangle/circle textures as fallbacks.

---

## Required Assets Structure

If you have your own sprites, place them in `public/assets/characters/` following this structure:

```
public/
└── assets/
    └── characters/
        ├── Player/
        │   ├── Warrior/
        │   │   ├── Warrior_Idle.png      (spritesheet, 192×192 frames)
        │   │   ├── Warrior_Run.png       (spritesheet, 192×192 frames)
        │   │   ├── Warrior_Attack1.png   (spritesheet, 192×192 frames)
        │   │   ├── Warrior_Attack2.png   (spritesheet, 192×192 frames)
        │   │   └── Warrior_Guard.png     (spritesheet, 192×192 frames)
        │   ├── Archer/
        │   ├── Lancer/
        │   ├── Monk/
        │   └── Pawn/                     (NPC characters)
        │
        └── Enemies/
            ├── Gnome/                    (192×192 frames - Regular enemy)
            │   ├── Gnome_Idle.png
            │   ├── Gnome_Walk.png
            │   ├── Gnome_Attack.png
            │   └── Gnome_Dead.png
            ├── Spider/                   (192×192 frames - Regular enemy)
            ├── Skull/                    (192×192 frames - Regular enemy)
            ├── Lizard/                   (192×192 frames - Regular enemy)
            ├── Turtle/                   (320×320 frames - Tank enemy)
            ├── Minotaur/                 (320×320 frames - Mini-boss)
            ├── Troll/                    (384×384 frames - BOSS)
            ├── Shaman/                   (192×192 frames - Ranged)
            ├── Barrel/                   (Trap/Hazard, color variants)
            ├── TNT/                      (Explosive trap)
            └── Torch/                    (Environmental hazard)
```

## Spritesheet Format

All sprites are **horizontal spritesheets** — frames arranged in a single row:

```
┌──────┬──────┬──────┬──────┐
│ F0   │ F1   │ F2   │ F3   │  ← Frames left to right
│ WxH  │ WxH  │ WxH  │ WxH  │  ← Each frame is square (W = H)
└──────┴──────┴──────┴──────┘
```

## Compatible Asset Packs

The art style of this game is designed around **top-down pixel art** dungeon crawlers.
Compatible free alternatives you can use:

- [Dungeon Tileset II by 0x72](https://0x72.itch.io/dungeontileset-ii) — 16×16 tiles
- [Tiny Dungeon by Kenney](https://kenney.nl/assets/tiny-dungeon) — 16×16 characters/tiles
- [Pixel Dungeon Asset Pack](https://pixel-poem.itch.io/dungeon-assetpuck) — 32×32

## License

The game **code** is open-source. The **art assets** are proprietary/licensed and must be obtained separately.
