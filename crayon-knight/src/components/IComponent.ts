/**
 * IComponent Interface — Har component ko yeh contract follow karna padega
 * (This is the 'Interface' OOP concept — defines a contract)
 * 
 * Composition pattern: Instead of deep inheritance chains,
 * we attach small reusable components to entities
 */
export interface IComponent {
  /** Called once when component is added to an entity */
  init(entity: any): void;
  /** Called every frame */
  update(time: number, delta: number): void;
  /** Called when entity is destroyed — cleanup listeners etc */
  destroy?(): void;
}
