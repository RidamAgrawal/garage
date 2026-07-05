import type { KAPLAYCtx } from "kaplay";
import { CHARACTER_COUNT } from "../constants";

const SELECTED_CHARACTER_KEY = "adventure:selectedCharacter";

function readStoredCharacter(): number | null {
  try {
    const raw = localStorage.getItem(SELECTED_CHARACTER_KEY);
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? null : Math.max(0, Math.min(n, CHARACTER_COUNT - 1));
  } catch {
    return null;
  }
}

export class GlobalState {
  // Maximum hearts. Grows when the player finds an extra-heart chest.
  private _maxHealth: number = 4;
  get maxHealth() {
    return this._maxHealth;
  }
  public addMaxHeart() {
    this._maxHealth += 1;
  }
  // Index (0..CHARACTER_COUNT-1) of the player sprite chosen on the select screen.
  private _selectedCharacter: number = readStoredCharacter() ?? 0;
  // Scene to return to after the character-select screen closes.
  private _characterSelectReturnScene: string = "village";
  get selectedCharacter() {
    return this._selectedCharacter;
  }
  set selectedCharacter(val: number) {
    this._selectedCharacter = Math.max(0, Math.min(val, CHARACTER_COUNT - 1));
    try {
      localStorage.setItem(
        SELECTED_CHARACTER_KEY,
        String(this._selectedCharacter),
      );
    } catch {
      // localStorage unavailable (private mode / SSR) — keep in-memory only.
    }
  }
  // True once the player has confirmed a character at least once (persisted).
  public hasChosenCharacter(): boolean {
    return readStoredCharacter() !== null;
  }
  get characterSelectReturnScene() {
    return this._characterSelectReturnScene;
  }
  set characterSelectReturnScene(val: string) {
    this._characterSelectReturnScene = val;
  }
  private _freezePlayer: boolean = false;
  private _talkedToOldman: boolean = false;
  private _isSwordUnlocked: boolean = false;
  private _isShieldUnlocked: boolean = false;
  private _previousSceneName: string = "";
  private _playerHealth: number = this.maxHealth;
  // Current player HP, persisted across scene transitions so hearts don't
  // reset to full every time the player enters a new scene.
  set playerHealth(val: number) {
    this._playerHealth = Math.max(0, Math.min(val, this.maxHealth));
  }
  get playerHealth() {
    return this._playerHealth;
  }
  public resetPlayerHealth() {
    this._playerHealth = this.maxHealth;
  }
  // Running total of coins the player has collected (persists across scenes).
  private _coins: number = 0;
  get coins() {
    return this._coins;
  }
  set coins(val: number) {
    this._coins = Math.max(0, val);
  }
  // Keys ("<scene>:<coinId>") of coins already picked up, so they never respawn.
  private _collectedCoins: Set<string> = new Set();
  public isCoinCollected(key: string): boolean {
    return this._collectedCoins.has(key);
  }
  public markCoinCollected(key: string): void {
    this._collectedCoins.add(key);
  }
  // Keys ("<scene>:<chestId>") of reward chests already opened, so their
  // one-time reward can't be farmed by leaving and re-entering the room.
  private _openedChests: Set<string> = new Set();
  public isChestOpened(key: string): boolean {
    return this._openedChests.has(key);
  }
  public markChestOpened(key: string): void {
    this._openedChests.add(key);
  }
  set freezePlayer(val: boolean) {
    this._freezePlayer = val;
  }
  get freezePlayer() {
    return this._freezePlayer;
  }
  set talkedToOldman(val: boolean) {
    this._talkedToOldman = val;
  }
  get talkedToOldman() {
    return this._talkedToOldman;
  }
  set isSwordUnlocked(val: boolean) {
    this._isSwordUnlocked = val;
  }
  get isSwordUnlocked() {
    return this._isSwordUnlocked;
  }
  set isShieldUnlocked(val: boolean) {
    this._isShieldUnlocked = val;
  }
  get isShieldUnlocked() {
    return this._isShieldUnlocked;
  }
  set previousSceneName(val: string) {
    this._previousSceneName = val;
  }
  get previousSceneName() {
    return this._previousSceneName;
  }
  public getplayerInsertPointName(k: KAPLAYCtx): string {
    const currentSceneName = k.getSceneName();
    const previousSceneName = this.previousSceneName;
    switch (currentSceneName) {
      case "village":
        switch (previousSceneName) {
          case "house1":
            return "player-house1";
          case "house2":
            return "player-house2";
          case "forest":
            return "player-forest";
          default:
            return "player";
        }
      case "forest":
        switch (previousSceneName) {
          case "village":
            return "player-village";
          case "world3":
            return "player-world3";
          default:
            return "player-village";
        }
      case "house1":
      case "house2":
        return "player";
      case "world3":
        switch (previousSceneName) {
          case "windmill":
            return "player-windmill1";
          case "roof":
            return "player-windmill2";
          case "world4":
            return "player-world4";
          default:
            return "player-forest";
        }
      case "windmill":
        switch (previousSceneName) {
          case "world3":
            return "player";
          case "roof":
            return "player-roof";
          default:
            return "player";
        }
      case "roof":
        switch (previousSceneName) {
          case "windmill":
            return "player";
          default:
            return "player";
        }
      case "world4":
        switch (previousSceneName) {
          case "fortRoom1":
            return "player-castle";
          default:
            return "player-world3";
        }
      case "fortRoom1":
        switch (previousSceneName) {
          case "world4":
            return "player-world4";
          default:
            return "player-world4";
        }
      case "fortRoom2":
        switch (previousSceneName) {
          case "fortRoom1":
            return "player-fortRoom1";
          case "fortRoom3":
            return "player-fortRoom3";
          default:
            return "player-fortRoom1";
        }
      case "fortRoom3":
        switch (previousSceneName) {
          default:
            return "player";
        }
      default:
        return "player";
    }
  }
}
