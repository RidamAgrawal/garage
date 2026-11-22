import { PLAYER_CONFIG } from "@/config/BalanceConfig";
import { EventBus } from "@/events/EventBus";
import { EventKeys } from "@/constants/EventKeys";

export interface IRunState {
  stage: number;
  score: number;
  gold: number;
  hp: number;
  maxHp: number;
  hasShield: boolean;
}

/**
 * RunStateManager tracks arcade run state across scenes (stage, score, gold, hp).
 * Named RunStateManager to prevent collision with FSM's RunState (locomotion state).
 */
export class RunStateManager implements IRunState {
  public stage: number = 1;
  public score: number = 0;
  public gold: number = 0;
  public hp: number = PLAYER_CONFIG.maxHp;
  public maxHp: number = PLAYER_CONFIG.maxHp;
  public hasShield: boolean = false;

  public reset(initialMaxHp: number = PLAYER_CONFIG.maxHp): void {
    this.stage = 1;
    this.score = 0;
    this.gold = 0;
    this.hp = initialMaxHp;
    this.maxHp = initialMaxHp;
    this.hasShield = false;
  }

  public addGold(amount: number): void {
    this.gold += amount;
    EventBus.emit(EventKeys.GOLD_CHANGED, this.gold);
  }

  public addScore(points: number): void {
    this.score += points;
    EventBus.emit(EventKeys.SCORE_CHANGED, this.score);
  }
}

export const runState = new RunStateManager();
export const RunState = runState;
