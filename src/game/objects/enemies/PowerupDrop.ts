import ColliderComponent from '../../components/collider/ColliderComponent';
import type EventBusComponent from '../../components/events/EventBusComponent';
import HealthComponent from '../../components/health/HealthComponent';
import PowerupDropInputComponent from '../../components/input/bots/PowerupDropInputComponent';
import VerticalMovementComponent from '../../components/movement/VerticalMovementComponent';
import { POWERUP_DROP_CONFIG } from '../../config';
import type { GameObjectImplementable, GameObjectPosition } from '../objects.types';

export default class PowerupDrop extends Phaser.GameObjects.Container implements GameObjectImplementable {
    #isInitialized = false;
    #eventBusComponent: EventBusComponent;
    #inputComponent: PowerupDropInputComponent;
    #verticalMovementComponent: VerticalMovementComponent;
    #healthComponent: HealthComponent;
    #colliderComponent: ColliderComponent;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, []);

        const powerupSprite = scene.add.sprite(0, 0, POWERUP_DROP_CONFIG.SHIP_KEY).setScale(0.5);
        this.add(powerupSprite);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setSize(POWERUP_DROP_CONFIG.HITBOX_SIZE.WIDTH, POWERUP_DROP_CONFIG.HITBOX_SIZE.HEIGHT);
            this.body.setOffset(
                -POWERUP_DROP_CONFIG.HITBOX_SIZE.WIDTH / 2,
                -POWERUP_DROP_CONFIG.HITBOX_SIZE.HEIGHT / 2,
            );
            this.body.setCollideWorldBounds(false);
        }
        this.setDepth(2);

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.once(
            Phaser.Scenes.Events.DESTROY,
            () => {
                this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
            },
            this,
        );
    }

    get colliderComponent() {
        return this.#colliderComponent;
    }

    getPosition(): GameObjectPosition {
        return {
            x: this.x,
            y: this.y,
        };
    }

    initialize(eventBusComponent: EventBusComponent) {
        this.#isInitialized = true;
        this.#eventBusComponent = eventBusComponent;
        this.#inputComponent = new PowerupDropInputComponent();
        this.#verticalMovementComponent = new VerticalMovementComponent(
            this,
            this.#inputComponent,
            // TODO: Powerup config
            POWERUP_DROP_CONFIG.VERTICAL.VELOCITY,
            POWERUP_DROP_CONFIG.VERTICAL.VELOCITY_MAX,
            POWERUP_DROP_CONFIG.VERTICAL.DRAG,
        );
        this.#healthComponent = new HealthComponent(POWERUP_DROP_CONFIG.HEALTH);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent, {
            hitSound: POWERUP_DROP_CONFIG.HIT_SOUND,
        });
    }

    reset() {
        this.setActive(true);
        this.setVisible(true);
        this.#healthComponent.reset();
    }

    update(_timestamp: number, _delta: number) {
        if (!this.#isInitialized) {
            return;
        }

        if (!this.active) {
            return;
        }

        if (this.#healthComponent.isHealthDepleted) {
            this.#die();
        }

        this.#inputComponent.update();
        this.#verticalMovementComponent.update();
    }

    #die() {
        this.setActive(false);
        this.setVisible(false);
    }
}
