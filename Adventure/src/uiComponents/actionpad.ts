import type { GameObj, KAPLAYCtx } from "kaplay";

export type ActionType = "attack" | "shield";

export default class ActionPad {
  k: KAPLAYCtx;
  container: GameObj | null = null;
  buttons: Record<ActionType, GameObj> = {} as Record<ActionType, GameObj>;

  // Callbacks for actions
  onAttackStart: (() => void) | null = null;
  onAttackEnd: (() => void) | null = null;
  onShieldStart: (() => void) | null = null;
  onShieldEnd: (() => void) | null = null;

  // Track pressed state
  private attackPressed = false;
  private shieldPressed = false;

  // Button visual settings
  private readonly BUTTON_SIZE = 100;
  private readonly BUTTON_GAP = 30;
  private readonly PADDING = 40;
  private readonly OPACITY_NORMAL = 0.5;
  private readonly OPACITY_PRESSED = 0.9;

  constructor(k: KAPLAYCtx) {
    this.k = k;
  }

  init() {
    const k = this.k;

    // Create container at bottom-right of screen
    // Layout: [SHIELD] [ATTACK] (attack is larger, shield is smaller)
    const totalWidth = this.BUTTON_SIZE * 2 + this.BUTTON_GAP;
    const containerX = k.width() - this.PADDING - totalWidth;
    const containerY = k.height() - this.PADDING - this.BUTTON_SIZE - 30;

    this.container = k.add([
      k.pos(containerX, containerY),
      k.fixed(),
      k.z(100),
      "actionpad-container",
    ]);

    // Create action buttons
    // Shield on left, Attack on right
    this.createButton("shield", 0, 10, "🛡️", this.BUTTON_SIZE - 10);
    this.createButton(
      "attack",
      this.BUTTON_SIZE + this.BUTTON_GAP - 5,
      0,
      "⚔️",
      this.BUTTON_SIZE,
    );

    // Setup touch event handlers
    this.setupTouchHandlers();
  }

  private createButton(
    action: ActionType,
    x: number,
    y: number,
    symbol: string,
    size: number,
  ) {
    const k = this.k;
    if (!this.container) return;

    const button = this.container.add([
      k.circle(size / 2),
      k.pos(x + size / 2, y + size / 2),
      k.color(
        action === "attack"
          ? k.Color.fromHex("#ff6b6b")
          : k.Color.fromHex("#4dabf7"),
      ),
      k.opacity(this.OPACITY_NORMAL),
      k.area({ shape: new k.Rect(k.vec2(-size / 2, -size / 2), size, size) }),
      k.anchor("center"),
      k.fixed(),
      `actionpad-${action}`,
      { buttonSize: size },
    ]);

    // Add action symbol
    button.add([
      k.text(symbol, { size: size * 0.4 }),
      k.anchor("center"),
      k.pos(0, 0),
      k.fixed(),
    ]);

    this.buttons[action] = button;
  }

  private setupTouchHandlers() {
    const k = this.k;

    // Handle touch start
    k.onTouchStart((pos) => {
      this.handleTouchAt(pos, true);
    });

    // Handle touch move
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
    // Check each button for touch hit
    for (const action of ["attack", "shield"] as ActionType[]) {
      const button = this.buttons[action];
      if (!button) continue;

      const buttonWorldPos = button.screenPos();
      const size = button.buttonSize || this.BUTTON_SIZE;
      const radius = size / 2;

      // Check if touch is within circular button area
      const dx = touchPos.x - buttonWorldPos.x;
      const dy = touchPos.y - buttonWorldPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const isHit = distance <= radius;

      if (isHit && isPressed) {
        button.opacity = this.OPACITY_PRESSED;

        if (action === "attack" && !this.attackPressed) {
          this.attackPressed = true;
          this.onAttackStart?.();
        } else if (action === "shield" && !this.shieldPressed) {
          this.shieldPressed = true;
          this.onShieldStart?.();
        }
      }
    }
  }

  private releaseAllButtons() {
    for (const action of ["attack", "shield"] as ActionType[]) {
      const button = this.buttons[action];
      if (button) {
        button.opacity = this.OPACITY_NORMAL;
      }
    }

    if (this.attackPressed) {
      this.attackPressed = false;
      this.onAttackEnd?.();
    }
    if (this.shieldPressed) {
      this.shieldPressed = false;
      this.onShieldEnd?.();
    }
  }

  destroy() {
    if (this.container) {
      this.k.destroy(this.container);
      this.container = null;
    }
  }
}
