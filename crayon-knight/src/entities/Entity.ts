import Phaser from 'phaser';
import { IComponent } from '@/components/IComponent';

/**
 * Entity Base Class
 * 
 * Hum inheritance ki jagah composition use kar rahe hain,
 * kyunki ek game character bohot alag-alag behaviors (components) combine karta hai.
 * Inheritance se "deadly diamond of death" ya deep class trees ban jaate hain.
 * Har component apne andar specific logic rakhta hai, keeping it modular.
 */
export class Entity extends Phaser.Physics.Arcade.Sprite {
    /**
     * Components ko store karne ke liye ek Map.
     * Map string names ko actual component instance se map karta hai (O(1) lookup).
     */
    private components: Map<string, IComponent> = new Map();

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    /**
     * Component add karta hai.
     * Builder pattern style mein 'this' return karta hai chaining ke liye.
     */
    public addComponent(name: string, component: IComponent): this {
        component.init(this);
        this.components.set(name, component);
        return this;
    }

    /**
     * Generics (T extends IComponent) ka fayda yeh hai ki
     * caller ko type-casting nahi karni padti.
     * Yeh seedha correct type return karta hai.
     */
    public getComponent<T extends IComponent>(name: string): T | undefined {
        return this.components.get(name) as T | undefined;
    }

    public hasComponent(name: string): boolean {
        return this.components.has(name);
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);
        
        for (const component of this.components.values()) {
            component.update(time, delta);
        }
    }

    public destroy(fromScene?: boolean): void {
        for (const component of this.components.values()) {
            if (component.destroy) {
                component.destroy();
            }
        }
        this.components.clear();
        super.destroy(fromScene);
    }
}
