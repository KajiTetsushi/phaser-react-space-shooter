import type { Physics } from 'phaser';

import type InputComponent from '../input/InputComponent';

type MovementComponentConfig = {
    velocity: number;
    maxVelocity?: number;
    drag?: number;
};

export default class HorizontalMovementComponent {
    #body: Physics.Arcade.Body;
    #inputComponent: InputComponent;
    #config: MovementComponentConfig;

    constructor(body: Physics.Arcade.Body, inputComponent: InputComponent, config: MovementComponentConfig) {
        this.#body = body;
        this.#inputComponent = inputComponent;
        this.#config = config;

        const { drag, maxVelocity, velocity } = this.#config;

        this.#body.setMaxVelocityX(maxVelocity ?? velocity);

        if (typeof drag !== 'number') {
            return;
        }

        this.#body.setDragX(drag);
        this.#body.setDamping(true);
    }

    reset() {
        this.#body.setVelocityX(0);
        this.#body.setAccelerationX(0);
    }

    update() {
        if (this.#inputComponent.leftIsDown) {
            this.pushLeft();
        } else if (this.#inputComponent.rightIsDown) {
            this.pushRight();
        } else {
            this.stopPush();
        }
    }

    private pushLeft() {
        const { velocity, maxVelocity } = this.#config;
        if (typeof maxVelocity === 'number') {
            this.#body.setVelocityX(this.#body.velocity.x - velocity);
        } else {
            this.#body.setVelocityX(velocity * -1);
        }
    }

    private pushRight() {
        const { velocity, maxVelocity } = this.#config;
        if (typeof maxVelocity === 'number') {
            this.#body.setVelocityX(this.#body.velocity.x + velocity);
        } else {
            this.#body.setVelocityX(velocity * +1);
        }
    }

    private stopPush() {
        if (typeof this.#config.maxVelocity === 'number') {
            this.#body.setAccelerationX(0);
        } else {
            this.#body.setVelocityX(0);
        }
    }
}
