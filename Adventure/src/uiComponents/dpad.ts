import type { GameObj, KAPLAYCtx } from "kaplay";
import type { Facing } from "../entities/oldman";

export type DPadDirection = Facing | null;

export default class DPad {
  k: KAPLAYCtx;
  container: GameObj | null = null;
  currentDirection: DPadDirection = null;
  buttons: Record<Facing, GameObj> = {} as Record<Facing, GameObj>;

  // Button visual settings
  private readonly BUTTON_SIZE = 40;
  private readonly BUTTON_GAP = 5;
  private readonly PADDING = 20;
  private readonly OPACITY_NORMAL = 0.5;
  private readonly OPACITY_PRESSED = 0.9;

  constructor(k: KAPLAYCtx) {
    this.k = k;
  }

  init() {
    const k = this.k;

    // Create container at bottom-left of screen
    const containerX = this.PADDING;
    const containerY =
      k.height() - this.PADDING - (this.BUTTON_SIZE * 3 + this.BUTTON_GAP * 2);

    this.container = k.add([
      k.pos(containerX, containerY),
      k.fixed(),
      k.z(100),
      "dpad-container",
    ]);

    // Create directional buttons in cross pattern
    // Layout:
    //     [UP]
    // [LEFT] [RIGHT]
    //    [DOWN]

    const centerX = this.BUTTON_SIZE + this.BUTTON_GAP;
    const centerY = this.BUTTON_SIZE + this.BUTTON_GAP;

    this.createButton("up", centerX, 0, "▲");
    this.createButton("left", 0, centerY, "◀");
    this.createButton(
      "right",
      centerX + this.BUTTON_SIZE + this.BUTTON_GAP,
      centerY,
      "▶",
    );
    this.createButton(
      "down",
      centerX,
      centerY + this.BUTTON_SIZE + this.BUTTON_GAP,
      "▼",
    );

    // Setup touch event handlers
    this.setupTouchHandlers();
  }

  private createButton(
    direction: Facing,
    x: number,
    y: number,
    symbol: string,
  ) {
    const k = this.k;
    if (!this.container) return;

    const button = this.container.add([
      k.rect(this.BUTTON_SIZE, this.BUTTON_SIZE, { radius: 8 }),
      k.pos(x, y),
      k.color(k.Color.fromHex("#ffffff")),
      k.opacity(this.OPACITY_NORMAL),
      k.area(),
      k.anchor("topleft"),
      k.fixed(),
      `dpad-${direction}`,
    ]);

    // Add direction symbol
    button.add([
      k.text(symbol, { size: 20 }),
      k.color(k.Color.fromHex("#000000")),
      k.anchor("center"),
      k.pos(this.BUTTON_SIZE / 2, this.BUTTON_SIZE / 2),
      k.fixed(),
    ]);

    this.buttons[direction] = button;
  }

  private setupTouchHandlers() {
    const k = this.k;

    // Handle touch start
    k.onTouchStart((pos) => {
      this.handleTouchAt(pos, true);
    });

    // Handle touch move (for sliding finger between buttons)
    k.onTouchMove((pos) => {
      this.handleTouchAt(pos, true);
    });

    // Handle touch end
    k.onTouchEnd(() => {
      this.releaseAllButtons();
    });
  }

  private handleTouchAt(
    touchPos: { x: number; y: number },
    isPressed: boolean,
  ) {
    let foundDirection: DPadDirection = null;

    // Check each button for touch hit
    for (const dir of ["up", "down", "left", "right"] as Facing[]) {
      const button = this.buttons[dir];
      if (!button) continue;

      const buttonWorldPos = button.screenPos();
      const isHit =
        touchPos.x >= buttonWorldPos.x &&
        touchPos.x <= buttonWorldPos.x + this.BUTTON_SIZE &&
        touchPos.y >= buttonWorldPos.y &&
        touchPos.y <= buttonWorldPos.y + this.BUTTON_SIZE;

      if (isHit && isPressed) {
        foundDirection = dir;
        button.opacity = this.OPACITY_PRESSED;
      } else {
        button.opacity = this.OPACITY_NORMAL;
      }
    }

    this.currentDirection = foundDirection;
  }

  private releaseAllButtons() {
    for (const dir of ["up", "down", "left", "right"] as Facing[]) {
      const button = this.buttons[dir];
      if (button) {
        button.opacity = this.OPACITY_NORMAL;
      }
    }
    this.currentDirection = null;
  }

  getCurrentDirection(): DPadDirection {
    return this.currentDirection;
  }

  destroy() {
    if (this.container) {
      this.k.destroy(this.container);
      this.container = null;
    }
  }
}
