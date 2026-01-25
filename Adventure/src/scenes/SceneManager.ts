import type BaseScene from "./BaseScene";
import type { SpawnHandler } from "./MapScene";

export default class SceneManager {
  current?: BaseScene;
  async changeScene(newScene: BaseScene,spawnHandlers: Record<string, SpawnHandler>) {
    if (this.current?.destroy) this.current.destroy();
    this.current = newScene;
    await this.current.init(spawnHandlers);
  }
}