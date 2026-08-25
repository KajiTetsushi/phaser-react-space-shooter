import { GameObjects, Physics, type Scene, Scenes } from 'phaser';

import ColliderComponent from '../../components/collider/ColliderComponent';
import type EventBusComponent from '../../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../../components/events/EventBusComponent';
import HealthComponent from '../../components/health/HealthComponent';
import ScoutInputComponent from '../../components/input/bots/ScoutInputComponent';
import HorizontalMovementComponent from '../../components/movement/HorizontalMovementComponent2';
import VerticalMovementComponent from '../../components/movement/VerticalMovementComponent';
import { ENEMY_CONFIG } from '../../config';
import assert from '../../utils/assert';
import type { EnemyImplementable } from './enemies.types';

export default class ScoutEnemy extends GameObjects.Container implements EnemyImplementable {
    #isInitialized = false;
    #eventBusComponent: EventBusComponent;
    #inputComponent: ScoutInputComponent;
    #horizontalMovementComponent: HorizontalMovementComponent;
    #verticalMovementComponent: VerticalMovementComponent;
    #healthComponent: HealthComponent;
    #colliderComponent: ColliderComponent;
    #shipSprite: GameObjects.Sprite;
    #shipEngineSprite: GameObjects.Sprite;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, []);

        this.#shipSprite = scene.add.sprite(0, 0, ENEMY_CONFIG.SCOUT.SHIP_KEY).setScale(ENEMY_CONFIG.SCOUT.SHIP_SCALE);
        this.#shipEngineSprite = scene.add
            .sprite(0, 0, ENEMY_CONFIG.SCOUT.SHIP_ENGINE_KEY)
            .setScale(ENEMY_CONFIG.SCOUT.SHIP_ENGINE_SCALE)
            .setFlipY(true);
        this.#shipEngineSprite.play(ENEMY_CONFIG.SCOUT.SHIP_ENGINE_KEY);
        this.add([
            // Ship is on top, so it's added last.
            this.#shipEngineSprite,
            this.#shipSprite,
        ]);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        const { body } = this;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        body.setSize(ENEMY_CONFIG.SCOUT.HITBOX_SIZE.WIDTH, ENEMY_CONFIG.SCOUT.HITBOX_SIZE.HEIGHT);
        body.setOffset(-ENEMY_CONFIG.SCOUT.HITBOX_SIZE.WIDTH / 2, -ENEMY_CONFIG.SCOUT.HITBOX_SIZE.HEIGHT / 2);
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

    get healthComponent() {
        return this.#healthComponent;
    }

    get shipAssetKey() {
        return ENEMY_CONFIG.SCOUT.SHIP_KEY;
    }

    get shipDestroyedAnimationKey() {
        return ENEMY_CONFIG.SCOUT.EXPLOSION_ANIMATION_KEY;
    }

    get shipDestroyedAnimationScale() {
        return ENEMY_CONFIG.SCOUT.EXPLOSION_ANIMATION_SCALE;
    }

    get shipDestroyedSoundKey() {
        return ENEMY_CONFIG.SCOUT.EXPLOSION_SOUND;
    }

    get score() {
        return ENEMY_CONFIG.SCOUT.SCORE;
    }

    getPosition() {
        return {
            x: this.x,
            y: this.y,
        };
    }

    initialize(eventBusComponent: EventBusComponent) {
        this.#isInitialized = true;
        this.#eventBusComponent = eventBusComponent;
        this.#inputComponent = new ScoutInputComponent(
            this,
            // The direction of the scout's horizontal movement
            // will rely on its current position.
            this.x,
            ENEMY_CONFIG.SCOUT.HORIZONTAL.DRIFT_MAX,
        );

        const { body } = this;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        this.#horizontalMovementComponent = new HorizontalMovementComponent(body, this.#inputComponent, {
            velocityIncrement: ENEMY_CONFIG.SCOUT.HORIZONTAL.VELOCITY_INCREMENT,
            velocityMaximum: ENEMY_CONFIG.SCOUT.HORIZONTAL.VELOCITY_MAXIMUM,
            drag: ENEMY_CONFIG.SCOUT.HORIZONTAL.DRAG,
        });
        this.#verticalMovementComponent = new VerticalMovementComponent(
            this,
            this.#inputComponent,
            ENEMY_CONFIG.SCOUT.VERTICAL.VELOCITY,
            ENEMY_CONFIG.SCOUT.VERTICAL.VELOCITY_MAX,
            ENEMY_CONFIG.SCOUT.VERTICAL.DRAG,
        );
        this.#healthComponent = new HealthComponent(ENEMY_CONFIG.SCOUT.HEALTH);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent, {
            hitSound: ENEMY_CONFIG.SCOUT.HIT_SOUND,
        });
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
    }

    reset() {
        this.setActive(true);
        this.setVisible(true);
        this.#horizontalMovementComponent.reset();
        this.#verticalMovementComponent.reset();
        this.#healthComponent.reset();
        this.#inputComponent.setStartX(this.x);
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
        this.#horizontalMovementComponent.update();
        this.#verticalMovementComponent.update();
    }

    #die() {
        this.setActive(false);
        this.setVisible(false);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);
    }
}
