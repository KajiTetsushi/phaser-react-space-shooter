import { type GameObjects, Math as MathUtils } from 'phaser';
import type { GameObjectPosition, GetGameObjectPosition } from '../../../objects/types';
import InputComponent from '../InputComponent';

/**
 * Gunship bot AI input: sideways flight pattern
 */
export default class GunshipInputComponent extends InputComponent {
    #gameObject: GameObjects.Container;
    #getPlayerPosition: GetGameObjectPosition;
    #fireInterval: number = 0;

    constructor(gameObject: GameObjects.Container, getPlayerPosition: GetGameObjectPosition) {
        super();

        this.#gameObject = gameObject;
        this.#getPlayerPosition = getPlayerPosition;

        // this.#setXDirection(Math.random() < 0.5 ? 'left' : 'right');
    }

    update(delta: number) {
        const playerPosition = this.#getPlayerPosition();

        // Follow the master input component's horizontal movement pattern.
        if (playerPosition.x < this.#gameObject.x) {
            this.#setXDirection('left');
        } else if (playerPosition.x > this.#gameObject.x) {
            this.#setXDirection('right');
        }

        this.#fireRandomly(delta);

        // TODO: Randomize the gunship's horizontal movement pattern by adding some random chance to change direction every update cycle.
    }

    #setXDirection(direction: 'left' | 'right') {
        this.left = direction === 'left';
        this.right = direction === 'right';
    }

    #fireRandomly(delta: number) {
        this.#fireInterval -= delta;

        if (this.#fireInterval > 0) {
            this.shoot = false;
            return;
        }

        this.shoot = true;

        const gunshipPosition = this.#getObjectPosition();
        const playerPosition = this.#getPlayerPosition();

        const fireIntervalRange: [number, number] =
            Math.abs(playerPosition.x - gunshipPosition.x) <= 150 ? [50, 1000] : [500, 3000];
        this.#fireInterval = MathUtils.RND.integerInRange(...fireIntervalRange);
    }

    #getObjectPosition(): GameObjectPosition {
        return {
            x: this.#gameObject.x,
            y: this.#gameObject.y,
        };
    }
}
