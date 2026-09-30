import Phaser from 'phaser';

/**
 * PlayerController handles input for the player.
 * Hindi: Encapsulation ka use karte hue input logic ko ek alag class mein rakha gaya hai.
 */
export class PlayerController {
    private scene: Phaser.Scene;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd: any;
    private attackKey: Phaser.Input.Keyboard.Key;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        if (!this.scene.input.keyboard) {
            throw new Error('Keyboard input is not enabled');
        }
        
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        
        this.wasd = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        this.attackKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    /**
     * Get the movement direction based on held keys.
     */
    getMovementDirection(): { x: number, y: number } {
        let dirX = 0;
        let dirY = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            dirX = -1;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            dirX = 1;
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            dirY = -1;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            dirY = 1;
        }

        return { x: dirX, y: dirY };
    }

    /**
     * Check if attack was just pressed.
     */
    isAttackPressed(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.attackKey);
    }

    /**
     * Cleanup resources.
     */
    destroy(): void {
        this.scene.input.keyboard?.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // ... remove other keys if needed
    }
}
