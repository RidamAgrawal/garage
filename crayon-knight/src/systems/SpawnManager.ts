import Phaser from 'phaser';
import { Room } from '@/dungeon/Room';
import { Player } from '@/entities/player/Player';
import { Enemy } from '@/entities/enemies/Enemy';
import { Skeleton } from '@/entities/enemies/Skeleton';
import { Slime } from '@/entities/enemies/Slime';
import { AssetKeys } from '@/constants/AssetKeys';
import { ENEMY_CONFIGS, DUNGEON_CONFIG } from '@/config/BalanceConfig';

/**
 * SpawnManager — Factory Pattern ka example
 * 
 * Hindi: Factory pattern mein ek class (yeh SpawnManager) decide karti hai
 * ki kaunsa object banaya jaaye based on type string.
 * Direct 'new Skeleton()' likhne ki jagah, SpawnManager ko bolo
 * "skeleton bana do" aur woh sahi class pick karke banayegi.
 */
export class SpawnManager {
    private scene: Phaser.Scene;
    private enemyGroup: Phaser.Physics.Arcade.Group;
    private player: Player;
    private tileSize: number;

    constructor(scene: Phaser.Scene, enemyGroup: Phaser.Physics.Arcade.Group, player: Player) {
        this.scene = scene;
        this.enemyGroup = enemyGroup;
        this.player = player;
        this.tileSize = DUNGEON_CONFIG.tileSize;
    }

    /**
     * Room ke enemy spawns ko read karo aur enemies create karo
     * Factory method: type string → actual Enemy subclass instance
     */
    public spawnEnemiesForRoom(room: Room): Enemy[] {
        const spawnedEnemies: Enemy[] = [];

        room.enemySpawns.forEach(spawnConfig => {
            // Tile coords → world pixel coords
            const worldX = spawnConfig.tileX * this.tileSize + (this.tileSize / 2);
            const worldY = spawnConfig.tileY * this.tileSize + (this.tileSize / 2);

            let enemy: Enemy | null = null;

            // Factory switch — type ke basis pe sahi class instantiate karo
            switch (spawnConfig.type) {
                case 'skeleton':
                    enemy = new Skeleton(this.scene, worldX, worldY);
                    break;
                case 'slime':
                    enemy = new Slime(this.scene, worldX, worldY);
                    break;
                case 'goblin':
                    // Goblin uses base Enemy with goblin config and texture
                    enemy = new Enemy(this.scene, worldX, worldY, AssetKeys.GOBLIN, ENEMY_CONFIGS.goblin);
                    enemy.enemyType = 'goblin';
                    break;
                default:
                    console.warn(`Unknown enemy type: ${spawnConfig.type}`);
            }

            if (enemy) {
                enemy.setTarget(this.player);
                this.enemyGroup.add(enemy);
                spawnedEnemies.push(enemy);
            }
        });

        return spawnedEnemies;
    }

    /** Room ko cleared mark karo */
    public clearRoom(room: Room): void {
        room.isCleared = true;
    }
}
