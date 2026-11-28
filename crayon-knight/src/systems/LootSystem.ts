import Phaser from "phaser";
import { AssetKeys } from "@/constants/AssetKeys";
import { EventKeys } from "@/constants/EventKeys";
import { EventBus } from "@/events/EventBus";
import { ENEMY_CONFIGS, LOOT_CONFIG } from "@/config/BalanceConfig";
import type { EnemyDiedPayload } from "@/types/combat.types";
import type { Player } from "@/entities/player/Player";
import { runState } from "@/state/RunState";

export class LootSystem {
  private scene?: Phaser.Scene;
  private player?: Player;
  private group?: Phaser.Physics.Arcade.Group;
  private overlap?: Phaser.Physics.Arcade.Collider;
  private expirations = new Map<
    Phaser.Physics.Arcade.Sprite,
    Phaser.Time.TimerEvent
  >();

  private onEnemyDied = (data: EnemyDiedPayload): void => {
    if (!this.scene || !this.player) return;

    const config = ENEMY_CONFIGS[data.type];
    const gold = Phaser.Math.Between(config.goldDrop.min, config.goldDrop.max);
    if (gold > 0 && !this.spawn(AssetKeys.GOLD_COIN, data.x, data.y, gold)) {
      runState.addGold(gold);
    }

    if (
      this.player.health.getCurrentHp() < this.player.health.getMaxHp() &&
      Math.random() < LOOT_CONFIG.HEART_CHANCE
    ) {
      this.spawn(AssetKeys.HEART_PICKUP, data.x, data.y, 0);
    }
  };

  init(scene: Phaser.Scene, player: Player): void {
    this.scene = scene;
    this.player = player;
    this.createPickupTextures(scene);
    this.group = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: LOOT_CONFIG.MAX_PICKUPS,
      allowGravity: false,
      immovable: true,
    });
    this.overlap = scene.physics.add.overlap(
      player,
      this.group,
      this.collect,
      undefined,
      this,
    );
    EventBus.on(EventKeys.ENEMY_DIED, this.onEnemyDied);
  }

  destroy(): void {
    EventBus.off(EventKeys.ENEMY_DIED, this.onEnemyDied);
    this.overlap?.destroy();
    for (const timer of this.expirations.values()) timer.remove(false);
    this.expirations.clear();
    this.group?.destroy(true);
    this.scene = undefined;
    this.player = undefined;
  }

  private spawn(key: string, x: number, y: number, amount: number): boolean {
    if (!this.scene || !this.group) return false;

    const spawnX =
      x + Phaser.Math.Between(-LOOT_CONFIG.SCATTER_PX, LOOT_CONFIG.SCATTER_PX);
    const spawnY =
      y + Phaser.Math.Between(-LOOT_CONFIG.SCATTER_PX, LOOT_CONFIG.SCATTER_PX);
    const pickup = this.group.get(spawnX, spawnY, key) as
      | Phaser.Physics.Arcade.Sprite
      | null;
    if (!pickup) return false;

    pickup.setTexture(key).setPosition(spawnX, spawnY);
    pickup.setDepth(spawnY);
    pickup.setActive(true).setVisible(true);
    pickup.setData("amount", amount);
    pickup.setData("heart", key === AssetKeys.HEART_PICKUP);

    const body = pickup.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(spawnX, spawnY);
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setCircle(key === AssetKeys.GOLD_COIN ? 8 : 9);

    this.scene.tweens.add({
      targets: pickup,
      y: spawnY - LOOT_CONFIG.POP_PX,
      duration: 180,
      yoyo: true,
      ease: "Sine.easeOut",
    });
    this.expirations.set(
      pickup,
      this.scene.time.delayedCall(LOOT_CONFIG.DESPAWN_MS, () =>
        this.release(pickup),
      ),
    );
    return true;
  }

  private collect: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    object,
  ): void => {
    const pickup = object as Phaser.Physics.Arcade.Sprite;
    if (!pickup.active || !this.player) return;

    if (pickup.getData("heart")) {
      this.player.health.heal(LOOT_CONFIG.HEART_HEAL);
    } else {
      runState.addGold(pickup.getData("amount") as number);
    }
    EventBus.emit(EventKeys.SFX_PLAY, AssetKeys.SFX_PICKUP);
    this.release(pickup);
  };

  private release(pickup: Phaser.Physics.Arcade.Sprite): void {
    this.expirations.get(pickup)?.remove(false);
    this.expirations.delete(pickup);
    this.scene?.tweens.killTweensOf(pickup);
    const body = pickup.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    body.stop();
    pickup.setActive(false).setVisible(false);
  }

  private createPickupTextures(scene: Phaser.Scene): void {
    if (!scene.textures.exists(AssetKeys.GOLD_COIN)) {
      const coin = scene.make.graphics({ x: 0, y: 0 }, false);
      coin.fillStyle(0xffd34d, 1);
      coin.fillCircle(8, 8, 7);
      coin.lineStyle(2, 0xb87518, 1);
      coin.strokeCircle(8, 8, 6);
      coin.generateTexture(AssetKeys.GOLD_COIN, 16, 16);
      coin.destroy();
    }

    if (!scene.textures.exists(AssetKeys.HEART_PICKUP)) {
      const heart = scene.make.graphics({ x: 0, y: 0 }, false);
      heart.fillStyle(0xf04b61, 1);
      heart.fillCircle(5, 5, 4);
      heart.fillCircle(11, 5, 4);
      heart.fillTriangle(1, 7, 15, 7, 8, 15);
      heart.generateTexture(AssetKeys.HEART_PICKUP, 16, 16);
      heart.destroy();
    }
  }
}
