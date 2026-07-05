export interface TileAnim {
  frames?: number[];
  speed?: number;
  loop?: boolean;
  from?: number;
  to?: number;
  duration?: number|number[];
}

// Playable characters live in worldBlocks.png as 8 identical 4-column blocks
// (cols 0-31 of rows 24-29). Character 0 is the original hardcoded player;
// every other character's frames are simply the same frame numbers + index*4.
export const CHARACTER_COUNT = 8;

// Frame layout for character 0 (single number = idle frame, range = walk cycle).
const CHARACTER_ANIM_TEMPLATE: Record<string, TileAnim | number> = {
  "idle-down": 936,
  "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
  "idle-right": 976,
  "walk-right": { from: 975, to: 978, loop: true, speed: 8 },
  "idle-up": 1014,
  "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  "idle-left": 1053,
  "walk-left": { from: 1053, to: 1056, loop: true, speed: 8 },
  "attack-down": 1092,
  "attack-right": 1093,
  "attack-up": 1094,
  "attack-left": 1095,
  "shield-down": 1131,
  "shield-right": 1132,
  "shield-up": 1133,
  "shield-left": 1134,
};

// The still frame used to preview a character in the selection screen.
export function getCharacterPreviewFrame(index: number): number {
  return 936 + index * 4;
}

function buildCharacterAnims(): Record<string, TileAnim | number> {
  const out: Record<string, TileAnim | number> = {};
  for (let i = 0; i < CHARACTER_COUNT; i++) {
    const offset = i * 4;
    for (const [name, def] of Object.entries(CHARACTER_ANIM_TEMPLATE)) {
      const key = `char${i}-${name}`;
      if (typeof def === "number") {
        out[key] = def + offset;
      } else {
        out[key] = {
          ...def,
          from: (def.from as number) + offset,
          to: (def.to as number) + offset,
        };
      }
    }
  }
  return out;
}

export const WORLD_BLOCK_ANIMS: Record<number | string, TileAnim | number> = {
  489: { frames: [489, 490], speed: 8, loop: true },
  969: { frames: [969, 970, 971, 972, 973, 974], speed: 8, loop: true },
  // Spinning coin (row 24, cols 33-38), just above the attack after-effects.
  "coin": { frames: [969, 970, 971, 972, 973, 974], loop: true, speed: 10 },
  // Rabbit NPC (rows 20-21, laid out like the slime): row20 = down (780,781) +
  // right (782,783); row21 = up (819,820) + left (821,822).
  "rabbit-idle-down": { frames: [780, 781], loop: true, speed: 3 },
  "rabbit-idle-right": { frames: [782, 783], loop: true, speed: 3 },
  "rabbit-idle-up": { frames: [819, 820], loop: true, speed: 3 },
  "rabbit-idle-left": { frames: [821, 822], loop: true, speed: 3 },
  ...buildCharacterAnims(),
  "slime-idle-down": 858,
  "slime-walk-down": { from: 858, to: 859, loop: true, speed: 8 },
  "slime-idle-right": 860,
  "slime-walk-right": { from: 860, to: 861, loop: true, speed: 8 },
  "slime-idle-up": 897,
  "slime-walk-up": { from: 897, to: 898, loop: true, speed: 8 },
  "slime-idle-left": 899,
  "slime-walk-left": { from: 899, to: 900, loop: true, speed: 8 },
  // Ghost frames live in worldBlocks.png, laid out like the slime:
  // row 22 = down (862,863) + right (864,865); row 23 = up (901,902) + left (903,904).
  "ghost-idle-down": 862,
  "ghost-walk-down": { from: 862, to: 863, loop: true, speed: 6 },
  "ghost-idle-right": 864,
  "ghost-walk-right": { from: 864, to: 865, loop: true, speed: 6 },
  "ghost-idle-up": 901,
  "ghost-walk-up": { from: 901, to: 902, loop: true, speed: 6 },
  "ghost-idle-left": 903,
  "ghost-walk-left": { from: 903, to: 904, loop: true, speed: 6 },
  "got-key": { frames: [137, 138, 99], loop: false, speed: 16 },
  "chest-open": { frames: [137, 138], loop: false, speed: 2 },
  "got-shield": { frames: [137, 138, 179], loop: false, speed: 1 },
  "got-sword": { frames: [137, 138, 180], loop: false, speed: 2 },
  "got-redPotion": { frames: [137, 138, 140], loop: false, speed: 2 },
  "got-greenPotion": { frames: [137, 138, 141], loop: false, speed: 2 },
  "got-heart": { frames: [137, 138, 176], loop: false, speed: 2 },
  "open-door": { frames: [21, 22],  loop: false, speed: 2 },
  "close-door": { frames: [22, 21],  loop: false, speed: 2 },
  "oldman-idle-down": 866,
  "oldman-idle-up": 905,
  "oldman-idle-left": 907,
  "oldman-idle-right": 868,
  "roulette": {from: 0 ,to: 2, loop: true, speed: 12},
  "attack-afterEffects-right": {
    frames: [1009,1010,1011,1012,1013],
    loop: false,
    speed: 12
  },
  "attack-afterEffects-left": {
    frames: [1048,1049,1050,1051,1052],
    loop: false,
    speed: 12
  },
  "attack-afterEffects-down": {
    frames: [1126,1127,1128,1129,1130],
    loop: false,
    speed: 12
  },
  "attack-afterEffects-up": {
    frames: [1087,1088,1089,1090,1091],
    loop: false,
    speed: 12
  },
  "hurdle": {
    frames: [460,459],
    loop: true,
    speed: 8
  },
  "skull-attack": {
    frames: [533,534],
    loop: true,
    speed: 8
  },
  "bone-attack": {
    frames: [536,537,538,539],
    loop: true,
    speed: 8
  },
  "wizard-idle-down": 784,
  "wizard-idle-up": 823,
  "wizard-idle-left": 786,
  "wizard-idle-right": 825,
  "wizard-attack-down": 792,
  "wizard-attack-up": 793,
  "wizard-attack-left": 794,
  "wizard-attack-right": 795,
  "wizard-walk-down": {from: 784, to: 785, loop: true, speed: 8},
  "wizard-walk-up": {from: 823, to: 824, loop: true, speed: 8},
  "wizard-walk-left": {from: 786, to: 787, loop: true, speed: 8},
  "wizard-walk-right": {from: 825, to: 826, loop: true, speed: 8},
};

export const WORLD_BLOCK_ANIMS2: Record<number|string,any> = {
  "full-heart": {
    x: 0,
    y: 224,
    height: 48,
    width: 48,
  },
  "half-heart": {
    x: 48,
    y: 224,
    height: 48,
    width: 48,
  },
  "empty-heart": {
    x: 96,
    y: 224,
    height: 48,
    width: 48,
  },
  "shield": {
    x: 144,
    y: 224,
    height: 48,
    width: 48,
  },
  "sword": {
    x: 192,
    y: 224,
    height: 48,
    width: 48,
  }
}

export const WINDMILL_ANIMS: Record<number|string,any> = {
  "windmill": {
    x: 240,
    y: 96,
    width: 96,
    height: 48,
    sliceX: 2,
    sliceY: 1,
    anims: {
      "windmill": {
        frames: [0,1],
        loop: true,
        speed: 8,
      }
    }
  }
}