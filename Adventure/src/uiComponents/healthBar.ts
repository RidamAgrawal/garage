import type { GameObj, KAPLAYCtx } from "kaplay";
import { globalState } from "../state/stateManager";

export default class HealthBar {
  k: KAPLAYCtx | null = null;
  playerGameObj: GameObj | null = null;
  heartsContainer: GameObj | null = null;
  constructor(k: KAPLAYCtx, playerGameObj: GameObj) {
    this.k = k;
    this.playerGameObj = playerGameObj;
  }

  init() {
    this.renderHealthBar();
    this.playerGameObj?.on("healthChanged",()=> {
      this.k?.destroyAll("heartsContainer");
      this.renderHealthBar();
    });
  }

  renderHealthBar() {
    if (!this.playerGameObj || !this.k) return;
    const k = this.k;
    
    k.destroyAll("heartsContainer");

    const playerHealth = this.playerGameObj.getHealth();
    let noFullHearts = Math.floor(playerHealth);
    let isHalfHeart = Math.round(playerHealth) - Math.floor(playerHealth);
    let noEmptyHearts = this.playerGameObj.getMaxHealth() - noFullHearts - isHalfHeart;

    this.heartsContainer = k.add([k.pos(20, 20), k.fixed(), "heartsContainer", k.color(k.Color.fromHex("1288bc"))]);
    let startX = 0;
    
    startX = this.addHeartObjToContainer(noFullHearts, "full-heart", startX);
    startX = this.addHeartObjToContainer(isHalfHeart, "half-heart", startX);
    startX = this.addHeartObjToContainer(noEmptyHearts, "empty-heart", startX);
    startX = this.addHeartObjToContainer(+globalState.isShieldUnlocked, "shield", startX);
    startX = this.addHeartObjToContainer(+globalState.isSwordUnlocked, "sword", startX);
    return this.heartsContainer;
  }

  addHeartObjToContainer(noHeart: number, heartSpriteName: string, xPos: number) {
    if (!this.k || !this.heartsContainer) return xPos;
    const k = this.k;
    for (let i = 0; i < noHeart; i++) {
        const heartGameObj = k.make([
            k.sprite(heartSpriteName), 
            k.pos(xPos, 0), 
            k.area(), 
            heartSpriteName
        ]);
        this.heartsContainer.add(heartGameObj);

        heartGameObj.onHover(() => {
            if (["full-heart", "half-heart", "empty-heart"].includes(heartSpriteName)) {
                k.debug.log(`Hearts left: ${this.playerGameObj?.getHealth()}`);
            } else if (["sword"].includes(heartSpriteName)) {
                k.debug.log("press space to attack");
            } else if (["shield"].includes(heartSpriteName)) {
                k.debug.log("press right click to block");
            }
        });
        xPos += 48
    }
    return xPos;
  }
}
