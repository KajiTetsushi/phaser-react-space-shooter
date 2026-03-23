import type { GameObjects } from 'phaser';
import InputComponent from '../InputComponent';

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
        const xDirection = Math.random() < 0.5 ? 'left' : 'right';
        this[xDirection] = true;
    }

    update() {
        if (this.#gameObject.x < this.#startX - this.#maxXDrift) {
            this.left = false;
            this.right = true;
        } else if (this.#gameObject.x > this.#startX + this.#maxXDrift) {
            this.left = true;
            this.right = false;
        }
    }
}
