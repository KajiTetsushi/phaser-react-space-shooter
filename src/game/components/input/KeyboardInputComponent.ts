import type { Scene, Types } from 'phaser';

import InputComponent from './InputComponent';

export default class KeyboardInputComponent extends InputComponent {
    #cursorKeys!: Types.Input.Keyboard.CursorKeys;
    #inputLocked: boolean = false;

    constructor(scene: Scene) {
        super();
        this.#cursorKeys = scene.input.keyboard!.createCursorKeys();
    }

    setInputLocked(value: boolean) {
        this.#inputLocked = value;
    }

    update() {
        if (this.#inputLocked) {
            this.reset();
            return;
        }

        this.up = this.#cursorKeys.up.isDown;
        this.down = this.#cursorKeys.down.isDown;
        this.left = this.#cursorKeys.left.isDown;
        this.right = this.#cursorKeys.right.isDown;
        this.shoot = this.#cursorKeys.space.isDown;
    }
}
