import { Input, type Scene, type Types } from 'phaser';

import InputComponent from './InputComponent';

export default class KeyboardInputComponent extends InputComponent {
    #cursorKeys: Types.Input.Keyboard.CursorKeys & {
        w: Input.Keyboard.Key; // alt up
        s: Input.Keyboard.Key; // alt down
        a: Input.Keyboard.Key; // alt left
        d: Input.Keyboard.Key; // alt right
    };
    #inputLocked: boolean = false;

    constructor(scene: Scene) {
        super();
        this.#cursorKeys = {
            ...scene.input.keyboard!.createCursorKeys(),
            w: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.W),
            s: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.S),
            a: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.A),
            d: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.D),
        };
    }

    setInputLocked(value: boolean) {
        this.#inputLocked = value;
    }

    update() {
        if (this.#inputLocked) {
            this.reset();
            return;
        }

        this.up = this.#cursorKeys.up.isDown || this.#cursorKeys.w.isDown;
        this.down = this.#cursorKeys.down.isDown || this.#cursorKeys.s.isDown;
        this.left = this.#cursorKeys.left.isDown || this.#cursorKeys.a.isDown;
        this.right = this.#cursorKeys.right.isDown || this.#cursorKeys.d.isDown;
        this.shoot = this.#cursorKeys.space.isDown;
    }
}
