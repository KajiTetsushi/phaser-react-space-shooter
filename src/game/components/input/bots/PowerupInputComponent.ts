import type { GameObjectImplementable, GameObjectPosition } from '../../../objects/objects.types';
import InputComponent from '../InputComponent';

export default class PowerupInputComponent extends InputComponent {
    #gameObject: Phaser.GameObjects.Container & GameObjectImplementable;

    constructor(gameObject: Phaser.GameObjects.Container & GameObjectImplementable) {
        super();

        this.#gameObject = gameObject;
        this.setXDirection(Math.random() < 0.5 ? 'left' : 'right');
    }

    update() {
        this.#bounceLeftAndRight();
    }

    #bounceLeftAndRight() {
        const position: GameObjectPosition = this.#gameObject.getPosition();
        const body = this.#gameObject.body as Phaser.Physics.Arcade.Body;

        if (position.x >= this.#gameObject.scene.scale.width - body.width / 2) {
            this.setXDirection('left');
        } else if (position.x <= body.width / 2) {
            this.setXDirection('right');
        }
    }
}
