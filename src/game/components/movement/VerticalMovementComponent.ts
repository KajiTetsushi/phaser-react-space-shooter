import type { Physics } from 'phaser';

import type InputComponent from '../input/InputComponent';
import type { MovementComponentConfig } from './movement.types';

const DIRECTION = {
    UP: -1,
    DOWN: +1,
} as const;

export default class VerticalMovementComponent {
    #body: Physics.Arcade.Body;
    #inputComponent: InputComponent;
    #config: MovementComponentConfig;

    constructor(body: Physics.Arcade.Body, inputComponent: InputComponent, config: MovementComponentConfig) {
        this.#body = body;
        this.#inputComponent = inputComponent;
        this.#config = config;
    }

    reset() {
        this.#body.setVelocityY(0);
        this.#body.setAccelerationY(0);
    }

    update() {
        this.updateMovementType();
        if (this.#inputComponent.upIsDown) {
            this.pushUp();
        } else if (this.#inputComponent.downIsDown) {
            this.pushDown();
        } else {
            this.stopPush();
        }
    }

    private updateMovementType() {
        if ('velocity' in this.#config) {
            return;
        }

        const { velocityMaximum = 0, drag = 0 } = this.#config;

        this.#body.setMaxVelocityY(velocityMaximum);
        this.#body.setDragY(drag);
        this.#body.setDamping(!!drag);
    }

    private pushUp() {
        if ('velocity' in this.#config) {
            const { velocity } = this.#config;
            this.#body.setVelocityY(velocity * DIRECTION.UP);
        } else {
            const { velocityIncrement = 0 } = this.#config;
            this.#body.setVelocityY(this.#body.velocity.y + velocityIncrement * DIRECTION.UP);
        }
    }

    private pushDown() {
        if ('velocity' in this.#config) {
            const { velocity } = this.#config;
            this.#body.setVelocityY(velocity * DIRECTION.DOWN);
        } else {
            const { velocityIncrement = 0 } = this.#config;
            this.#body.setVelocityY(this.#body.velocity.y + velocityIncrement * DIRECTION.DOWN);
        }
    }

    private stopPush() {
        if ('velocity' in this.#config) {
            this.#body.setVelocityY(0);
        } else {
            this.#body.setAccelerationY(0);
        }
    }
}
