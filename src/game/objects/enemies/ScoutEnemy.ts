import { GameObjects, Physics, type Scene, Scenes } from 'phaser';
import ColliderComponent from '../../components/collider/ColliderComponent';
import HealthComponent from '../../components/health/HealthComponent';
import ScoutInputComponent from '../../components/input/bots/ScoutInputComponent';
import type InputComponent from '../../components/input/InputComponent';
import HorizontalMovementComponent from '../../components/movement/HorizontalMovementComponent';
import VerticalMovementComponent from '../../components/movement/VerticalMovementComponent';
import { ENEMY_CONFIG } from '../../config';

export default class ScoutEnemy extends GameObjects.Container {
    #inputComponent: InputComponent;
    #horizontalMovementComponent: HorizontalMovementComponent;
    #verticalMovementComponent: VerticalMovementComponent;
    #healthComponent: HealthComponent;
    #colliderComponent: ColliderComponent;
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

        this.#inputComponent = new ScoutInputComponent(
            this,
            // The direction of the scout's horizontal movement
            // will rely on its current position.
            this.x,
            ENEMY_CONFIG.SCOUT.HORIZONTAL.DRIFT_MAX,
        );
        this.#horizontalMovementComponent = new HorizontalMovementComponent(
            this,
            this.#inputComponent,
            ENEMY_CONFIG.SCOUT.HORIZONTAL.VELOCITY,
            ENEMY_CONFIG.SCOUT.HORIZONTAL.VELOCITY_MAX,
            ENEMY_CONFIG.SCOUT.HORIZONTAL.DRAG,
        );
        this.#verticalMovementComponent = new VerticalMovementComponent(
            this,
            this.#inputComponent,
            ENEMY_CONFIG.SCOUT.VERTICAL.VELOCITY,
            ENEMY_CONFIG.SCOUT.VERTICAL.VELOCITY_MAX,
            ENEMY_CONFIG.SCOUT.VERTICAL.DRAG,
        );
        this.#healthComponent = new HealthComponent(ENEMY_CONFIG.SCOUT.HEALTH);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent);

        this.scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.once(
            Scenes.Events.DESTROY,
            () => {
                this.scene.events.off(Scenes.Events.UPDATE, this.update, this);
            },
            this,
        );
    }

    get colliderComponent() {
        return this.#colliderComponent;
    }

    get healthComponent() {
        return this.#healthComponent;
    }

    update(_timestamp: number, _delta: number) {
        if (!this.active) {
            return;
        }

        if (this.#healthComponent.isHealthDepleted) {
            this.setActive(false);
            this.setVisible(false);
        }

        this.#inputComponent.update();
        this.#horizontalMovementComponent.update();
        this.#verticalMovementComponent.update();
    }
}
