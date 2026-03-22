import { type GameObjects, Physics } from 'phaser';

import type InputComponent from '../input/InputComponent';

export default class HorizontalMovementComponent {
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

        if (this.#gameObject.body instanceof Physics.Arcade.Body) {
            this.#gameObject.body.setDamping(true);
            this.#gameObject.body.setDrag(this.#drag);
            this.#gameObject.body.setMaxVelocity(this.#maxVelocity);
        }
    }

    reset() {
        if (this.#gameObject.body instanceof Physics.Arcade.Body) {
            this.#gameObject.body.setVelocity(0, 0);
            this.#gameObject.body.setAngularAcceleration(0);
        }
    }

    update() {
        if (this.#gameObject.body instanceof Physics.Arcade.Body) {
            if (this.#inputComponent.leftIsDown) {
                this.#gameObject.body.velocity.x -= this.#velocity;
            } else if (this.#inputComponent.rightIsDown) {
                this.#gameObject.body.velocity.x += this.#velocity;
            } else {
                this.#gameObject.body.setAngularAcceleration(0);
            }
        }
    }
}
