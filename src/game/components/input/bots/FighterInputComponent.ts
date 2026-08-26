import InputComponent from '../InputComponent';

/**
 * Fighter bot AI input: downwards sideways flight pattern, always firing
 */
export default class FighterInputComponent extends InputComponent {
    constructor() {
        super();
        this.setYDirection('down');
        this.setShoot(true);
    }

    update() {
        // The fighter enemy will always move downwards,
        // so we set the down property to true in the constructor
        // and do not update it in the update method.
    }
}
