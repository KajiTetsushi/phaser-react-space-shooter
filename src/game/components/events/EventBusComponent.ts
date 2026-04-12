import { Events } from 'phaser';

export const CUSTOM_EVENTS = Object.freeze({
    ENEMY_INIT: 'enemy_init',
    ENEMY_DESTROYED: 'enemy_destroyed',
});

export default class EventBusComponent extends Events.EventEmitter {}
