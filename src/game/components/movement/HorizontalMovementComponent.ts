import { type GameObjects, Physics } from 'phaser';

import type InputComponent from '../input/InputComponent';

export default class HorizontalMovementComponent {
    #gameObject: GameObjects.GameObject;
    #inputComponent: InputComponent;
    #velocity: number;

    constructor(gameObject: GameObjects.GameObject, inputComponent: InputComponent, velocity: number) {
        this.#gameObject = gameObject;
        this.#inputComponent = inputComponent;
        this.#velocity = velocity;

        if (this.#gameObject.body instanceof Physics.Arcade.Body) {
            this.#gameObject.body.setDamping(true);
            this.#gameObject.body.setDrag(0.01);
            this.#gameObject.body.setMaxVelocity(200, 200);
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
                this.#gameObject.body.velocity.x -= 20;
            } else if (this.#inputComponent.rightIsDown) {
                this.#gameObject.body.velocity.x += 20;
            } else {
                this.#gameObject.body.setAngularAcceleration(0);
            }
        }
    }
}
