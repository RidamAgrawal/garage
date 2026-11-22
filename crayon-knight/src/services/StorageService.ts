const KEY = "crayon_knight_save_v1";

export interface PersistedData {
  highScore: number;
  musicVolume: number; // 0..1
  sfxVolume: number; // 0..1
  muted: boolean;
}

const DEFAULTS: PersistedData = {
  highScore: 0,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  muted: false,
};

export class StorageService {
  public load(): PersistedData {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }

  public save(partial: Partial<PersistedData>): PersistedData {
    const current = this.load();
    const next = { ...current, ...partial };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // storage blocked — silent fail
    }
    return next;
  }

  /** Returns true if a new high score was set. */
  public updateHighScore(score: number): boolean {
    const current = this.load();
    if (score > current.highScore) {
      this.save({ highScore: score });
      return true;
    }
    return false;
  }
}

export const storageService = new StorageService();

