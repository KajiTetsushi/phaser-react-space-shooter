import { Events } from 'phaser';

export const CUSTOM_EVENTS = Object.freeze({
    ENEMY_INIT: 'enemy_init',
    ENEMY_DESTROYED: 'enemy_destroyed',
    PLAYER_HIT: 'player_hit',
    PLAYER_DESTROYED: 'player_destroyed',
});

export default class EventBusComponent extends Events.EventEmitter {}
