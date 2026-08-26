export type XDirection = 'left' | 'right' | 'neutral';
export type YDirection = 'up' | 'down' | 'neutral';

export default abstract class InputComponent {
    #up: boolean;
    #down: boolean;
    #left: boolean;
    #right: boolean;
    #shoot: boolean;

    constructor() {
        this.reset();
    }

    reset() {
        this.#up = false;
        this.#down = false;
        this.#left = false;
        this.#right = false;
        this.#shoot = false;
    }

    get up() {
        return this.#up;
    }

    get down() {
        return this.#down;
    }

    get left() {
        return this.#left;
    }

    get right() {
        return this.#right;
    }

    get shoot() {
        return this.#shoot;
    }

    protected setXDirection(direction: XDirection) {
        this.#left = direction === 'left';
        this.#right = direction === 'right';
    }

    protected setYDirection(direction: YDirection) {
        this.#up = direction === 'up';
        this.#down = direction === 'down';
    }

    protected setShoot(isShootDown: boolean) {
        this.#shoot = isShootDown;
    }

    abstract update(delta: number): void;
}
