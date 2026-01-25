import "./style.css";
import k from "./kaplayContext";
import MapScene, { type SpawnHandler } from "./scenes/MapScene";
import {
  WORLD_BLOCK_ANIMS,
  WORLD_BLOCK_ANIMS2,
  WINDMILL_ANIMS,
} from "./constants";
import { savePreviousScene } from "./utils";

k.loadFont("gameboy", "./assets/gb.ttf");
k.loadSprite("assets", "./assets/worldBlocks.png", {
  sliceX: 39,
  sliceY: 31,
  anims: WORLD_BLOCK_ANIMS,
});
k.loadSpriteAtlas("assets/worldBlocks.png", WORLD_BLOCK_ANIMS2);
k.loadSpriteAtlas("assets/worldBlocks.png", WINDMILL_ANIMS);
k.loadSound("respawn", "./assets/sounds/respawn.wav");

k.scene("village", async () => {
  const scene = new MapScene(k, "./assets/maps/village.json", {
    red: 27,
    blue: 29,
    green: 52,
  });
  await scene.init({});
  scene.drawPlayer();
  scene.handlePlayerCollision();
  savePreviousScene(k);
});

const interiorScene =
  (mapPath: string, spawnHandler: Record<string, SpawnHandler>) => async () => {
    const scene = new MapScene(k, mapPath, {
      red: 16,
      green: 12,
      blue: 70,
    });
    await scene.init(spawnHandler);
    scene.drawPlayer();
    scene.handlePlayerCollision();
    savePreviousScene(k);
  };

k.scene("house1", async () => {
  const scene = new MapScene(k, "./assets/maps/house1.json", {
    red: 27,
    green: 29,
    blue: 52,
  });
  await scene.init({});
  scene.drawPlayer();
  scene.handlePlayerCollision();
  scene.drawOldMan("oldman");
  scene.enableOldManToNoticePlayer();
  savePreviousScene(k);
});
k.scene("house2", interiorScene("./assets/maps/house2.json", {}));

k.scene("forest", async () => {
  const scene = new MapScene(k, "./assets/maps/forest.json", {
    red: 27,
    blue: 29,
    green: 52,
  });
  await scene.init({});
  scene.drawPlayer();
  scene.handlePlayerCollision();
  scene.drawSlimes("slime");
  savePreviousScene(k);
});

k.scene("world3", async () => {
  const scene = new MapScene(k, "./assets/maps/world3.json", {
    red: 27,
    blue: 29,
    green: 52,
  });
  await scene.init({});
  scene.drawPlayer();
  scene.handlePlayerCollision();
  scene.drawWindmill("windmill1");
  scene.drawWindmill("windmill2");
  savePreviousScene(k);
});

k.scene("windmill", async () => {
  const scene = new MapScene(k, "./assets/maps/windmill.json", {
    red: 27,
    blue: 29,
    green: 52,
  });
  await scene.init({});
  scene.drawPlayer();
  scene.handlePlayerCollision();
  savePreviousScene(k);
});

k.scene("roof", async () => {
  const scene = new MapScene(k, "./assets/maps/roof.json", {
    red: 27,
    blue: 29,
    green: 52,
  });
  await scene.init({});
  scene.drawPlayer();
  scene.handlePlayerCollision();
  savePreviousScene(k);
});

k.scene("world4", async () => {
  const scene = new MapScene(k, "./assets/maps/world4.json", {
    red: 27,
    blue: 29,
    green: 52,
  });
  await scene.init({});
  scene.drawPlayer();
  scene.handlePlayerCollision();
  savePreviousScene(k);
});

k.scene("fortRoom1", async () => {
  const scene = new MapScene(k, "./assets/maps/fortRoom1.json", {
    red: 27,
    blue: 29,
    green: 52,
  });
  await scene.init({});
  scene.drawPlayer();
  scene.handlePlayerCollision();
  savePreviousScene(k);
});

k.scene("fortRoom2", async () => {
  const scene = new MapScene(k, "./assets/maps/fortRoom2.json", {
    red: 27,
    blue: 29,
    green: 52,
  });
  await scene.init({});
  scene.drawPlayer();
  scene.drawHurdles("hurdle");
  scene.handlePlayerCollision();
  savePreviousScene(k);
});

k.scene("fortRoom3", async () => {
  const scene = new MapScene(k, "./assets/maps/fortRoom3.json", {
    red: 27,
    blue: 29,
    green: 52,
  });
  await scene.init({});
  scene.drawPlayer();
  scene.handlePlayerCollision();
  scene.drawWizard("wizard");
  scene.enableWizardToNoticePlayer();
  scene.enableWizardToAttackPlayer();
  savePreviousScene(k);
});

k.go("village");
