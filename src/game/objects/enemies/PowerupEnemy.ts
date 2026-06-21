import ColliderComponent from '../../components/collider/ColliderComponent';
import type EventBusComponent from '../../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../../components/events/EventBusComponent';
import HealthComponent from '../../components/health/HealthComponent';
import PowerupInputComponent from '../../components/input/bots/PowerupInputComponent';
import HorizontalMovementComponent from '../../components/movement/HorizontalMovementComponent';
import { ENEMY_CONFIG } from '../../config';
import type { EnemyImplementable } from './enemies.types';

export default class PowerupEnemy extends Phaser.GameObjects.Container implements EnemyImplementable {
    #isInitialized = false;
    #eventBusComponent: EventBusComponent;
    #inputComponent: PowerupInputComponent;
    #horizontalMovementComponent: HorizontalMovementComponent;
    #healthComponent: HealthComponent;
    #colliderComponent: ColliderComponent;
    #shipSprite: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, []);

        this.#shipSprite = scene.add
            .sprite(0, 0, ENEMY_CONFIG.POWERUP.SHIP_KEY)
            .setScale(ENEMY_CONFIG.POWERUP.SHIP_SCALE)
            .setRotation(Phaser.Math.DegToRad(-90));
        this.add([
            // Ship is on top, so it's added last.
            this.#shipSprite,
        ]);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setSize(ENEMY_CONFIG.POWERUP.HITBOX_SIZE.WIDTH, ENEMY_CONFIG.POWERUP.HITBOX_SIZE.HEIGHT);
            this.body.setOffset(
                -ENEMY_CONFIG.POWERUP.HITBOX_SIZE.WIDTH / 2,
                -ENEMY_CONFIG.POWERUP.HITBOX_SIZE.HEIGHT / 2,
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

    get healthComponent() {
        return this.#healthComponent;
    }

    get shipAssetKey() {
        return ENEMY_CONFIG.POWERUP.SHIP_KEY;
    }

    get shipDestroyedAnimationKey() {
        return ENEMY_CONFIG.POWERUP.EXPLOSION_ANIMATION_KEY;
    }

    get shipDestroyedAnimationScale() {
        return ENEMY_CONFIG.POWERUP.EXPLOSION_ANIMATION_SCALE;
    }

    get shipDestroyedSoundKey() {
        return ENEMY_CONFIG.POWERUP.EXPLOSION_SOUND;
    }

    get score(): number {
        return ENEMY_CONFIG.POWERUP.SCORE;
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
        this.#inputComponent = new PowerupInputComponent(this);
        this.#horizontalMovementComponent = new HorizontalMovementComponent(
            this,
            this.#inputComponent,
            ENEMY_CONFIG.POWERUP.HORIZONTAL.VELOCITY,
            ENEMY_CONFIG.POWERUP.HORIZONTAL.VELOCITY_MAX,
            ENEMY_CONFIG.POWERUP.HORIZONTAL.DRAG,
        );
        this.#healthComponent = new HealthComponent(ENEMY_CONFIG.POWERUP.HEALTH);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent, {
            hitSound: ENEMY_CONFIG.GUNSHIP.HIT_SOUND,
        });
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
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
        this.#horizontalMovementComponent.update();
    }

    #die() {
        this.setActive(false);
        this.setVisible(false);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.POWERUP_DESTROYED, this);
    }
}
