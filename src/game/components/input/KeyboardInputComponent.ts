import { Input, type Scene, type Types } from 'phaser';

import InputComponent, { type XDirection, type YDirection } from './InputComponent';

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

        this.setXDirection(this.selectedXDirection);
        this.setYDirection(this.selectedYDirection);
        this.shoot = this.#cursorKeys.space.isDown;
    }

    get selectedXDirection(): XDirection {
        const leftIsDown = this.#cursorKeys.left.isDown || this.#cursorKeys.a.isDown;
        const rightIsDown = this.#cursorKeys.right.isDown || this.#cursorKeys.d.isDown;

        // Deadlock
        if (leftIsDown && rightIsDown) {
            return 'neutral';
        }

        if (leftIsDown) {
            return 'left';
        }

        if (rightIsDown) {
            return 'right';
        }

        // Released
        return 'neutral';
    }

    get selectedYDirection(): YDirection {
        const upIsDown = this.#cursorKeys.up.isDown || this.#cursorKeys.w.isDown;
        const downIsDown = this.#cursorKeys.down.isDown || this.#cursorKeys.s.isDown;

        // Deadlock
        if (upIsDown && downIsDown) {
            return 'neutral';
        }

        if (upIsDown) {
            return 'up';
        }

        if (downIsDown) {
            return 'down';
        }

        // Released
        return 'neutral';
    }
}
