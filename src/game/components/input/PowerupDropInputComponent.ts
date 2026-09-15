import InputComponent from './InputComponent';

export default class PowerupDropInputComponent extends InputComponent {
    constructor() {
        super();
        this.setYDirection('down');
    }

    update(_time: number, _delta: number) {
        // The powerup enemy will always move downwards,
        // so we set the down property to true in the constructor
        // and do not update it in the update method.
    }
}
