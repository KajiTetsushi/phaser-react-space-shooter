import { GameObjects, Physics, type Scene, Scenes } from 'phaser';
import ScoutInputComponent from '../../components/input/bots/ScoutInputComponent';
import VerticalMovementComponent from '../../components/movement/VeritcalMovementComponent';
import { ENEMY_CONFIG } from '../../config';

export default class ScoutEnemy extends GameObjects.Container {
    #inputComponent: ScoutInputComponent;
    #verticalMovementComponent: VerticalMovementComponent;
    #shipSprite: GameObjects.Sprite;
    #shipEngineSprite: GameObjects.Sprite;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, []);

        this.#shipSprite = scene.add.sprite(0, 0, 'scout');
        this.#shipEngineSprite = scene.add.sprite(0, 0, 'scout_engine').setFlipY(true);
        this.#shipEngineSprite.play('scout_engine');
        this.add([
            // Ship is on top, so it's added last.
            this.#shipEngineSprite,
            this.#shipSprite,
        ]);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        if (this.body instanceof Physics.Arcade.Body) {
            this.body.setSize(24, 24);
            this.body.setOffset(-12, -12);
            this.body.setCollideWorldBounds(false);
        }
        this.setDepth(2);

        this.#inputComponent = new ScoutInputComponent();
        this.#verticalMovementComponent = new VerticalMovementComponent(
            this,
            this.#inputComponent,
            ENEMY_CONFIG.SCOUT.VERTICAL_VELOCITY,
            ENEMY_CONFIG.SCOUT.VERTICAL_VELOCITY_MAX,
            ENEMY_CONFIG.SCOUT.DRAG,
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
        this.#inputComponent.update();
        this.#verticalMovementComponent.update();
    }
}
