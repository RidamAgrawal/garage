import { IState } from '@/fsm/IState';

/**
 * State Machine (FSM)
 * 
 * Hindi: State machine spaghetti if-else code ko rokne mein madad karti hai.
 * Jaise traffic lights: Red -> Green -> Yellow -> Red.
 * Har state independent hoti hai aur pata hota hai ki next kahan jana hai.
 * Guard ka matlab hai condition check - jaise current state se wapas ussi state mein
 * ya jab ek transition already chal rahi ho toh wapas na jaaye.
 */
export class StateMachine {
    private states: Map<string, IState> = new Map();
    private currentState: IState | undefined;
    private currentStateKey: string = '';
    private isTransitioning: boolean = false;

    public addState(name: string, state: IState): this {
        this.states.set(name, state);
        return this;
    }

    public transition(name: string): void {
        if (this.currentStateKey === name || this.isTransitioning) {
            return;
        }

        const newState = this.states.get(name);
        if (!newState) {
            console.warn(`State '${name}' not found.`);
            return;
        }

        this.isTransitioning = true;

        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }

        this.currentStateKey = name;
        this.currentState = newState;

        if (this.currentState.enter) {
            this.currentState.enter();
        }

        this.isTransitioning = false;
    }

    public update(time: number, delta: number): void {
        if (this.currentState && this.currentState.update) {
            this.currentState.update(time, delta);
        }
    }

    public getCurrentStateKey(): string {
        return this.currentStateKey;
    }

    public isInState(name: string): boolean {
        return this.currentStateKey === name;
    }
}
