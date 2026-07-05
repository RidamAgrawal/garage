import type { Collision, GameObj, KAPLAYCtx, Vec2 } from "kaplay";
import BaseScene from "./BaseScene";
import {
  fetchMapData,
  drawLayer,
  drawBoundaries,
  colorizeBackground,
  showSceneIntro,
  blinkEffect,
  detectDeviceType,
} from "../utils";
import DPad from "../uiComponents/dpad";
import ActionPad from "../uiComponents/actionpad";
import {
  createChestGameObj,
  createDoorGameObj,
  PlayerEntity,
} from "../entities/player";
import { SlimeEntity } from "../entities/slime";
import { OldManEntity } from "../entities/oldman";
import { globalState } from "../state/stateManager";
import { WindmillEntity } from "../entities/windmill";
import { HurdleEntity } from "../entities/hurdle";
import { WizardEntity } from "../entities/wizard";
import { GhostEntity } from "../entities/ghost";
import { dialogue } from "../uiComponents/dialog";
import rabbitLines from "../content/rabbitContent";

export type backgroundConfig = {
  red: number;
  green: number;
  blue: number;
};

export type SpawnHandler = (opts: {
  k: KAPLAYCtx;
  map: GameObj;
  obj: any;
  entities: Record<string, any>;
}) => GameObj | null | void;

export default class MapScene extends BaseScene {
  mapPath: string;
  map!: GameObj;
  entities: Record<string, any> = {};
  canvasBackgroundConfig: backgroundConfig | null;
  player: PlayerEntity | null = null;
  oldManEntity: OldManEntity | null = null;
  wizardEntity: WizardEntity | null = null;
  hurdleEntities: HurdleEntity[] = [];
  ghostSpawnPositions: import("kaplay").Vec2[] = [];
  ghostSpawnIndex = 0;
  spawnPointLayer: any;

  mapWidth!: number;
  mapHeight!: number;

  constructor(
    k: KAPLAYCtx,
    mapPath: string,
    canvasBackgroundConfig?: backgroundConfig,
  ) {
    super(k);
    this.mapPath = mapPath;
    this.canvasBackgroundConfig = canvasBackgroundConfig ?? null;
  }

  public async init(spawnHandlers: Record<string, SpawnHandler>) {
    const mapData = await fetchMapData(this.mapPath);
    this.map = this.k.add([this.k.pos(0, 0)]);

    this.mapWidth = mapData.width * mapData.tilewidth;
    this.mapHeight = mapData.height * mapData.tileheight;

    for (const layer of mapData.layers) {
      if (layer.name === "boundaries") {
        drawBoundaries(this.k, this.map, layer);
        continue;
      }
      if (layer.name === "spawnPoints") {
        this.spawnPointLayer = layer;
        for (const obj of layer.objects) {
          if (obj.name == "player") {
            continue;
          }
          const handler = spawnHandlers[obj.name];
          if (handler) {
            handler({
              k: this.k,
              map: this.map,
              obj,
              entities: this.entities,
            });
          }
        }
        continue;
      }
      drawLayer(this.k, this.map, layer, mapData.tileheight, mapData.tilewidth);
    }

    // optional scene-specific defaults
    if (this.canvasBackgroundConfig)
      colorizeBackground(this.k, this.canvasBackgroundConfig);

    const isMobile = detectDeviceType() === "mobile";
    this.k.setCamScale(isMobile ? 3 : 2);

    if (mapData.sceneIntro) {
      showSceneIntro(this.k, mapData.sceneIntro, "");
    }
  }

  public destroy() {
    // clear scene objects, listeners etc. (implementation depends on kaplay API)
  }

  public getGameObjFromSpawnHandlerProperties(objString: string) {
    for (const entityName in this.entities) {
      if (entityName.includes(objString) && this.entities[entityName])
        return this.entities[entityName];
    }
    return null;
  }

  public handlePlayerCollision() {
    this.player?.player.onCollide((gameObj: GameObj, _col: Collision) =>
      this.playerCollisionHandler(gameObj, _col),
    );
  }

  public async playerCollisionHandler(gameObj: GameObj, _col: Collision) {
    const k = this.k;
    const playerGameObj = this.player!.player;
    if (gameObj.tags.includes("house1")) {
      const doorObj = createDoorGameObj(k, this.map, gameObj.pos.clone());
      doorObj.onAnimEnd(() => {
        k.go("house1");
        doorObj?.destroy();
      });
    } else if (gameObj.tags.includes("house2")) {
      const doorObj = createDoorGameObj(k, this.map, gameObj.pos.clone());
      doorObj.onAnimEnd(() => {
        k.go("house2");
        doorObj?.destroy();
      });
    } else if (gameObj.tags.includes("fortRoom1")) {
      k.go("fortRoom1");
    } else if (gameObj.tags.includes("fortRoom2")) {
      k.go("fortRoom2");
    } else if (gameObj.tags.includes("fortRoom3")) {
      k.go("fortRoom3");
    } else if (gameObj.tags.includes("village")) {
      k.go("village");
    } else if (gameObj.tags.includes("forest")) {
      k.go("forest");
    } else if (gameObj.tags.includes("world3")) {
      k.go("world3");
    } else if (gameObj.tags.includes("world4")) {
      k.go("world4");
    } else if (gameObj.tags.includes("bonfire")) {
      if (globalState.isShieldUnlocked) return;
      globalState.isShieldUnlocked = true;

      const chestPos = gameObj.pos.clone();
      const chestObj = createChestGameObj(k, this.map, chestPos);

      // Play chest-opening animation (closed → open), stays on open frame
      chestObj.play("chest-open");

      chestObj.on("animEnd", () => {
        k.play("obtainShield");
        // Spawn the shield sprite above the opened chest
        const shieldStartPos = k.vec2(chestPos.x, chestPos.y);
        const shieldEndPos = k.vec2(chestPos.x, chestPos.y - 20);

        const shieldObj = this.map.add([
          k.sprite("assets", { frame: 179 }),
          k.pos(shieldStartPos),
          k.opacity(1),
          k.z(3),
          "floatingShield",
        ]);

        // Float the shield upward
        k.tween(
          shieldStartPos.y,
          shieldEndPos.y,
          1.2,
          (val) => {
            shieldObj.pos.y = val;
          },
          k.easings.easeOutCubic,
        );

        // Fade the shield out (start fading halfway through the float)
        k.wait(0.6, () => {
          k.tween(
            1,
            0,
            0.6,
            (val) => {
              shieldObj.opacity = val;
            },
            k.easings.easeInCubic,
          );
        });

        // After the full animation, clean up chest and shield
        k.wait(1.2, () => {
          shieldObj.destroy();
          chestObj.destroy();
        });
      });
    } else if (gameObj.tags.includes("oldMan")) {
      playerGameObj.isInteracting = true;
      globalState.freezePlayer = true;
      const interactionPromise = this.oldManEntity?.startInteraction();
      interactionPromise?.then(() => {
        playerGameObj.isInteracting = false;
        globalState.freezePlayer = false;
        globalState.talkedToOldman = true;
        globalState.isSwordUnlocked = true;
      });
    } else if (gameObj.tags.includes("slime")) {
      await this.applyPlayerDamage(gameObj, gameObj.attackPower);
    } else if (gameObj.tags.includes("ghost")) {
      // Ghost is a kamikaze: it hurts the player and is destroyed on contact,
      // which summons the next ghost.
      await this.applyPlayerDamage(gameObj, gameObj.attackPower);
      this.defeatGhost(gameObj);
    } else if (gameObj.tags.includes("coin")) {
      this.collectCoin(gameObj);
    } else if (
      gameObj.tags.includes("windmill") ||
      gameObj.tags.includes("windmill1") ||
      gameObj.tags.includes("windmill2")
    ) {
      k.go("windmill");
    } else if (gameObj.tags.includes("roof")) {
      k.go("roof");
    } else if (gameObj.tags.includes("hurdle")) {
      // Only harmful while the thorns are raised.
      if (!gameObj.isUp) return;
      playerGameObj.stop();
      await this.applyPlayerDamage(gameObj, gameObj.damage);
    } else if (
      gameObj.tags.includes("skull-attack") ||
      gameObj.tags.includes("bone-attack")
    ) {
      await this.applyPlayerDamage(gameObj, gameObj.attackPower);
    }
  }

  public enableOldManToNoticePlayer() {
    const playerObj = this.player?.player;
    if (playerObj) {
      playerObj.onUpdate(() =>
        this.oldManEntity?.noticePlayer(this.player?.player ?? null),
      );
    }
  }

  public enableWizardToNoticePlayer() {
    const playerObj = this.player?.player;
    if (playerObj) {
      playerObj.onUpdate(() =>
        this.wizardEntity?.noticePlayer(this.player?.player ?? null),
      );
    }
  }

  public enableWizardToAttackPlayer() {
    const playerObj = this.player?.player;
    if (playerObj) {
      this.wizardEntity?.setWizardAi(playerObj);
    }
  }

  public drawPlayer() {
    const playerInsertPointName = globalState.getplayerInsertPointName(this.k);
    const playerSpawnPointObject = this.spawnPointLayer.objects.find(
      (obj: any) => obj.name === playerInsertPointName,
    ) as GameObj | null;
    if (playerSpawnPointObject) {
      this.player = new PlayerEntity(
        this.k,
        this.map,
        this.k.vec2(playerSpawnPointObject.x, playerSpawnPointObject.y),
      );
      if (this.player instanceof PlayerEntity) {
        const p = this.player.player;

        const deviceType = detectDeviceType();
        if (deviceType === "mobile") {
          const dpad = new DPad(this.k);
          dpad.init();

          const actionPad = new ActionPad(this.k);
          actionPad.init();

          this.player.enableTouchMovement(dpad);
          this.player.enableTouchActions(actionPad);
        } else {
          this.player.enableMovement();
        }

        this.k.setCamPos(p.worldPos());

        this.k.onUpdate(() => {
          this.adjustCameraToPlayerPosition();
        });
      }
    } else {
      this.k.debug.log("Error: player not found");
      console.error(
        "Error: no object found with insert point name " +
          playerInsertPointName +
          " in spawnPoints layer",
      );
    }
  }

  public adjustCameraToPlayerPosition() {
    const k = this.k;
    const p = this.player?.player as GameObj;
    if (!k || !p) return;

    const camScale = k.getCamScale().x;

    const viewPortWidth = k.width() / camScale;
    const viewPortHeight = k.height() / camScale;

    const halfViewW = viewPortWidth / 2;
    const halfViewH = viewPortHeight / 2;

    let targetX = p.worldPos().x;
    let targetY = p.worldPos().y;

    if (this.mapWidth <= viewPortWidth) {
      targetX = this.mapWidth / 2;
    } else {
      targetX = Math.max(
        halfViewW,
        Math.min(p.worldPos().x, this.mapWidth - halfViewW),
      );
    }

    if (this.mapHeight <= viewPortHeight) {
      targetY = this.mapHeight / 2;
    } else {
      targetY = Math.max(
        halfViewH,
        Math.min(p.worldPos().y, this.mapHeight - halfViewH),
      );
    }

    const targetPos = k.vec2(targetX, targetY);

    if (p.pos.dist(k.getCamPos())) {
      k.tween(
        k.getCamPos(),
        targetPos,
        0.15,
        (newPos) => k.setCamPos(newPos),
        k.easings.linear,
      );
    }
  }

  public drawSlimes(slimeInsertPointNames: string | string[]) {
    const slimeSpawnPointObjects = (
      this.spawnPointLayer.objects as any[]
    ).filter((obj) => obj && slimeInsertPointNames.includes(obj.name));
    slimeSpawnPointObjects.forEach((slimeObj) => {
      const slimeEntity = new SlimeEntity(
        this.k,
        this.map,
        this.k.vec2(slimeObj.x, slimeObj.y),
      );
      slimeEntity?.setSlimeAi((slime) => this.spawnCoinAt(slime.pos));
    });
  }

  // Ghosts are not all rendered at once: only one is alive at a time, and the
  // next spawn point's ghost appears once the current one is defeated (by the
  // player's sword) or destroyed by colliding with the player.
  public drawGhosts(ghostInsertPointName: string) {
    this.ghostSpawnPositions = (this.spawnPointLayer.objects as any[])
      .filter((obj) => obj && obj.name === ghostInsertPointName)
      .map((obj) => this.k.vec2(obj.x, obj.y));
    this.ghostSpawnIndex = 0;
    this.spawnNextGhost();
  }

  private spawnNextGhost() {
    const pos = this.ghostSpawnPositions[this.ghostSpawnIndex];
    if (!pos) return; // all ghosts defeated
    this.ghostSpawnIndex++;
    const ghostEntity = new GhostEntity(this.k, this.map, pos);
    ghostEntity.setGhostAi(this.player?.player ?? null);
    const ghost = ghostEntity.ghostGameObj;
    if (!ghost) return;
    // Defeating the ghost with the sword summons the next one.
    ghost.onCollide("swordHitBox", () => this.defeatGhost(ghost));
  }

  private defeatGhost(ghost: GameObj) {
    if (!ghost.exists() || ghost.isDefeated) return;
    ghost.isDefeated = true;
    const dropPos = ghost.pos.clone();
    this.k.destroy(ghost);
    this.spawnCoinAt(dropPos);
    this.spawnNextGhost();
  }

  // Creates a single collectible coin game object. A coinKey (only for coins
  // placed from the map) makes the pickup permanent across scene re-entry.
  private createCoin(pos: Vec2, coinKey?: string) {
    const k = this.k;
    return k.add([
      k.sprite("assets", { anim: "coin" }),
      k.pos(pos),
      k.area({ shape: new k.Rect(k.vec2(0), 12, 14) }),
      k.anchor("center"),
      k.opacity(),
      k.z(1),
      { collected: false, coinKey: coinKey ?? null },
      "coin",
    ]);
  }

  // Places collectible coins at every "coin" spawn point on the map, skipping
  // any that have already been collected so they are picked up only once.
  public drawCoins(coinInsertPointName: string) {
    const k = this.k;
    const sceneName = k.getSceneName();
    (this.spawnPointLayer.objects as any[])
      .filter((obj) => obj && obj.name === coinInsertPointName)
      .forEach((obj) => {
        const coinKey = `${sceneName}:${obj.id}`;
        if (globalState.isCoinCollected(coinKey)) return;
        this.createCoin(k.vec2(obj.x + 8, obj.y + 8), coinKey);
      });
  }

  // Drops an untracked coin at a position (e.g. from a defeated enemy).
  public spawnCoinAt(pos: Vec2) {
    this.createCoin(pos.clone());
  }

  // A static rabbit NPC that shows a hint dialogue when the player gets close.
  // Uses proximity (not onCollide) because a solid body's collision resolution
  // prevents the areas from overlapping, so onCollide won't fire reliably.
  public drawRabbit(rabbitInsertPointName: string) {
    const k = this.k;
    const obj = (this.spawnPointLayer.objects as any[]).find(
      (o) => o && o.name === rabbitInsertPointName,
    );
    if (!obj) return;
    const rabbit = k.add([
      k.sprite("assets", { anim: "rabbit-idle-down" }),
      k.pos(obj.x, obj.y),
      k.area({ shape: new k.Rect(k.vec2(3, 4), 10, 12) }),
      k.body({ isStatic: true }),
      k.opacity(),
      k.z(1),
      "rabbit",
    ]);

    let talking = false;
    let inRange = false;
    const updateRef = k.onUpdate(() => {
      const player = this.player?.player;
      if (!player || !rabbit.exists()) return;
      // Turn to face the player along the dominant axis.
      const dx = player.pos.x - rabbit.pos.x;
      const dy = player.pos.y - rabbit.pos.y;
      const facing =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0
            ? "right"
            : "left"
          : dy > 0
            ? "down"
            : "up";
      const faceAnim = `rabbit-idle-${facing}`;
      if (rabbit.curAnim() !== faceAnim) rabbit.play(faceAnim);
      const near = player.pos.dist(rabbit.pos) <= 24;
      if (near && !inRange && !talking && !globalState.freezePlayer) {
        inRange = true;
        talking = true;
        player.isInteracting = true;
        globalState.freezePlayer = true;
        dialogue(k, k.vec2(50, 50), rabbitLines.english).then(() => {
          player.isInteracting = false;
          globalState.freezePlayer = false;
          talking = false;
        });
      } else if (!near) {
        inRange = false;
      }
    });
    k.onSceneLeave(() => updateRef.cancel());
  }

  // A one-time reward chest: walking close to it opens the chest and grants the
  // player a permanent extra heart. Won't reappear once opened.
  public drawHeartChest(chestInsertPointName: string) {
    const k = this.k;
    const sceneName = k.getSceneName();
    const obj = (this.spawnPointLayer.objects as any[]).find(
      (o) => o && o.name === chestInsertPointName,
    );
    if (!obj) return;
    const key = `${sceneName}:${obj.id}`;
    if (globalState.isChestOpened(key)) return;

    const chest = this.map.add([
      k.sprite("assets", { frame: 137 }),
      k.pos(obj.x, obj.y),
      k.opacity(),
      k.z(1),
      { opened: false },
      "heartChest",
    ]);

    const updateRef = k.onUpdate(() => {
      const player = this.player?.player;
      if (!player || !chest.exists() || chest.opened) return;
      if (player.pos.dist(chest.pos) <= 22) {
        chest.opened = true;
        updateRef.cancel();
        globalState.markChestOpened(key);
        this.openHeartChest(chest);
      }
    });
    k.onSceneLeave(() => updateRef.cancel());
  }

  private openHeartChest(chest: GameObj) {
    const k = this.k;
    chest.play("chest-open");
    chest.on("animEnd", () => {
      k.play("obtainShield");
      this.giveExtraHeart();
      // Float a heart up out of the chest, then fade it out.
      const startY = chest.pos.y;
      const heart = this.map.add([
        k.sprite("assets", { frame: 176 }),
        k.pos(chest.pos.x, startY),
        k.opacity(1),
        k.z(3),
        "floatingHeart",
      ]);
      k.tween(startY, startY - 20, 1.2, (v) => (heart.pos.y = v), k.easings.easeOutCubic);
      k.wait(0.6, () => {
        k.tween(1, 0, 0.6, (v) => (heart.opacity = v), k.easings.easeInCubic);
      });
      k.wait(1.2, () => heart.exists() && heart.destroy());
    });
  }

  private giveExtraHeart() {
    const player = this.player?.player;
    if (!player) return;
    globalState.addMaxHeart();
    player.setHealth(player.getHealth() + 1);
  }

  private collectCoin(coin: GameObj) {
    if (!coin.exists() || coin.collected) return;
    coin.collected = true;
    const k = this.k;
    if (coin.coinKey) globalState.markCoinCollected(coin.coinKey);
    globalState.coins += 1;
    k.play("coin", { volume: 0.6 });
    // Float up and fade out, then remove.
    coin.z = 3;
    const target = coin.pos.add(0, -24);
    k.tween(coin.pos, target, 0.4, (v) => (coin.pos = v), k.easings.easeOutQuad);
    k.tween(coin.opacity, 0, 0.4, (v) => (coin.opacity = v), k.easings.linear);
    k.wait(0.4, () => coin.exists() && coin.destroy());
  }

  public drawOldMan(oldManInsertPointName: string) {
    const oldManSpawnPointObject = this.spawnPointLayer.objects.find(
      (obj: any) => obj.name === oldManInsertPointName,
    ) as GameObj | null;
    if (oldManSpawnPointObject) {
      this.oldManEntity = new OldManEntity(
        this.k,
        this.map,
        this.k.vec2(oldManSpawnPointObject.x, oldManSpawnPointObject.y),
      );
      if (this.oldManEntity instanceof OldManEntity) {
        this.oldManEntity.noticePlayer(this.player?.player ?? null);
      }
    }
  }

  public drawWindmill(windmillInsertPointName: string) {
    const windmillSpawnPointObjects = this.spawnPointLayer.objects.filter(
      (obj: any) => obj.name === windmillInsertPointName,
    ) as GameObj[];
    if (windmillSpawnPointObjects.length) {
      windmillSpawnPointObjects.forEach((windmillSpawnPointObject) => {
        new WindmillEntity(
          this.k,
          this.map,
          this.k.vec2(windmillSpawnPointObject.x, windmillSpawnPointObject.y),
        );
      });
    }
  }

  public drawHurdles(hurdlesInsterPointName: string) {
    const hurdlesSpawnPointObjects = this.spawnPointLayer.objects.filter(
      (obj: any) => obj.name === hurdlesInsterPointName,
    ) as GameObj[];
    if (hurdlesSpawnPointObjects.length) {
      hurdlesSpawnPointObjects.forEach((hurdleSpawnPointObject) => {
        this.hurdleEntities.push(
          new HurdleEntity(
            this.k,
            this.map,
            this.k.vec2(
              hurdleSpawnPointObject.x + 24,
              hurdleSpawnPointObject.y + 10,
            ),
          ),
        );
      });
    }
  }

  public enableHurdlesToDetectPlayer() {
    const playerObj = this.player?.player ?? null;
    this.hurdleEntities.forEach((hurdle) => hurdle.watchPlayer(playerObj));
  }

  public drawWizard(wizardInsertPointName: string) {
    const wizardSpawnPointObject = this.spawnPointLayer.objects.find(
      (obj: any) => obj.name === wizardInsertPointName,
    ) as GameObj | null;
    if (wizardSpawnPointObject) {
      this.wizardEntity = new WizardEntity(
        this.k,
        this.map,
        this.k.vec2(wizardSpawnPointObject.x, wizardSpawnPointObject.y),
      );
    }
  }

  public async applyPlayerDamage(gameObj: GameObj, damage: number) {
    if (!gameObj || !this.player) return;
    const playerGameObj = this.player.player;
    const k = this.k;
    if (
      !playerGameObj ||
      playerGameObj.isAttacking ||
      playerGameObj.isInvincible ||
      !k
    )
      return;
    playerGameObj.damage(damage);
    await blinkEffect(k, playerGameObj);
    if (playerGameObj.getHealth() <= 0) {
      playerGameObj.setHealth(playerGameObj.getMaxHealth());
      globalState.talkedToOldman =
        globalState.isSwordUnlocked =
        globalState.isShieldUnlocked =
          false;
      const respawnSound = k.play("respawn", {
        volume: 0.8,
      });
      respawnSound.onEnd(() => {
        k.go("village");
      });
    }
  }
}
