import type { Physics } from 'phaser';

import type InputComponent from '../input/InputComponent';

interface MovementComponentConfigInertialess {
    /**
     * Fixed value of how fast the object will move in the given direction.
     */
    velocity: number;
}

interface MovementComponentConfigPhysical {
    /**
     * A value to increase, per frame, of how fast the object will move in the given direction.
     */
    velocityIncrement?: number;
    /**
     * An upper limit value to how fast the object can increase to in the given direction.
     */
    velocityMaximum?: number;
    /**
     * A value to set the amount of directional slow down in pixels per second when the directional control is released.
     */
    drag?: number;
}

type MovementComponentConfig = MovementComponentConfigInertialess | MovementComponentConfigPhysical;

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
