import { type GameObj, type KAPLAYCtx, type Key } from "kaplay";
import { WORLD_BLOCK_ANIMS, type TileAnim } from "./constants";
import { globalState } from "./state/stateManager";

export async function fetchMapData(mapPath: string) {
  return await (await fetch(mapPath)).json();
}

export function colorizeBackground(
  k: KAPLAYCtx,
  { red, green, blue }: { red: number; green: number; blue: number },
) {
  k.setBackground(red, blue, green);
}

export function drawLayer(
  k: KAPLAYCtx,
  map: GameObj,
  layer: any,
  tileHeight: number,
  tileWidth: number,
) {
  let noDrawnTiles = 0;
  const tilePos = k.vec2(0, 0);

  for (const tile of layer.data) {
    if (noDrawnTiles % layer.width === 0) {
      tilePos.x = 0;
      tilePos.y += tileHeight;
    } else {
      tilePos.x += tileWidth;
    }

    noDrawnTiles++;
    if (tile === 0) continue;

    // playing tile animations if it has otherwise rendering the tile as it is

    const anim = WORLD_BLOCK_ANIMS[tile - 1];

    if (anim) {
      const spr = map.add([k.sprite("assets"), k.pos(tilePos.x, tilePos.y)]);
      spr.play(`${tile - 1}`);
    } else {
      map.add([
        k.sprite("assets", { frame: tile - 1 }),
        k.pos(tilePos),
        k.offscreen(),
      ]);
    }
  }
}

export function generateColliderComponent(
  k: KAPLAYCtx,
  width: number,
  height: number,
  pos: any,
  tag: string,
) {
  return [
    k.area({ shape: new k.Rect(k.vec2(0), width, height) }),
    k.pos(pos),
    k.body({ isStatic: true }),
    k.offscreen(),
    tag,
  ];
}

export function drawBoundaries(k: KAPLAYCtx, map: GameObj, layer: any) {
  for (const object of layer.objects) {
    if (object.width || object.height) {
      map.add(
        generateColliderComponent(
          k,
          object.width,
          object.height,
          k.vec2(object.x, object.y + 16),
          object.name,
        ),
      );
    }
    if (object.polygon) {
      const points = object.polygon.map((p: any) => k.vec2(p.x, p.y));

      map.add([
        k.pos(object.x, object.y + 16),
        k.area({
          shape: new k.Polygon(points),
        }),
        k.body({ isStatic: true }),
        object.name,
      ]);
    }
  }
}

export function playAnimIfNotPlaying(gameObj: GameObj, animName: string) {
  if (gameObj.curAnim() !== animName) gameObj.play(animName);
}

export function isKeyAlreadyPressed(k: KAPLAYCtx, keys: Key[]) {
  for (const key of keys) {
    if (k.isKeyDown(key)) return true;
  }
  return false;
}

export function showSceneIntro(k: KAPLAYCtx, title: string, hint: string) {
  const panel = k.add([
    k.rect(360, 120),
    k.pos(k.width() / 2, 80),
    k.anchor("center"),
    k.color(0, 0, 0),
    k.opacity(0.75),
    k.fixed(),
  ]);

  const text = k.add([
    k.text(`${title}\n\n${hint}`, {
      size: 18,
      align: "center",
      width: 320,
    }),
    k.pos(k.width() / 2, 80),
    k.anchor("center"),
    k.fixed(),
  ]);

  k.wait(3, () => {
    panel.destroy();
    text.destroy();
  });
}

export function buildTileAnimations(mapData: any) {
  const anims = new Map<number, TileAnim>();

  for (const ts of mapData.tilesets) {
    if (!ts.tiles) continue;

    for (const tile of ts.tiles) {
      if (!tile.animation) continue;

      const gid = ts.firstgid + tile.id;

      const frames = tile.animation.map((a: any) => ts.firstgid + a.tileid - 1);

      // Convert ms → fps (Kaplay expects frames per second)
      const speed = 1000 / tile.animation[0].duration;

      anims.set(gid, { frames, speed });
    }
  }

  return anims;
}

export async function blinkEffect(k: KAPLAYCtx, entity: GameObj) {
  k.play("hurt");
  await k.tween(
    entity.opacity,
    0,
    0.1,
    (val) => (entity.opacity = val),
    k.easings.linear,
  );
  await k.tween(
    entity.opacity,
    1,
    0.1,
    (val) => (entity.opacity = val),
    k.easings.linear,
  );
}

export function onAttacked(
  k: KAPLAYCtx,
  entity: GameObj,
  onKilled?: (entity: GameObj) => void,
) {
  entity.onCollide("swordHitBox", async () => {
    if (entity.isAttacking) return;
    if (entity.hp() <= 0) {
      onKilled?.(entity);
      k.destroy(entity);
      return;
    }
    await blinkEffect(k, entity);
    entity.hurt(1);
  });
}

export function onShield(k: KAPLAYCtx, entity: GameObj) {
  entity.onCollide("shieldHitBox", async () => {
    if (!k.isKeyDown("shift")) return;

    // const currentState = entity.getState();
    // const mapping: Record<string, string> = {
    //   left: "right",
    //   right: "left",
    //   up: "down",
    //   down: "up",
    // };

    // const reversedDirection = mapping[currentState];
    // if (entity.hp() > 0 && reversedDirection) {
    //   entity.stop();
    //   entity.enterState(reversedDirection);
    // }
    entity.stop();
    entity.enterState("idle");
  });
}

export function health(max: number) {
  let hp = max;
  let invincible = false;

  return {
    id: "health",

    getHealth() {
      return hp;
    },

    setHealth(this: GameObj, v: number) {
      hp = Math.max(0, v);
      this.trigger("healthChanged", hp);
    },

    getMaxHealth() {
      return globalState.maxHealth;
    },

    damage(this: GameObj, v: number) {
      if (invincible) return;
      invincible = true;

      hp = Math.max(0, hp - v);

      this.trigger("healthChanged", hp);

      invincible = false;
    },
  };
}

export function heartRoulette(
  k: KAPLAYCtx,
  animMaterial: Record<number | string, any>,
  randomSprites: string[],
  frameTime = 0.8,
) {
  let timer = 0;
  let index = 0;
  let stopped = false;

  return {
    id: "random",

    update(this: GameObj) {
      if (stopped) return;
      timer += k.dt();
      if (timer >= frameTime) {
        timer = 0;
        index = (index + 1) % randomSprites.length;

        const animObj = animMaterial[randomSprites[index]];
        this.use(
          k.sprite("assets", {
            width: animObj.width,
            height: animObj.height,
          }),
        );
      }
    },

    // stop(this: GameObj): string {
    //   stopped = true;
    //   const animObj =
    //     animMaterial[randomSprites[Math.max(Math.floor(Math.random() * randomSprites.length),2)]];

    //   this.use(k.sprite("assets", {
    //       width: animObj.width,
    //       height: animObj.height
    //   }));
    //   return "";
    // },
  };
}

export function savePreviousScene(k: KAPLAYCtx) {
  globalState.previousSceneName = k.getSceneName() || "";
}

export function detectDeviceType(): "mobile" | "desktop" {
  const userAgent = navigator.userAgent.toLowerCase();

  const isTouchCapable =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const screenWidth = window.innerWidth;

  if (
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent,
    ) ||
    (isTouchCapable && screenWidth <= 768)
  ) {
    return "mobile";
  }

  return "desktop";
}

export function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(
        `Error attempting to enable fullscreen: ${err.message} (${err.name})`,
      );
    });
  } else {
    document.exitFullscreen();
  }
}
