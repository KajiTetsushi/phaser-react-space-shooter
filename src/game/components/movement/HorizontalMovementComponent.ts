import type { Physics } from 'phaser';

import type InputComponent from '../input/InputComponent';
import type { MovementComponentConfig } from './movement.types';

const DIRECTION = {
    LEFT: -1,
    RIGHT: +1,
} as const;

export default class HorizontalMovementComponent {
    #body: Physics.Arcade.Body;
    #inputComponent: InputComponent;
    #config: MovementComponentConfig;

    constructor(body: Physics.Arcade.Body, inputComponent: InputComponent, config: MovementComponentConfig) {
        this.#body = body;
        this.#inputComponent = inputComponent;
        this.#config = config;
    }

    reset() {
        this.#body.setVelocityX(0);
        this.#body.setAccelerationX(0);
    }

    update() {
        this.updateMovementType();
        if (this.#inputComponent.leftIsDown) {
            this.pushLeft();
        } else if (this.#inputComponent.rightIsDown) {
            this.pushRight();
        } else {
            this.stopPush();
        }
    }

    private updateMovementType() {
        if ('velocity' in this.#config) {
            return;
        }

        const { velocityMaximum = 0, drag = 0 } = this.#config;

        this.#body.setMaxVelocityX(velocityMaximum);
        this.#body.setDragX(drag);
        this.#body.setDamping(!!drag);
    }

    private pushLeft() {
        if ('velocity' in this.#config) {
            const { velocity } = this.#config;
            this.#body.setVelocityX(velocity * DIRECTION.LEFT);
        } else {
            const { velocityIncrement = 0 } = this.#config;
            this.#body.setVelocityX(this.#body.velocity.x + velocityIncrement * DIRECTION.LEFT);
        }
    }

    private pushRight() {
        if ('velocity' in this.#config) {
            const { velocity } = this.#config;
            this.#body.setVelocityX(velocity * DIRECTION.RIGHT);
        } else {
            const { velocityIncrement = 0 } = this.#config;
            this.#body.setVelocityX(this.#body.velocity.x + velocityIncrement * DIRECTION.RIGHT);
        }
    }

    private stopPush() {
        if ('velocity' in this.#config) {
            this.#body.setVelocityX(0);
        } else {
            this.#body.setAccelerationX(0);
        }
    }
}
