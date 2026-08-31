import { GameObjects, Physics, type Scene, Scenes } from 'phaser';

import ColliderComponent from '../../components/collider/ColliderComponent';
import type EventBusComponent from '../../components/events/EventBusComponent';
import HealthComponent from '../../components/health/HealthComponent';
import PowerupDropInputComponent from '../../components/input/PowerupDropInputComponent';
import MovementComponent from '../../components/movement/MovementComponent';
import { POWERUP_DROP_CONFIG } from '../../config';
import assert from '../../utils/assert';

export default class PowerupDrop extends GameObjects.Container {
    #isInitialized = false;
    #eventBusComponent: EventBusComponent;
    #inputComponent: PowerupDropInputComponent;
    #movementComponent: MovementComponent;
    #healthComponent: HealthComponent;
    #colliderComponent: ColliderComponent;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, []);

        const powerupSprite = scene.add.sprite(0, 0, POWERUP_DROP_CONFIG.SHIP_KEY).setScale(0.5);
        this.add(powerupSprite);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        const { body } = this;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        body.setSize(POWERUP_DROP_CONFIG.HITBOX_SIZE.WIDTH, POWERUP_DROP_CONFIG.HITBOX_SIZE.HEIGHT);
        body.setOffset(-POWERUP_DROP_CONFIG.HITBOX_SIZE.WIDTH / 2, -POWERUP_DROP_CONFIG.HITBOX_SIZE.HEIGHT / 2);
        body.setCollideWorldBounds(false);

        this.setDepth(2);

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

    initialize(eventBusComponent: EventBusComponent) {
        this.#isInitialized = true;
        this.#eventBusComponent = eventBusComponent;
        this.#inputComponent = new PowerupDropInputComponent();

        const { body } = this;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        this.#movementComponent = new MovementComponent(body, this.#inputComponent, POWERUP_DROP_CONFIG.movement);
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

    update(time: number, delta: number) {
        if (!this.#isInitialized) {
            return;
        }

        if (!this.active) {
            return;
        }

        if (this.#healthComponent.isHealthDepleted) {
            this.#die();
        }

        this.#inputComponent.update(time, delta);
        this.#movementComponent.update(time, delta);
    }

    #die() {
        this.setActive(false);
        this.setVisible(false);
    }
}
