import { Events } from 'phaser';

export const CUSTOM_EVENTS = Object.freeze({
    ENEMY_INIT: 'enemy_init',
    ENEMY_DESTROYED: 'enemy_destroyed',
    PLAYER_SPAWN: 'player_spawn',
    PLAYER_DESTROYED: 'player_destroyed',
    GAME_OVER: 'game_over',
});

/**
 * Uses the native Phaser 3 EventEmitter class to allow communication
 * between the various components in our game.
 *
 * For example, this event bus can be used for notifying the UI when
 * an enemy is destroyed so we can update the score in our game.
 */
export default class EventBusComponent extends Events.EventEmitter {}
