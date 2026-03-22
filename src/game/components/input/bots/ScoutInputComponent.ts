import InputComponent from '../InputComponent';

export default class ScoutInputComponent extends InputComponent {
    constructor() {
        super();
        this.down = true;
    }

    update() {
        // The scout enemy will always move downwards,
        // so we set the down property to true in the constructor
        // and do not update it in the update method.
    }
}
