import type { Scene } from 'phaser';
import type EventBusComponent from '../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../components/events/EventBusComponent';

export default class AudioManager {
    #scene: Scene;
    #eventBusComponent: EventBusComponent;

    constructor(scene: Scene, eventBusComponent: EventBusComponent) {
        this.#scene = scene;
        this.#scene.sound.play('bg', { volume: 0.025, loop: true });

        this.#eventBusComponent = eventBusComponent;
        this.#eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, () => {
            this.#scene.sound.play('explosion', { volume: 0.05 });
        });
        this.#eventBusComponent.on(CUSTOM_EVENTS.PLAYER_DESTROYED, () => {
            this.#scene.sound.play('explosion', { volume: 0.05 });
        });
        this.#eventBusComponent.on(CUSTOM_EVENTS.SHIP_HIT, () => {
            this.#scene.sound.play('hit', { volume: 0.025 });
        });
        this.#eventBusComponent.on(CUSTOM_EVENTS.SHIP_SHOOT, (weaponReport: string) => {
            this.#scene.sound.play(weaponReport, { volume: 0.0125 });
        });
    }
}
