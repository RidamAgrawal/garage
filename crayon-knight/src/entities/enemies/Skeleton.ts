import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { AssetKeys } from '@/constants/AssetKeys';
import { ENEMY_CONFIGS } from '@/config/BalanceConfig';

/**
 * Skeleton Enemy — Melee attacker
 * 
 * Polymorphism: Enemy base class se inherit karta hai
 * par apna specific attack behavior override karta hai
 */
export class Skeleton extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, AssetKeys.SKELETON, ENEMY_CONFIGS.skeleton);
        this.enemyType = 'skeleton';
    }
}
