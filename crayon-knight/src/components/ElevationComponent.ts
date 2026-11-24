import Phaser from "phaser";
import { IComponent } from "@/components/IComponent";
import { Entity } from "@/entities/Entity";
import { ELEVATION_CONFIG, CLIFF_CLEAR_TOTAL } from "@/config/BalanceConfig";
import { TerrainType } from "@/types/game.types";

export type TerrainQuery = (worldX: number, worldY: number) => TerrainType;

export class ElevationComponent implements IComponent {
  z = 0;
  vz = 0;
  groundLevel: number = TerrainType.FLAT;
  isGrounded = true;
  lastSafePos = { x: 0, y: 0 };

  private entity!: Entity;
  private baseDispY = 0;
  private baseOffY = 0;
  private shadow!: Phaser.GameObjects.Ellipse;

  constructor(
    private terrainAt: TerrainQuery,
    private onWater: () => void,
  ) {}

  private get body() {
    return this.entity.body as Phaser.Physics.Arcade.Body;
  }

  init(entity: any): void {
    this.entity = entity as Entity;
    this.baseDispY = this.entity.displayOriginY;
    this.baseOffY = this.body.offset.y; // valid only because Player attaches this after its body setup
    this.lastSafePos = { x: this.entity.x, y: this.entity.y };
    this.shadow = this.entity.scene.add.ellipse(0, 0, 28, 12, 0x000000, 0.35);
  }

  jump(velocity: number = ELEVATION_CONFIG.JUMP_VELOCITY): boolean {
    if (!this.isGrounded) return false;
    this.vz = velocity;
    this.isGrounded = false;
    return true;
  }

  getTotalHeight(): number {
    return this.groundLevel * ELEVATION_CONFIG.CLIFF_HEIGHT + this.z;
  }

  /** Cliff-rect callback: grounded is always blocked; airborne passes once high enough. */
  canClearCliff(): boolean {
    return !this.isGrounded && this.getTotalHeight() >= CLIFF_CLEAR_TOTAL;
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 50) / 1000; // clamp so a tab-switch spike cannot launch the player
    const b = this.body;
    if (!b) return;

    const terrain = this.terrainAt(b.center.x, b.center.y);
    const targetGroundHeight =
      terrain === TerrainType.WATER
        ? 0
        : terrain * ELEVATION_CONFIG.CLIFF_HEIGHT;

    if (!this.isGrounded) {
      this.vz -= ELEVATION_CONFIG.GRAVITY_Z * dt;
      this.z += this.vz * dt;

      const currentTotalHeight =
        this.groundLevel * ELEVATION_CONFIG.CLIFF_HEIGHT + this.z;

      // When falling and reaching or crossing target ground surface height, land!
      if (this.vz <= 0 && currentTotalHeight <= targetGroundHeight) {
        this.groundLevel = terrain;
        this.z = 0;
        this.vz = 0;
        this.isGrounded = true;

        if (terrain === TerrainType.WATER) {
          this.onWater();
        } else {
          this.lastSafePos.x = this.entity.x;
          this.lastSafePos.y = this.entity.y;
        }
      } else if (this.z <= 0 && terrain === TerrainType.WATER) {
        // Fall into water
        this.groundLevel = terrain;
        this.z = 0;
        this.vz = 0;
        this.isGrounded = true;
        this.onWater();
      }
    } else {
      // Grounded state
      const currentHeight = this.groundLevel * ELEVATION_CONFIG.CLIFF_HEIGHT;
      if (currentHeight > targetGroundHeight) {
        // Stepped off cliff or into water
        this.isGrounded = false;
        this.vz = 0;
        this.z = currentHeight - targetGroundHeight;
        this.groundLevel = terrain;
      } else {
        if (terrain === TerrainType.WATER) {
          this.onWater();
        } else {
          this.groundLevel = terrain;
          this.lastSafePos.x = this.entity.x;
          this.lastSafePos.y = this.entity.y;
        }
      }
    }

    this.applyVisual();
  }

  respawn(): void {
    this.z = 0;
    this.vz = 0;
    this.isGrounded = true;
    const safeTerrain = this.terrainAt(this.lastSafePos.x, this.lastSafePos.y);
    this.groundLevel =
      safeTerrain === TerrainType.WATER ? TerrainType.FLAT : safeTerrain;
    this.body.reset(this.lastSafePos.x, this.lastSafePos.y);
    this.applyVisual();
  }

  private applyVisual(): void {
    const e = this.entity;
    const b = this.body;
    if (!b) return;

    const raise = this.z / e.scaleY; // source px
    // Arcade: body.y = sprite.y + scaleY * (offset.y - displayOriginY). Raising both by the same amount
    // lifts the drawn sprite while the body stays on the ground.
    e.setDisplayOrigin(e.displayOriginX, this.baseDispY + raise);
    b.setOffset(b.offset.x, this.baseOffY + raise);

    this.shadow
      .setPosition(b.center.x, b.bottom)
      .setScale(Math.max(0.4, 1 - this.z / 120))
      .setAlpha(0.35 * e.alpha)
      .setDepth(b.bottom - 1);
  }

  destroy(): void {
    this.shadow?.destroy();
  }
}
