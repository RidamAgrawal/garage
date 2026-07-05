import type { GameObj, KAPLAYCtx, KEventController, Vec2 } from "kaplay";
import { onAttacked, onShield, playAnimIfNotPlaying } from "../utils";

const directionalStates = ["left", "right", "up", "down"];

export class SlimeEntity{
    private k!:KAPLAYCtx;
    public map: GameObj;
    public slimeGameObj: GameObj | null = null;
    private slimeMoveRef: KEventController | null = null;
    constructor(k: KAPLAYCtx, map: GameObj, pos: Vec2) {
        this.k = k;
        this.map = map;
        this.slimeGameObj = k.add([
            k.sprite("assets", {
                anim: "slime-idle-down",
            }),
            k.area({
                shape: new k.Rect(k.vec2(0, 6), 16, 10),
            }),
            k.body(),
            k.pos(pos),
            k.offscreen(),
            k.opacity(),
            k.state("idle", ["idle", ...directionalStates]),
            k.health(3),
            {
                speed: 30,
                attackPower: 0.5,
                isAttacking: false
            },
            "slime",
        ]);

        this.slimeGameObj.onDestroy(() => {
            this.slimeMoveRef?.cancel();
        })
    }

    public setSlimeAi(onKilled?: (slime: GameObj) => void) {
        const k = this.k;
        const slime = this.slimeGameObj;
        if(!slime) return;
        this.slimeMoveRef = k.onUpdate(() => {
            switch(slime.state) {
                case "left":
                    slime.move(-slime.speed, 0);
                    break;
                case "right":
                    slime.move(slime.speed, 0);
                    break;
                case "up":
                    slime.move(0, -slime.speed);
                    break;
                case "down":
                    slime.move(0, slime.speed);
                    break;
            }
        })

        const idle = slime.onStateEnter("idle", async () => this.setSlimeState());
        const left = slime.onStateEnter("left", async () => this.setSlimeState("left"));
        const right = slime.onStateEnter("right", async () => this.setSlimeState("right"));
        const up = slime.onStateEnter("up", async () => this.setSlimeState("up"));
        const down = slime.onStateEnter("down", async () => this.setSlimeState("down"));
        k.onSceneLeave(() => {
            idle.cancel();
            left.cancel();
            right.cancel();
            up.cancel();
            down.cancel();
        });
        onAttacked(k, slime, onKilled);
        onShield(k, slime);
        // slime.onCollide("shieldHitBox", async () => {
        //     k.debug.log("slime collided with shield");
        //     slime.stop();
        //     slime.enterState("idle");
        // })
    }

    public async setSlimeState(direction?: string) {
        const slime = this.slimeGameObj;
        const k = this.k;
        if(!slime) return;
        if(!direction) {
            slime.stop();
            await k.wait(3);
            slime.enterState(directionalStates[Math.floor(Math.random() * directionalStates.length)]);
        }
        else {
            playAnimIfNotPlaying(slime, "slime-walk-"+direction);
            await k.wait(3);
            slime.enterState("idle");
        }
    }
}