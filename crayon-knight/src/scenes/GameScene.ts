import Phaser from "phaser";
import { SceneKeys } from "@/constants/SceneKeys";
import { EventKeys } from "@/constants/EventKeys";
import { EventBus } from "@/events/EventBus";
import { TilemapManager } from "@/dungeon/TilemapManager";
import { SpawnManager } from "@/systems/SpawnManager";
import { Player } from "@/entities/player/Player";

/**
 * GameScene — THE HEART OF THE GAME 💖
 *
 * Hindi: Yeh sabse important scene hai. Yahan sab kuch combine hota hai:
 * - Tiled JSON map load aur render
 * - Player aur Enemy spawning (Tiled Objects layer se)
 * - Physics colliders setup
 * - Camera setup
 * - EventBus se UI updates
 *
 * Single Responsibility: GameScene sirf orchestration karta hai.
 * Actual logic Entity classes, Components, aur Systems mein hai.
 */
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private tilemapManager!: TilemapManager;
  private spawnManager!: SpawnManager;
  private boundaries!: Phaser.Physics.Arcade.StaticGroup;
  private gold: number = 0;

  constructor() {
    super({ key: SceneKeys.GAME });
  }

  create() {
    this.gold = 0;

    // ============================================================
    // Step 1: Tiled Map Load aur Render Karo
    // ============================================================
    this.tilemapManager = new TilemapManager();
    const map = this.tilemapManager.createTilemap(this);

    // ============================================================
    // Step 2: Collision Layer Setup
    // createCliffColliders() "cliff boundaries" objectgroup se
    // rectangles/lines ko static physics bodies bana deta hai.
    // ============================================================
    this.boundaries = this.tilemapManager.createCliffColliders(this);
    // Physics world bounds = map size
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // ============================================================
    // Step 3: Enemy group banao
    // ============================================================
    this.enemyGroup = this.physics.add.group();

    // ============================================================
    // Step 4: Spawn points nikalo (Tiled Objects layer se)
    // Agar Objects layer nahi hai toh map ke center pe spawn karo
    // ============================================================
    const spawnPoints = this.tilemapManager.getSpawnPoints();

    // Player spawn position — Objects layer mein "player" object dhundho
    // Fallback: map center
    const playerSpawn = spawnPoints.player ?? {
      x: map.widthInPixels / 2,
      y: map.heightInPixels / 2,
    };

    // ============================================================
    // Step 5: Player spawn karo
    // ============================================================
    this.player = new Player(this, playerSpawn.x, playerSpawn.y);
    this.player.setDepth(20); // Characters map ke upar dikhein

    // ============================================================
    // Step 6: Enemies spawn karo
    // ============================================================
    this.player.setEnemyGroup(this.enemyGroup);
    this.spawnManager = new SpawnManager(this, this.enemyGroup, this.player);

    if (spawnPoints.enemies.length > 0) {
      // Tiled Objects layer se enemy positions use karo
      spawnPoints.enemies.forEach((ep) => {
        this.spawnManager.spawnEnemyAt(ep.x, ep.y, ep.type);
      });
    } else {
      // Fallback: map ke corners mein kuch enemies place karo
      this.spawnManager.spawnFallbackEnemies(
        map.widthInPixels,
        map.heightInPixels,
      );
    }

    // ============================================================
    // Step 7: Physics Colliders Setup
    // ============================================================
    // Player ↔ Map collision (cliff boundaries)
    this.physics.add.collider(this.player, this.boundaries);
    // Enemies ↔ Map collision (cliff boundaries)
    this.physics.add.collider(this.enemyGroup, this.boundaries);

    // Player ↔ Enemies (contact se damage)
    this.physics.add.overlap(
      this.player,
      this.enemyGroup,
      this
        .handlePlayerEnemyOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    // ============================================================
    // Step 8: Camera Setup — Player ko follow karo
    // ============================================================
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // Slight zoom out taaki player ko surrounding context mile
    this.cameras.main.setZoom(1.5);

    // ============================================================
    // Step 9: UIScene parallel overlay launch karo
    // ============================================================
    if (!this.scene.isActive(SceneKeys.UI)) {
      this.scene.launch(SceneKeys.UI);
    }

    // ============================================================
    // Step 10: EventBus listeners
    // ============================================================
    EventBus.on(EventKeys.PLAYER_DIED, this.handleGameOver, this);
    EventBus.on(EventKeys.ENEMY_DIED, this.handleEnemyDied, this);
    this.events.once("shutdown", this.shutdown, this);

    // Initial broadcasts
    EventBus.emit(EventKeys.GOLD_CHANGED, this.gold);
    EventBus.emit(
      EventKeys.PLAYER_HEALTH_CHANGED,
      this.player.health.getCurrentHp(),
      this.player.health.getMaxHp(),
    );
  }

  update(_time: number, _delta: number) {
    // Player & Enemy updates: Entity.preUpdate() se automatically hote hain
    // Phaser automatically preUpdate() call karta hai all active GameObjects pe
  }

  // ─────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────

  /** Player aur Enemy ka overlap — contact damage */
  private handlePlayerEnemyOverlap(
    playerObj: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject,
  ) {
    const player = playerObj as Player;
    const enemy = enemyObj as any;

    if (!player.active || !enemy.active) return;

    const bodyP = player.body as Phaser.Physics.Arcade.Body;
    const bodyE = enemy.body as Phaser.Physics.Arcade.Body;
    if (!bodyP || !bodyE) return;

    // Knockback direction: enemy se player ki taraf
    const dirX = bodyP.center.x - bodyE.center.x;
    const dirY = bodyP.center.y - bodyE.center.y;
    const length = Math.sqrt(dirX * dirX + dirY * dirY) || 1;

    player.onDamaged(1, { x: dirX / length, y: dirY / length });
  }

  /** Dushman mara → gold collect karo */
  private handleEnemyDied(data: { gold: number }) {
    this.gold += data.gold ?? 0;
    EventBus.emit(EventKeys.GOLD_CHANGED, this.gold);
  }

  private handleGameOver() {
    this.scene.stop(SceneKeys.UI);
    this.scene.stop(SceneKeys.GAME);
    this.scene.start(SceneKeys.GAME_OVER, { gold: this.gold });
  }

  shutdown() {
    EventBus.off(EventKeys.PLAYER_DIED, this.handleGameOver, this);
    EventBus.off(EventKeys.ENEMY_DIED, this.handleEnemyDied, this);
  }
}
