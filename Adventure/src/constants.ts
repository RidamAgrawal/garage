export interface TileAnim {
  frames?: number[];
  speed?: number;
  loop?: boolean;
  from?: number;
  to?: number;
  duration?: number|number[];
}

export const WORLD_BLOCK_ANIMS: Record<number | string, TileAnim | number> = {
  489: { frames: [489, 490], speed: 8, loop: true },
  969: { frames: [969, 970, 971, 972, 973, 974], speed: 8, loop: true },
  "player-idle-down": 936,
  "player-walk-down": { from: 936, to: 939, loop: true, speed: 8 },
  "player-idle-right": 976,
  "player-walk-right": { from: 975, to: 978, loop: true, speed: 8 },
  "player-idle-up": 1014,
  "player-walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  "player-idle-left": 1053,
  "player-walk-left": { from: 1053, to: 1056, loop: true, speed: 8 },
  "slime-idle-down": 858,
  "slime-walk-down": { from: 858, to: 859, loop: true, speed: 8 },
  "slime-idle-right": 860,
  "slime-walk-right": { from: 860, to: 861, loop: true, speed: 8 },
  "slime-idle-up": 897,
  "slime-walk-up": { from: 897, to: 898, loop: true, speed: 8 },
  "slime-idle-left": 899,
  "slime-walk-left": { from: 899, to: 900, loop: true, speed: 8 },
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
  "player-attack-up": 1094,
  "player-attack-down": 1092,
  "player-attack-left": 1095,
  "player-attack-right": 1093,
  "player-shield-up": 1133,
  "player-shield-down": 1131,
  "player-shield-left": 1134,
  "player-shield-right": 1132,
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