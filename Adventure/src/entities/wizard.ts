import type { KAPLAYCtx, GameObj, Vec2, KEventController, AudioPlay } from "kaplay";
import type { Facing } from "./oldman";
import { onAttacked, playAnimIfNotPlaying } from "../utils";

export class WizardEntity {
  private k: KAPLAYCtx | null = null;
  public map: GameObj | null = null;
  private wizard: GameObj;
  private wizardIdleAnim: Record<Facing, string> = {
    left: "wizard-idle-left",
    up: "wizard-idle-up",
    right: "wizard-idle-right",
    down: "wizard-idle-down",
  };
  private wizardWalkAnim: Record<Facing, string> = {
    left: "wizard-walk-left",
    up: "wizard-walk-up",
    right: "wizard-walk-right",
    down: "wizard-walk-down",
  };
  private wizardWandRaisingAnim: Record<Facing, string> = {
    left: "wizard-attack-left",
    up: "wizard-attack-up",
    right: "wizard-attack-right",
    down: "wizard-attack-down",
  };
  private attackInterval: any = null;
  private wizardMoveRef: KEventController | null = null;
  private skullBoneAttackColliders: string[] = [
    "wall",
    "player",
    "swordHitBox",
    "shieldHitBox",
  ];

  constructor(k: KAPLAYCtx, map: GameObj, pos: Vec2) {
    this.k = k;
    this.map = map;
    this.wizard = k.add([
      k.pos(pos.x, pos.y),
      k.sprite("assets", {
        anim: "wizard-idle-down",
      }),
      k.body(),
      k.health(8),
      k.opacity(),
      k.area({
        shape: new k.Rect(k.vec2(0, 6), 16, 16),
      }),
      k.state("idle", [
        "idle",
        "right",
        "left",
        "up",
        "down",
        "attack",
        "evade",
        "backtrack",
      ]),
      k.scale(1.2),
      {
        direction: "down",
        isAttacking: false,
        isWalking: false,
        isPlayerInSight: false,
        speed: 30,
        currentSound: null,
      },
      "wizard",
    ]);

    onAttacked(k, this.wizard);

    this.wizard.onDestroy(() => {
      this.wizardMoveRef?.cancel();
      clearInterval(this.attackInterval);
      k.go("village");
      k.debug.log("hurray! you won");
    });
  }

  public setWizardAi(player: GameObj | null) {
    const k = this.k;
    const wizard = this.wizard;
    if (!k || !player) return;

    this.wizardMoveRef = k.onUpdate(() => {
        const wizardDirection = this.wizard.direction as Facing;
      switch (wizard.state) {
        case "left":
          wizard.move(-wizard.speed, 0);
          playAnimIfNotPlaying(wizard, this.wizardWalkAnim[wizardDirection]);
          break;
        case "right":
          wizard.move(wizard.speed, 0);
          playAnimIfNotPlaying(wizard, this.wizardWalkAnim[wizardDirection]);
          break;
        case "up":
          wizard.move(0, -wizard.speed);
          playAnimIfNotPlaying(wizard, this.wizardWalkAnim[wizardDirection]);
          break;
        case "down":
          wizard.move(0, wizard.speed);
          playAnimIfNotPlaying(wizard, this.wizardWalkAnim[wizardDirection]);
          break;
      }
    });
    const updateRef = k.onUpdate(() => {
      if (player.pos.dist(wizard.pos) < 50) {
        this.removeWizardsCurrentSound();
        wizard.currentSound = k.play("enemyMove2", {
          loop: true,
          volume: 0.8,
        });
        wizard.enterState("up");
        updateRef.cancel();
        wizard.isPlayerInSight = true;
      }
    });

    k.loop(5, () => {
      wizard.prevPos = wizard.pos;
    });

    const idleRef = wizard.onStateEnter("idle", async () => {
      wizard.isWalking = false;
      playAnimIfNotPlaying(wizard, "wizard-idle-" + wizard.direction);
      this.noticePlayer(player);
      await k.wait(2);
      if (wizard.isPlayerInSight) {
        wizard.enterState(
         (wizard.pos.x < player.pos.x ? "right" : "left")
        );
      }
    });

    const attackRef = wizard.onStateEnter("attack", async () => {
      wizard.isWalking = false;
      wizard.isAttacking = true;
      const attackSpeed = 2000;
      this.removeWizardsCurrentSound();
      wizard.currentSound = k.play("spell", {
        volume: 0.8,
        loop: true,
      });
      this.attackPlayer(player, attackSpeed);
      await k.wait(6);
      this.stopWizardAttack();
      wizard.enterState("idle");
    });

    const downRef = wizard.onStateEnter("down", async () => {
      this.performMotionAndEnterAttackState();
    });

    const leftRef = wizard.onStateEnter("left", async () => {
      this.performMotionAndEnterAttackState();
    });

    const upRef = wizard.onStateEnter("up", async () => {
      this.performMotionAndEnterAttackState();
    });

    const rightRef = wizard.onStateEnter("right", async () => {
        this.performMotionAndEnterAttackState();
    });

    const evadeRef = wizard.onStateEnter("evade", async () => {
      wizard.isAttacking = false;
      await k.tween(
        wizard.pos,
        wizard.prevPos,
        0.8,
        (val) => {
          wizard.pos = val;
        },
        k.easings.linear,
      );

      wizard.enterState("attack");
    });

    const backtrackRef = wizard.onStateEnter("backtrack", async () => {
      wizard.isWalking = true;
      wizard.direction = "up";
      // k.play("enemyMove2", {
      //   loop: true,
      //   volume: 0.8
      // });
      this.performMotionAndEnterAttackState();
    });

    k.onSceneLeave(() => {
      this.stopWizardAttack();
      idleRef.cancel();
      updateRef.cancel();
      attackRef.cancel();
      downRef.cancel();
      leftRef.cancel();
      rightRef.cancel();
      upRef.cancel();
      evadeRef.cancel();
      backtrackRef.cancel();
    });
  }

  public async noticePlayer(player: GameObj | null) {
    const wizard = this.wizard;
    if (!player || !wizard) return;
    const angle = wizard.pos.angle(player.pos);
    const facingDirection = this.angleToFacing(angle);

    wizard.direction = facingDirection;

    if (wizard.isWalking) return;
    const anim = this.wizardIdleAnim[facingDirection];
    if (!wizard.isAttacking) {
      playAnimIfNotPlaying(wizard, anim);
    }
  }

  public angleToFacing(angle: number): Facing {
    if (angle > 50 && angle <= 125) return "up";
    if (angle < -50 && angle >= -125) return "down";
    if (Math.abs(angle) > 125) return "left";
    return "right";
  }

  public async attackPlayer(player: GameObj | null, attackInterval: number) {
    if (!player) return;
    this.wizard.isAttacking = true;
    this.attackInterval = setInterval(async () => {
      await this.prepareWizardBeforeFiringAttack();
      Math.random() < 0.5
        ? this.createSkullAttack(player)
        : this.createBoneAttack(player);
    }, attackInterval);
  }

  public createSkullAttack(player: GameObj | null) {
    const k = this.k;
    if (!k || !player) return;
    const direction = player.pos.sub(this.wizard.pos).unit();

    const skullAttack = k.add([
      k.pos(this.wizard.pos.x, this.wizard.pos.y),
      k.sprite("assets", {
        anim: "skull-attack",
      }),
      k.body(),
      "skull-attack",
      k.scale(1.2),
      k.move(direction, 100),
      k.area({
        shape: new k.Rect(k.vec2(0, 6), 8, 8),
      }),
      {
        attackPower: 0.5,
        prevPos: k.vec2(0, 0),
      },
    ]);
    this.skullBoneAttackColliders.forEach((collider) => {
      skullAttack.onCollide(collider, () => {
        this.destroyAttack(skullAttack);
        if (collider !== "player") {
          k.play("destroyed");
        }
      });
    });
  }

  public destroyAttack(attack: GameObj) {
    if (!this.k) return;
    this.k.destroy(attack);
  }

  public createBoneAttack(player: GameObj | null) {
    const k = this.k;
    if (!k || !player) return;
    const direction = player.pos.sub(this.wizard.pos).unit();

    const boneAttack = k.add([
      k.pos(this.wizard.pos.x, this.wizard.pos.y),
      k.sprite("assets", {
        anim: "bone-attack",
      }),
      k.body(),
      "bone-attack",
      k.scale(1.2),
      k.move(direction, 100),
      k.area({
        shape: new k.Rect(k.vec2(0, 6), 16, 16),
      }),
      {
        attackPower: 0.5,
      },
    ]);
    this.skullBoneAttackColliders.forEach((collider) => {
      boneAttack.onCollide(collider, () => {
        this.destroyAttack(boneAttack);
      });
    });
  }

  public async prepareWizardBeforeFiringAttack() {
    const k = this.k;
    if (!k) return;

    this.wizard.currentSound?.stop();
    this.wizard.currentSound = null;
    const wizardDirection = this.wizard.direction as Facing;
    const anim = this.wizardWalkAnim[wizardDirection];
    playAnimIfNotPlaying(this.wizard, anim);
    await k.wait(0.3);
    const anim2 = this.wizardWandRaisingAnim[wizardDirection];
    playAnimIfNotPlaying(this.wizard, anim2);
    await k.wait(0.2);
    this.wizard.play(this.wizardIdleAnim[wizardDirection]);
    this.wizard.currentSound?.play();
  }

  public stopWizardAttack() {
    this.wizard.isAttacking = false;
    this.wizard.currentSound?.stop();
    this.wizard.currentSound = null;
    clearInterval(this.attackInterval);
  }

  public async onWizardDestroyed() {
    const k = this.k;
    if (!k) return;
    k.onDestroy("wizard", () => {
      clearInterval(this.attackInterval);
    });
    this.wizard.currentSound?.stop();
    this.wizard.currentSound = null;
    this.wizard.currentSound = k.play("defeated", {
      volume: 0.8,
    });
    await k.wait(1);
    this.wizard.destroy();
  }

  public async performMotionAndEnterAttackState() {
    const k = this.k;
    if (!k) return;
    this.wizard.isWalking = true;
    await k.wait(3);
    this.wizard.isWalking = false;
    this.wizard.enterState("attack");
  }

  public removeWizardsCurrentSound() {
    this.wizard.currentSound?.stop();
    this.wizard.currentSound = null;
  }
}
