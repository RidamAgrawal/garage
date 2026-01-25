import type { KAPLAYCtx, GameObj, Vec2 } from "kaplay";

export class WindmillEntity {
    k: KAPLAYCtx;
    map: GameObj;
    windmill: GameObj;
    constructor(k: KAPLAYCtx, map: GameObj, pos: Vec2) {
        this.k = k;
        this.map = map;
        this.windmill = k.add([
            k.sprite("windmill", {
                anim: "windmill",
            }),
            k.pos(pos),
            k.area(),
            k.body({ isStatic: true }),
            k.anchor("center"),
            k.z(0),
            "windmill",
        ]);
    }
}