export default abstract class InputComponent {
    private up: boolean;
    private down: boolean;
    private left: boolean;
    private right: boolean;
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

    protected setXDirection(direction: 'left' | 'right' | null) {
        this.left = direction === 'left';
        this.right = direction === 'right';
    }

    protected setYDirection(direction: 'up' | 'down' | null) {
        this.up = direction === 'up';
        this.down = direction === 'down';
    }

    abstract update(): void;
}
