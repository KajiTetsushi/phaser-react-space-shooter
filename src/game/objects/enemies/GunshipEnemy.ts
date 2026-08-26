import { GameObjects, Physics, type Scene, Scenes } from 'phaser';

import ColliderComponent from '../../components/collider/ColliderComponent';
import type EventBusComponent from '../../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../../components/events/EventBusComponent';
import HealthComponent from '../../components/health/HealthComponent';
import GunshipInputComponent from '../../components/input/bots/GunshipInputComponent';
import MovementComponent from '../../components/movement/MovementComponent';
import WeaponComponent from '../../components/weapon/WeaponComponent';
import { ENEMY_CONFIG } from '../../config';
import assert from '../../utils/assert';
import type { GetGameObjectPosition } from '../objects.types';
import type { EnemyImplementable } from './enemies.types';

export default class GunshipEnemy extends GameObjects.Container implements EnemyImplementable {
    #isInitialized = false;
    #eventBusComponent: EventBusComponent;
    #inputComponent: GunshipInputComponent;
    #movementComponent: MovementComponent;
    #healthComponent: HealthComponent;
    #colliderComponent: ColliderComponent;
    #weaponComponent: WeaponComponent;
    #shipSprite: GameObjects.Sprite;
    #shipEngineSprite: GameObjects.Sprite;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, []);

        this.#shipSprite = scene.add
            .sprite(0, 0, ENEMY_CONFIG.GUNSHIP.SHIP_KEY)
            .setScale(ENEMY_CONFIG.GUNSHIP.SHIP_SCALE);
        this.#shipEngineSprite = scene.add
            .sprite(0, 0, ENEMY_CONFIG.GUNSHIP.SHIP_ENGINE_KEY)
            .setScale(ENEMY_CONFIG.GUNSHIP.SHIP_ENGINE_SCALE)
            .setFlipY(true);
        this.#shipEngineSprite.play(ENEMY_CONFIG.GUNSHIP.SHIP_ENGINE_KEY);
        this.add([
            // Ship is on top, so it's added last.
            this.#shipEngineSprite,
            this.#shipSprite,
        ]);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        const { body } = this;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        body.setSize(ENEMY_CONFIG.GUNSHIP.HITBOX_SIZE.WIDTH, ENEMY_CONFIG.GUNSHIP.HITBOX_SIZE.HEIGHT);
        body.setOffset(-ENEMY_CONFIG.GUNSHIP.HITBOX_SIZE.WIDTH / 2, -ENEMY_CONFIG.GUNSHIP.HITBOX_SIZE.HEIGHT / 2);
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

    get weaponComponent() {
        return this.#weaponComponent;
    }

    get projectileGroup() {
        return this.weaponComponent.projectileGroup;
    }

    get shipAssetKey() {
        return ENEMY_CONFIG.GUNSHIP.SHIP_KEY;
    }

    get shipDestroyedAnimationKey() {
        return ENEMY_CONFIG.GUNSHIP.EXPLOSION_ANIMATION_KEY;
    }

    get shipDestroyedAnimationScale() {
        return ENEMY_CONFIG.GUNSHIP.EXPLOSION_ANIMATION_SCALE;
    }

    get shipDestroyedSoundKey() {
        return ENEMY_CONFIG.GUNSHIP.EXPLOSION_SOUND;
    }

    get score(): number {
        return ENEMY_CONFIG.GUNSHIP.SCORE;
    }

    getPosition() {
        return {
            x: this.x,
            y: this.y,
        };
    }

    initialize(eventBusComponent: EventBusComponent, getPlayerPosition: GetGameObjectPosition) {
        this.#isInitialized = true;
        this.#eventBusComponent = eventBusComponent;
        this.#inputComponent = new GunshipInputComponent(this, getPlayerPosition, ENEMY_CONFIG.GUNSHIP.ai);
        this.#weaponComponent = new WeaponComponent(
            this,
            this.#inputComponent,
            this.#eventBusComponent,
            ENEMY_CONFIG.GUNSHIP.weapon!,
        );

        const { body } = this;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        this.#movementComponent = new MovementComponent(body, this.#inputComponent, ENEMY_CONFIG.GUNSHIP.movement);
        this.#healthComponent = new HealthComponent(ENEMY_CONFIG.GUNSHIP.HEALTH);
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

    update(_timestamp: number, delta: number) {
        if (!this.#isInitialized) {
            return;
        }

        if (!this.active) {
            return;
        }

        if (this.#healthComponent.isHealthDepleted) {
            this.#die();
        }

        this.#inputComponent.update(delta);
        this.#movementComponent.update();
        this.#weaponComponent.update(delta);
    }

    #die() {
        this.setActive(false);
        this.setVisible(false);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);
    }
}
