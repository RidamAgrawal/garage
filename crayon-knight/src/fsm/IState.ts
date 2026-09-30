/**
 * IState Interface — State Machine ka har state yeh follow karega
 * 
 * State Machine pattern: Complex behavior ko states mein tod do
 * Jaise player ke states: Idle → Run → Attack → Hurt → Dead
 * Har state mein alag logic hota hai
 */
export interface IState {
  /** Called when entering this state */
  enter?(): void;
  /** Called every frame while in this state */
  update?(time: number, delta: number): void;
  /** Called when leaving this state */
  exit?(): void;
}
