import { type GameObjects, Physics } from 'phaser';

import type { GameObjectImplementable, GameObjectPosition } from '../../../objects/objects.types';
import assert from '../../../utils/assert';
import InputComponent from '../InputComponent';

export default class PowerupInputComponent extends InputComponent {
    #gameObject: GameObjects.Container & GameObjectImplementable;

    constructor(gameObject: GameObjects.Container & GameObjectImplementable) {
        super();

        this.#gameObject = gameObject;
        this.setXDirection(Math.random() < 0.5 ? 'left' : 'right');
    }

    update() {
        this.#bounceLeftAndRight();
    }

    #bounceLeftAndRight() {
        const position: GameObjectPosition = this.#gameObject.getPosition();
        const { body } = this.#gameObject;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        if (position.x >= this.#gameObject.scene.scale.width - body.width / 2) {
            this.setXDirection('left');
        } else if (position.x <= body.width / 2) {
            this.setXDirection('right');
        }
    }
}
