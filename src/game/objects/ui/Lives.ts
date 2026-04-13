import { GameObjects, type Scene } from 'phaser';
import type EventBusComponent from '../../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../../components/events/EventBusComponent';
import { PLAYER_CONFIG } from '../../config';

export default class Lives extends GameObjects.Container {
    #current: number;
    #eventBusComponent: EventBusComponent;

    constructor(scene: Scene, eventBusComponent: EventBusComponent) {
        super(scene, 5, scene.scale.height - 30, []);
        this.#eventBusComponent = eventBusComponent;
        this.scene.add.existing(this);
        this.#current = PLAYER_CONFIG.LIVES;

        for (let i = 0; i < this.#current; i++) {
            const lifeIcon = this.scene.add
                .image(i * 20, 0, 'ship')
                .setScale(0.5)
                .setOrigin(0, 0);
            this.add(lifeIcon);
        }

        this.#eventBusComponent.on(CUSTOM_EVENTS.PLAYER_DESTROYED, () => {
            this.#loseALife();

            if (this.hasLivesLeft) {
                this.#respawnPlayer();
                return;
            }

            this.#gameOver();
        });

        this.#eventBusComponent.emit(CUSTOM_EVENTS.PLAYER_SPAWN);
    }

    get hasLivesLeft() {
        return this.#current > 0;
    }

    #loseALife() {
        this.#current--;
        this.getAt(this.#current).destroy();
    }

    async #respawnPlayer() {
        await this.utils.delayedCallAsync(PLAYER_CONFIG.RESPAWN_DELAY);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.PLAYER_SPAWN);
    }

    #gameOver() {
        this.scene.add
            .text(this.scene.scale.width / 2, this.scene.scale.height / 2, 'GAME OVER', {
                fontSize: '24px',
            })
            .setOrigin(0.5);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.GAME_OVER);
    }

    updateDisplay() {
        this.removeAll(true);
        for (let i = 0; i < this.#current; i++) {
            const lifeIcon = this.scene.add.sprite(i * 30, 0, 'player').setScale(0.5);
            this.add(lifeIcon);
        }
    }

    private utils = Object.freeze({
        delayedCallAsync: (delay: number) => {
            return new Promise<void>((resolve) => {
                this.scene.time.delayedCall(delay, () => {
                    resolve();
                });
            });
        },
    });
}
