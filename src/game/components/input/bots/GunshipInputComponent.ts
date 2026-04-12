import type { GameObjects } from 'phaser';
import InputComponent from '../InputComponent';

/**
 * Gunship bot AI input: sideways flight pattern
 */
export default class GunshipInputComponent extends InputComponent {
    #gameObject: GameObjects.Container;
    #startY: number;
    #maxXDrift: number;
    #playerPositionCallback: () => { x: number; y: number };

    constructor(
        gameObject: GameObjects.Container,
        startY: number,
        maxXDrift: number,
        playerPositionCallback: () => { x: number; y: number },
    ) {
        super();

        this.#gameObject = gameObject;
        this.#startY = startY;
        this.#maxXDrift = Math.abs(maxXDrift);
        this.#playerPositionCallback = playerPositionCallback;

        this.down = true;
        this.shoot = true;
        // this.#setXDirection(Math.random() < 0.5 ? 'left' : 'right');
    }

    setStartY(startY: number) {
        this.#startY = startY;
    }

    update() {
        const playerPosition = this.#playerPositionCallback();

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
