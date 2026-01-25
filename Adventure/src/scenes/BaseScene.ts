import type { KAPLAYCtx } from "kaplay";
import type { SpawnHandler } from "./MapScene";

export default abstract class BaseScene {
  protected k: KAPLAYCtx;
  constructor(k: KAPLAYCtx) { this.k = k; }
  abstract init(spawnHandlers: Record<string,SpawnHandler>): Promise<void>;
  destroy(): void {} // override to clean up timers, objects, listeners
}