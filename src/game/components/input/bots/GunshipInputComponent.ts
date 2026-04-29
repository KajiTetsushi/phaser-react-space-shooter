import type { GameObjects } from 'phaser';
import type { GetGameObjectPosition } from '../../../objects/types';
import InputComponent from '../InputComponent';

/**
 * Gunship bot AI input: sideways flight pattern
 */
export default class GunshipInputComponent extends InputComponent {
    #gameObject: GameObjects.Container;
    #getPlayerPosition: GetGameObjectPosition;

    constructor(gameObject: GameObjects.Container, getPlayerPosition: GetGameObjectPosition) {
        super();

        this.#gameObject = gameObject;
        this.#getPlayerPosition = getPlayerPosition;

        this.shoot = true;
        // this.#setXDirection(Math.random() < 0.5 ? 'left' : 'right');
    }

    update() {
        const playerPosition = this.#getPlayerPosition();

        // Follow the master input component's horizontal movement pattern.
        if (playerPosition.x < this.#gameObject.x) {
            this.#setXDirection('left');
        } else if (playerPosition.x > this.#gameObject.x) {
            this.#setXDirection('right');
        }

        // TODO: Randomize the gunship's horizontal movement pattern by adding some random chance to change direction every update cycle.
    }

    #setXDirection(direction: 'left' | 'right') {
        this.left = direction === 'left';
        this.right = direction === 'right';
    }
}
