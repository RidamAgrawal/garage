import type { KAPLAYCtx } from "kaplay";

export class GlobalState {
  private _freezePlayer: boolean = false;
  private _talkedToOldman: boolean = false;
  private _isSwordUnlocked: boolean = true;
  private _isShieldUnlocked: boolean = true;
  private _previousSceneName: string = "";
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
