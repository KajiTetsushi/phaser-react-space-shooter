export default class InputComponent {
    protected up: boolean;
    protected down: boolean;
    protected left: boolean;
    protected right: boolean;
    protected shoot: boolean;

    constructor() {
        this.reset();
    }

    reset() {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.shoot = false;
    }

    get upIsDown() {
        return this.up;
    }

    get downIsDown() {
        return this.down;
    }

    get leftIsDown() {
        return this.left;
    }

    get rightIsDown() {
        return this.right;
    }

    get shootIsDown() {
        return this.shoot;
    }
}
