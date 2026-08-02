import { type GameObjects, Physics } from 'phaser';

import assert from '../../utils/assert';
import type InputComponent from '../input/InputComponent';

export default class VerticalMovementComponent {
    #gameObject: GameObjects.GameObject;
    #inputComponent: InputComponent;
    #velocity: number;
    #maxVelocity: number;
    #drag: number;

    constructor(
        gameObject: GameObjects.GameObject,
        inputComponent: InputComponent,
        velocity: number,
        maxVelocity: number,
        drag: number,
    ) {
        this.#gameObject = gameObject;
        this.#inputComponent = inputComponent;
        this.#velocity = velocity;
        this.#maxVelocity = maxVelocity;
        this.#drag = drag;

        const { body } = this.#gameObject;
        assert(body instanceof Physics.Arcade.Body, 'body is not Physics.Arcade.Body type');

        body.setDamping(true);
        body.setDrag(this.#drag);
        body.setMaxVelocity(this.#maxVelocity);
    }

    reset() {
        const { body } = this.#gameObject;
        assert(body instanceof Physics.Arcade.Body, 'body is not Physics.Arcade.Body type');

        body.setVelocity(0, 0);
        body.setAngularAcceleration(0);
    }

    update() {
        const { body } = this.#gameObject;
        assert(body instanceof Physics.Arcade.Body, 'body is not Physics.Arcade.Body type');

        if (this.#inputComponent.upIsDown) {
            body.velocity.y -= this.#velocity;
        } else if (this.#inputComponent.downIsDown) {
            body.velocity.y += this.#velocity;
        } else {
            body.setAngularAcceleration(0);
        }
    }
}
