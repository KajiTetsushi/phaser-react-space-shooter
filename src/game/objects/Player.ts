import { GameObjects, Physics, type Scene, Scenes } from 'phaser';
import KeyboardInputComponent from '../components/input/KeyboardInputComponent';
import HorizontalMovementComponent from '../components/movement/HorizontalMovementComponent';
import { PLAYER_CONFIG } from '../config';

export default class Player extends GameObjects.Container {
    #keyboardInputComponent: KeyboardInputComponent;
    #horizontalMovementComponent: HorizontalMovementComponent;
    #shipSprite: GameObjects.Sprite;
    #shipEngineSprite: GameObjects.Sprite;
    #shipEngineThrusterSprite: GameObjects.Sprite;

    constructor(scene: Scene) {
        // The player is centered horizontally and placed near the bottom of the screen.
        // Any sprite and animation that is added to this container will be positioned relative to this container.
        super(scene, scene.scale.width / 2, scene.scale.height - 32, []);

        this.#shipSprite = scene.add.sprite(0, 0, 'ship');
        this.#shipEngineSprite = scene.add.sprite(0, 0, 'ship_engine');
        this.#shipEngineThrusterSprite = scene.add.sprite(0, 0, 'ship_engine_thruster');
        this.#shipEngineThrusterSprite.play('ship_engine_thruster');
        this.add([
            // Ship is on top, so it's added last.
            this.#shipEngineThrusterSprite,
            this.#shipEngineSprite,
            this.#shipSprite,
        ]);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        if (this.body instanceof Physics.Arcade.Body) {
            this.body.setSize(24, 24);
            this.body.setOffset(-12, -12);
            this.body.setCollideWorldBounds(true);
        }
        this.setDepth(2);

        this.#keyboardInputComponent = new KeyboardInputComponent(this.scene);
        this.#horizontalMovementComponent = new HorizontalMovementComponent(
            this,
            this.#keyboardInputComponent,
            PLAYER_CONFIG.HORIZONTAL_VELOCITY,
            PLAYER_CONFIG.HORIZONTAL_VELOCITY_MAX,
            PLAYER_CONFIG.DRAG,
        );

        this.scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.once(
            Scenes.Events.DESTROY,
            () => {
                this.scene.events.off(Scenes.Events.UPDATE, this.update, this);
            },
            this,
        );
    }

    update(_timestamp: number, _delta: number) {
        this.#keyboardInputComponent.update();
        this.#horizontalMovementComponent.update();
    }
}
