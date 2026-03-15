import { EventEmitter } from 'eventemitter3';

// Used to emit events between components, HTML and Phaser scenes
export const EventBus = new EventEmitter();
