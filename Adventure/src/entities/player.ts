import type { GameObj, KAPLAYCtx, Key, Vec2 } from "kaplay";
import { health, isKeyAlreadyPressed, playAnimIfNotPlaying } from "../utils";
import { globalState } from "../state/stateManager";
import type { Facing } from "./oldman";
import HealthBar from "../uiComponents/healthBar";
import type DPad from "../uiComponents/dpad";
import type ActionPad from "../uiComponents/actionpad";

export class PlayerEntity {
  k: KAPLAYCtx;
  map: GameObj;
  player: GameObj;

  constructor(k: KAPLAYCtx, map: GameObj, pos: Vec2) {
    this.k = k;
    this.map = map;
    this.player = map.add([
      k.sprite("assets", { anim: "player-idle-down" }),
      k.area({ shape: new k.Rect(k.vec2(3, 4), 10, 12) }),
      k.body(),
      k.pos(pos),
      k.opacity(),
      k.z(2),
      {
        speed: 100,
        attackPower: 1,
        direction: "down",
        isAttacking: false,
        isShielding: false,
        isInteracting: false,
      },
      health(4),
      "player",
    ]);
    const healthBar = new HealthBar(k, this.player);
    healthBar.init();
  }

  enableMovement() {
    const player = this.player;
    const k = this.k;
    k.onKeyDown((key: Key) => {
      if (player.isInteracting || globalState.freezePlayer) return;
      switch (key) {
        case "left":
        case "a":
          if (isKeyAlreadyPressed(k, ["up", "w", "down", "s"])) break;
          player.move(-player.speed, 0);
          player.direction = "left";
          playAnimIfNotPlaying(player, "player-walk-left");
          break;
        case "up":
        case "w":
          if (isKeyAlreadyPressed(k, ["left", "a", "right", "d"])) break;
          player.move(0, -player.speed);
          player.direction = "up";
          playAnimIfNotPlaying(player, "player-walk-up");
          break;
        case "right":
        case "d":
          if (isKeyAlreadyPressed(k, ["up", "w", "down", "s"])) break;
          player.move(player.speed, 0);
          player.direction = "right";
          playAnimIfNotPlaying(player, "player-walk-right");
          break;
        case "down":
        case "s":
          if (isKeyAlreadyPressed(k, ["left", "a", "right", "d"])) break;
          player.move(0, player.speed);
          player.direction = "down";
          playAnimIfNotPlaying(player, "player-walk-down");
          break;
      }
    });

    k.onKeyRelease((_key: Key) => {
      if (_key === "shift") {
        this.stopShielding();
      }
      player.stop();
    });

    k.onKeyPress((_key: Key) => {
      if (
        player.isAttacking ||
        player.isShielding ||
        player.isInteracting ||
        globalState.freezePlayer
      )
        return;
      if (_key === "space") {
        this.handleSwordAttack(_key);
      } else if (_key === "shift") {
        this.handleShield(_key);
      }
    });
  }

  // convenience: returns the underlying GameObj for code that expects it
  getGameObj() {
    return this.player;
  }

  // Touch movement - reads DPad direction each frame
  enableTouchMovement(dpad: DPad) {
    const player = this.player;
    const k = this.k;
    let lastDirection: Facing | null = null;

    k.onUpdate(() => {
      if (player.isInteracting || globalState.freezePlayer) return;

      const direction = dpad.getCurrentDirection();

      if (direction) {
        switch (direction) {
          case "left":
            player.move(-player.speed, 0);
            player.direction = "left";
            playAnimIfNotPlaying(player, "player-walk-left");
            break;
          case "up":
            player.move(0, -player.speed);
            player.direction = "up";
            playAnimIfNotPlaying(player, "player-walk-up");
            break;
          case "right":
            player.move(player.speed, 0);
            player.direction = "right";
            playAnimIfNotPlaying(player, "player-walk-right");
            break;
          case "down":
            player.move(0, player.speed);
            player.direction = "down";
            playAnimIfNotPlaying(player, "player-walk-down");
            break;
        }
        lastDirection = direction;
      } else if (lastDirection) {
        // Player released direction - stop and idle
        player.stop();
        playAnimIfNotPlaying(player, "player-idle-" + player.direction);
        lastDirection = null;
      }
    });
  }

  // Touch actions - connects ActionPad callbacks
  enableTouchActions(actionPad: ActionPad) {
    actionPad.onAttackStart = () => {
      this.handleSwordAttackTouch();
    };
    actionPad.onShieldStart = () => {
      this.handleShieldTouch();
    };
    actionPad.onShieldEnd = () => {
      this.stopShielding();
    };
  }

  public async handleSwordAttack(key: Key) {
    if (
      key != "space" ||
      globalState.freezePlayer ||
      !globalState.isSwordUnlocked
    )
      return;
    this.performSwordAttack();
  }

  // Touch version without key check
  public async handleSwordAttackTouch() {
    if (globalState.freezePlayer || !globalState.isSwordUnlocked) return;
    this.performSwordAttack();
  }

  private async performSwordAttack() {
    const k = this.k;
    const player = this.player;
    if (player.isAttacking || player.isShielding || player.isInteracting)
      return;
    player.isAttacking = true;

    if (k.get("swordHitBox").length === 0) {
      const swordHitBoxDimensions = this.getSwordHitBoxDimensions(
        player.direction,
      );
      const swordHitBoxPos = this.getSwordHitBoxPos(player.direction);
      const swordHitBoxGameObj = k.add([
        k.sprite("assets", {
          anim: "attack-afterEffects-" + player.direction,
        }),
        k.area({
          shape: new k.Rect(
            k.vec2(0),
            swordHitBoxDimensions[0],
            swordHitBoxDimensions[1],
          ),
        }),
        k.pos(swordHitBoxPos),
        "swordHitBox",
      ]);
      k.play("sword");

      swordHitBoxGameObj.onAnimEnd(() => {
        k.destroy(swordHitBoxGameObj);
        playAnimIfNotPlaying(player, "player-idle-" + player.direction);
        player.stop();
        player.isAttacking = false;
      });
    }

    playAnimIfNotPlaying(player, "player-attack-" + player.direction);
  }

  public async handleShield(key: Key) {
    if (
      key != "shift" ||
      globalState.freezePlayer ||
      !globalState.isShieldUnlocked
    )
      return;
    this.performShield();
  }

  // Touch version without key check
  public async handleShieldTouch() {
    if (globalState.freezePlayer || !globalState.isShieldUnlocked) return;
    this.performShield();
  }

  private async performShield() {
    const k = this.k;
    const player = this.player;
    if (player.isAttacking || player.isShielding || player.isInteracting)
      return;
    player.isShielding = true;

    if (k.get("shieldHitBox").length === 0) {
      const shieldHitPosition = this.getSwordHitBoxPos(player.direction);
      const dimensions = this.getSwordHitBoxDimensions(player.direction);
      const shieldHitBoxGameObj = k.add([
        k.area({
          shape: new k.Rect(k.vec2(0), dimensions[0], dimensions[1]),
        }),
        k.pos(shieldHitPosition),
        "shieldHitBox",
      ]);

      shieldHitBoxGameObj;
    }

    playAnimIfNotPlaying(player, "player-shield-" + player.direction);
  }

  public stopShielding() {
    const k = this.k;
    const player = this.player;
    const shieldHitBoxGameObj = k.get("shieldHitBox")?.[0];
    if (shieldHitBoxGameObj) k.destroy(shieldHitBoxGameObj);
    playAnimIfNotPlaying(player, "player-idle-" + player.direction);
    player.stop();
    player.isShielding = false;
  }

  private getSwordHitBoxDimensions(playerDirection: Facing) {
    const dimensions = [8, 8];
    switch (playerDirection) {
      case "down":
      case "up":
        dimensions[0] += 8;
        break;
      case "left":
      case "right":
        dimensions[1] += 8;
        break;
    }
    return dimensions;
  }

  private getSwordHitBoxPos(playerDirection: Facing): Vec2 {
    const hitBoxPos = this.player.worldPos() as Vec2;
    switch (playerDirection) {
      case "down":
        hitBoxPos.x += 0;
        hitBoxPos.y += 12;
        break;
      case "left":
        hitBoxPos.x += -8;
        hitBoxPos.y += 0;
        break;
      case "right":
        hitBoxPos.x += 12;
        hitBoxPos.y += 0;
        break;
      case "up":
        hitBoxPos.x += 0;
        hitBoxPos.y += -8;
        break;
    }
    return hitBoxPos;
  }
}

export function createDoorGameObj(ctx: KAPLAYCtx, map: GameObj, pos: Vec2) {
  const door = map.add([
    ctx.sprite("assets", { anim: "open-door" }),
    ctx.body(),
    ctx.pos(pos),
    ctx.opacity(),
    "door",
  ]);
  return door;
}
export function createChestGameObj(ctx: KAPLAYCtx, map: GameObj, pos: Vec2) {
  const treasureChest = map.add([
    ctx.sprite("assets"),
    ctx.pos(pos),
    ctx.opacity(),
    "chest",
  ]);
  return treasureChest;
}
