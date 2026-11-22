import Phaser from "phaser";
import { EventBus } from "@/events/EventBus";
import { EventKeys } from "@/constants/EventKeys";
import { AssetKeys } from "@/constants/AssetKeys";
import { storageService } from "@/services/StorageService";

export class AudioSystem {
  private scene!: Phaser.Scene;
  private sfxVolume = 0.7;
  private musicVolume = 0.5;
  private muted = false;

  init(scene: Phaser.Scene): void {
    this.scene = scene;
    const settings = storageService.load();
    this.sfxVolume = settings.sfxVolume;
    this.musicVolume = settings.musicVolume;
    this.muted = settings.muted;

    EventBus.on(EventKeys.ENEMY_DIED, this.onEnemyDied, this);
    EventBus.on(EventKeys.PLAYER_HEALTH_CHANGED, this.onHealthChanged, this);
    EventBus.on(EventKeys.SHIELD_PICKED_UP, this.onShieldPickup, this);
    EventBus.on(EventKeys.SFX_PLAY, this.onSfxPlay, this);
  }

  destroy(): void {
    EventBus.off(EventKeys.ENEMY_DIED, this.onEnemyDied, this);
    EventBus.off(EventKeys.PLAYER_HEALTH_CHANGED, this.onHealthChanged, this);
    EventBus.off(EventKeys.SHIELD_PICKED_UP, this.onShieldPickup, this);
    EventBus.off(EventKeys.SFX_PLAY, this.onSfxPlay, this);
  }

  private playSfx(key: string): void {
    if (this.muted) return;
    if (!this.scene.cache.audio.exists(key)) return;
    this.scene.sound.play(key, { volume: this.sfxVolume });
  }

  private playBgm(key: string): void {
    if (this.muted) return;
    if (!this.scene.cache.audio.exists(key)) return;
    this.scene.sound.play(key, { volume: this.musicVolume, loop: true });
  }

  // Keep playBgm accessible for future use without triggering noUnusedLocals.
  startBgm(key: string = AssetKeys.BGM_DUNGEON): void {
    this.playBgm(key);
  }

  private onEnemyDied = (): void => {
    this.playSfx(AssetKeys.SFX_DEATH);
  };

  private onHealthChanged = (_cur: number, _max: number): void => {
    this.playSfx(AssetKeys.SFX_HIT);
  };

  private onShieldPickup = (): void => {
    this.playSfx(AssetKeys.SFX_PICKUP);
  };

  private onSfxPlay = (key: string): void => {
    this.playSfx(key);
  };
}
