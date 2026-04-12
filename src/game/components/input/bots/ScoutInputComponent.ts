import type { GameObjects } from 'phaser';
import InputComponent from '../InputComponent';

/**
 * Scout bot AI input: downwards sideways zigzag flight pattern
 */
export default class ScoutInputComponent extends InputComponent {
    #gameObject: GameObjects.Container;
    #startX: number;
    #maxXDrift: number;

    constructor(gameObject: GameObjects.Container, startX: number, maxXDrift: number) {
        super();

        this.#gameObject = gameObject;
        this.#startX = startX;
        this.#maxXDrift = Math.abs(maxXDrift);

        this.down = true;
        this.#setXDirection(Math.random() < 0.5 ? 'left' : 'right');
    }

    setStartX(startX: number) {
        this.#startX = startX;
    }

    update() {
        if (this.#gameObject.x < this.#startX - this.#maxXDrift) {
            this.#setXDirection('right');
        } else if (this.#gameObject.x > this.#startX + this.#maxXDrift) {
            this.#setXDirection('left');
        }
    }

    #setXDirection(direction: 'left' | 'right') {
        this.left = direction === 'left';
        this.right = direction === 'right';
    }
}
