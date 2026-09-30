import Phaser from "phaser";

// /**
//  * EventBus - Central communication hub (Singleton pattern)
//  * Yeh global event system hai — scenes aur entities ke beech
//  * bina direct reference ke communicate karne ke liye.
//  */
export const EventBus = new Phaser.Events.EventEmitter();
