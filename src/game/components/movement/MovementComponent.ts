import { Math as PhaserMath, type Physics } from 'phaser';

import type InputComponent from '../input/InputComponent';
import type { MovementComponentConfig } from './movement.types';

export default class MovementComponent {
    #body: Physics.Arcade.Body;
    #inputComponent: InputComponent;
    #currentDirection: PhaserMath.Vector2 = new PhaserMath.Vector2(0, 0);
    #config: MovementComponentConfig | null = null;

    constructor(body: Physics.Arcade.Body, inputComponent: InputComponent, config?: MovementComponentConfig) {
        this.#body = body;
        this.#inputComponent = inputComponent;
        this.#config = config ?? null;
    }

    reset() {
        stopMoving(this.#body);
    }

    update(_time: number, _delta: number) {
        updateMovementType(this.#body, this.#config);
        updateDirectionCoefficients(this.#inputComponent, this.#currentDirection);
        move(this.#body, this.#config, this.#currentDirection);
    }
}

const updateMovementType = (body: Physics.Arcade.Body, config: MovementComponentConfig | null) => {
    if (!config?.accelerates) {
        return;
    }

    const { velocityMaximum = 0, drag = 0 } = config;

    body.setMaxVelocity(velocityMaximum);
    body.setDrag(drag);
    body.setDamping(!!drag);
};

const updateDirectionCoefficients = (inputComponent: InputComponent, outVector: PhaserMath.Vector2) => {
    outVector.set(0, 0);

    if (inputComponent.left) outVector.x = -1;
    if (inputComponent.right) outVector.x = 1;
    if (inputComponent.up) outVector.y = -1;
    if (inputComponent.down) outVector.y = 1;

    outVector.normalize();
};

const move = (body: Physics.Arcade.Body, config: MovementComponentConfig | null, direction: PhaserMath.Vector2) => {
    if (!config) {
        return;
    }

    if (!config.accelerates) {
        const { velocity = 0 } = config;
        body.setVelocity(direction.x * velocity, direction.y * velocity);
    } else {
        const { velocityIncrement = 0 } = config;
        body.velocity.x += direction.x * velocityIncrement;
        body.velocity.y += direction.y * velocityIncrement;
    }
};

const stopMoving = (body: Physics.Arcade.Body) => {
    body.setVelocity(0, 0);
};
