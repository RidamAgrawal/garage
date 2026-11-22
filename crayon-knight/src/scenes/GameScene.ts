import Phaser from "phaser";
import { SceneKeys } from "@/constants/SceneKeys";
import { EventKeys } from "@/constants/EventKeys";
import { EventBus } from "@/events/EventBus";
import { TilemapManager, IslandGenerator } from "@/dungeon";
import { SpawnManager } from "@/systems/SpawnManager";
import { Player } from "@/entities/player/Player";
import { AssetKeys } from "@/constants/AssetKeys";
import { runState } from "@/state/RunState";
import { AudioSystem } from "@/systems/AudioSystem";
import { IslandBuildResult } from "@/types/game.types";

/**
 * GameScene — THE HEART OF THE GAME 💖
 *
 * Single Responsibility: GameScene sirf orchestration karta hai.
 * Actual logic Entity classes, Components, aur Systems mein hai.
 */
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private tilemapManager?: TilemapManager;
  private spawnManager!: SpawnManager;
  private boundaries!: Phaser.Physics.Arcade.StaticGroup;
  private mapType: "procedural" | "tiled" = "procedural";
  private audioSystem = new AudioSystem();
  private islandResult!: IslandBuildResult;

  constructor() {
    super({ key: SceneKeys.GAME });
  }

  init(data?: { mapType?: "procedural" | "tiled" }) {
    if (data?.mapType) {
      this.mapType = data.mapType;
    }
  }

  create() {
    this.audioSystem.init(this);

    // ============================================================
    // Step 1: Map Setup (Procedural Island by default, or Tiled JSON)
    // ============================================================
    let map: Phaser.Tilemaps.Tilemap;
    let spawnPoints: {
      player: { x: number; y: number } | null;
      enemies: { x: number; y: number; type: string }[];
    };

    if (this.mapType === "tiled") {
      this.tilemapManager = new TilemapManager();
      map = this.tilemapManager.createTilemap(this);
      this.boundaries = this.tilemapManager.createCliffColliders(this);
      spawnPoints = this.tilemapManager.getSpawnPoints();
    } else {
      const islandGen = new IslandGenerator();
      this.islandResult = islandGen.generate(this);
      map = this.islandResult.map;
      this.boundaries = this.islandResult.boundaries;
      spawnPoints = this.islandResult.spawnPoints;
    }

    // Physics world bounds = map size
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // ============================================================
    // Step 3: Enemy group banao
    // ============================================================
    this.enemyGroup = this.physics.add.group();

    // ============================================================
    // Step 4: Spawn points
    // Player spawn position: spawnPoints se ya map center
    // ============================================================
    const playerSpawn = spawnPoints.player ?? {
      x: map.widthInPixels / 2,
      y: map.heightInPixels / 2,
    };

    // ============================================================
    // Step 5: Player spawn karo
    // ============================================================
    this.player = new Player(this, playerSpawn.x, playerSpawn.y);
    this.player.attachElevation(this.islandResult.terrainAt);
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
    // Player ↔ Map collision (elevation-aware cliff & water boundaries)
    this.physics.add.collider(
      this.player,
      this.boundaries,
      undefined,
      (player, wall) => {
        const isCliff =
          (wall as Phaser.GameObjects.Zone).getData("cliff") === true;
        return !(isCliff && (player as Player).elevation?.canClearCliff()); // true = collide
      },
      this,
    );

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
    // Step 7b: Shield Pickup
    // ============================================================
    this.spawnShieldPickup(spawnPoints);

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
    EventBus.emit(EventKeys.GOLD_CHANGED, runState.gold);
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

    // Weapon-wielding enemies (like skeleton) attack via animation, not passive body contact
    if (enemy.getAttackRange && enemy.getAttackRange() > 0) return;

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
    runState.addGold(data.gold ?? 0);
  }

  private handleGameOver() {
    this.scene.stop(SceneKeys.UI);
    this.scene.stop(SceneKeys.GAME);
    this.scene.start(SceneKeys.GAME_OVER);
  }

  shutdown() {
    EventBus.off(EventKeys.PLAYER_DIED, this.handleGameOver, this);
    EventBus.off(EventKeys.ENEMY_DIED, this.handleEnemyDied, this);
    this.audioSystem.destroy();
  }

  /** Spawn a floating shield pickup between player and enemies */
  private spawnShieldPickup(spawnPoints: {
    player: { x: number; y: number } | null;
    enemies: { x: number; y: number; type: string }[];
  }) {
    const p = spawnPoints.player;
    if (!p) return;

    // Place shield halfway between player spawn and first enemy (or offset from player)
    const e = spawnPoints.enemies[0];
    const sx = e ? (p.x + e.x) / 2 : p.x + 128;
    const sy = e ? (p.y + e.y) / 2 : p.y - 64;

    const shield = this.add.sprite(sx, sy, `${AssetKeys.SHIELD_PICKUP}-1`);
    shield.play(AssetKeys.SHIELD_PICKUP);
    shield.setDepth(15);
    // Floating bob
    this.tweens.add({
      targets: shield,
      y: sy - 8,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.physics.add.existing(shield, true);

    this.physics.add.overlap(this.player, shield, () => {
      shield.destroy();
      this.player.pickupShield();
    });
  }
}
