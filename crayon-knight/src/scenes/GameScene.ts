import Phaser from 'phaser';
import { SceneKeys } from '@/constants/SceneKeys';
import { EventKeys } from '@/constants/EventKeys';
import { EventBus } from '@/events/EventBus';
import { DungeonGenerator } from '@/dungeon/DungeonGenerator';
import { TilemapManager } from '@/dungeon/TilemapManager';
import { SpawnManager } from '@/systems/SpawnManager';
import { Player } from '@/entities/player/Player';
import { DUNGEON_CONFIG } from '@/config/BalanceConfig';

/**
 * GameScene — THE HEART OF THE GAME 💖
 * 
 * Hindi: Yeh sabse important scene hai. Yahan sab kuch combine hota hai:
 * - Dungeon generation
 * - Player aur Enemy spawning
 * - Physics colliders
 * - Camera setup
 * - Event handling
 * 
 * Single Responsibility: GameScene sirf orchestration karta hai.
 * Actual logic Entity classes, Components, aur Systems mein hai.
 */
export class GameScene extends Phaser.Scene {
    private player!: Player;
    private enemyGroup!: Phaser.Physics.Arcade.Group;
    private tilemap!: Phaser.Tilemaps.Tilemap;
    private wallLayer!: Phaser.Tilemaps.TilemapLayer;
    private spawnManager!: SpawnManager;
    private gold: number = 0;

    constructor() {
        super({ key: SceneKeys.GAME });
    }

    create() {
        this.gold = 0;

        // === Step 1: Dungeon Generate Karo ===
        const generator = new DungeonGenerator();
        const { grid, rooms } = generator.generate();

        // === Step 2: Grid ko Phaser Tilemap mein convert karo ===
        const tilemapManager = new TilemapManager();
        const tileSize = DUNGEON_CONFIG.tileSize;
        this.tilemap = tilemapManager.createTilemap(this, grid, tileSize);

        // === Step 3: Wall layer reference lo for collisions ===
        const wallLayer = this.tilemap.getLayer('walls')?.tilemapLayer;
        if (!wallLayer) {
            throw new Error("Wall layer not found! Check TilemapManager.");
        }
        this.wallLayer = wallLayer;

        // === Step 4: Enemy group banao ===
        this.enemyGroup = this.physics.add.group();

        // === Step 5: Player spawn karo — start room ke center pe ===
        const startRoom = rooms.find(r => r.type === 'start') || rooms[0];
        const playerPos = tilemapManager.getWorldPosition(
            startRoom.getCenterX(), 
            startRoom.getCenterY(), 
            tileSize
        );
        
        this.player = new Player(this, playerPos.x, playerPos.y);
        this.player.setDepth(10);

        // === Step 6: Player ko enemy group reference do ===
        this.player.setEnemyGroup(this.enemyGroup);

        // === Step 7: SpawnManager se enemies spawn karo ===
        this.spawnManager = new SpawnManager(this, this.enemyGroup, this.player);
        rooms.forEach(room => {
            if (room.type !== 'start') {
                this.spawnManager.spawnEnemiesForRoom(room);
            }
        });

        // === Step 8: Physics Colliders Setup ===
        // Player ↔ Walls
        this.physics.add.collider(this.player, this.wallLayer);
        // Enemies ↔ Walls
        this.physics.add.collider(this.enemyGroup, this.wallLayer);
        // Player ↔ Enemies (contact damage)
        this.physics.add.overlap(
            this.player, 
            this.enemyGroup, 
            this.handlePlayerEnemyOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, 
            undefined, 
            this
        );

        // === Step 9: Camera Setup ===
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
        this.physics.world.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);

        // === Step 10: UIScene launch karo (parallel overlay) ===
        if (!this.scene.isActive(SceneKeys.UI)) {
            this.scene.launch(SceneKeys.UI);
        }

        // === Step 11: EventBus listeners ===
        EventBus.on(EventKeys.PLAYER_DIED, this.handleGameOver, this);
        
        // Cleanup on shutdown
        this.events.once('shutdown', this.shutdown, this);
        
        // Initial gold broadcast
        EventBus.emit(EventKeys.GOLD_CHANGED, this.gold);
        // Initial health broadcast
        EventBus.emit(EventKeys.PLAYER_HEALTH_CHANGED, this.player.health.getCurrentHp(), this.player.health.getMaxHp());
    }

    update(_time: number, _delta: number) {
        // Player & Enemy updates are handled via their preUpdate methods
        // Phaser automatically calls preUpdate on sprites in the display list
    }

    /**
     * Player aur Enemy ka overlap — contact damage
     */
    private handlePlayerEnemyOverlap(
        playerObj: Phaser.GameObjects.GameObject, 
        enemyObj: Phaser.GameObjects.GameObject
    ) {
        const player = playerObj as Player;
        const enemy = enemyObj as any;
        
        if (!player.active || !enemy.active) return;
        
        const bodyP = player.body as Phaser.Physics.Arcade.Body;
        const bodyE = enemy.body as Phaser.Physics.Arcade.Body;
        if (!bodyP || !bodyE) return;

        // Knockback direction: enemy → player
        const dirX = bodyP.center.x - bodyE.center.x;
        const dirY = bodyP.center.y - bodyE.center.y;
        const length = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        
        player.onDamaged(1, { x: dirX / length, y: dirY / length });
    }

    private handleGameOver() {
        this.scene.stop(SceneKeys.UI);
        this.scene.stop(SceneKeys.GAME);
        this.scene.start(SceneKeys.GAME_OVER, { gold: this.gold });
    }

    shutdown() {
        EventBus.off(EventKeys.PLAYER_DIED, this.handleGameOver, this);
    }
}
