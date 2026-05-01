import { GameObjects, Physics, type Scene, Scenes } from 'phaser';
import ColliderComponent from '../../components/collider/ColliderComponent';
import type EventBusComponent from '../../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../../components/events/EventBusComponent';
import HealthComponent from '../../components/health/HealthComponent';
import GunshipInputComponent from '../../components/input/bots/GunshipInputComponent';
import HorizontalMovementComponent from '../../components/movement/HorizontalMovementComponent';
import WeaponComponent from '../../components/weapon/WeaponComponent';
import { ENEMY_CONFIG } from '../../config';
import type { GetGameObjectPosition } from '../objects.types';
import type { EnemyImplementable } from './enemies.types';

export default class GunshipEnemy extends GameObjects.Container implements EnemyImplementable {
    #isInitialized = false;
    #eventBusComponent: EventBusComponent;
    #inputComponent: GunshipInputComponent;
    #horizontalMovementComponent: HorizontalMovementComponent;
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
        if (this.body instanceof Physics.Arcade.Body) {
            this.body.setSize(24, 24);
            this.body.setOffset(-12, -12);
            this.body.setCollideWorldBounds(false);
        }
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
        this.#inputComponent = new GunshipInputComponent(this, getPlayerPosition, {
            ai: {
                relativeXDistanceToPlayerRanges:
                    ENEMY_CONFIG.GUNSHIP.AI.RANDOM_FIRE.RELATIVE_X_DISTANCE_TO_PLAYER_RANGES,
            },
        });
        this.#weaponComponent = new WeaponComponent(this, this.#inputComponent, this.#eventBusComponent, {
            weaponCooldown: ENEMY_CONFIG.GUNSHIP.WEAPON.WEAPON_COOLDOWN,
            weaponReport: ENEMY_CONFIG.GUNSHIP.WEAPON.WEAPON_REPORT,
            projectileAnimationKey: ENEMY_CONFIG.GUNSHIP.WEAPON.PROJECTILE_ANIMATION_KEY,
            projectileHitboxSize: ENEMY_CONFIG.GUNSHIP.WEAPON.PROJECTILE_HITBOX_SIZE,
            projectileScale: ENEMY_CONFIG.GUNSHIP.WEAPON.PROJECTILE_SCALE,
            projectileSpeed: ENEMY_CONFIG.GUNSHIP.WEAPON.PROJECTILE_SPEED,
            projectileLifespan: ENEMY_CONFIG.GUNSHIP.WEAPON.PROJECTILE_LIFESPAN,
            projectileSpawnPoolSize: ENEMY_CONFIG.GUNSHIP.WEAPON.PROJECTILE_SPAWN_POOL_SIZE,
            trajectoryFlipY: true,
            trajectoryYOffset: 10,
        });
        this.#horizontalMovementComponent = new HorizontalMovementComponent(
            this,
            this.#inputComponent,
            ENEMY_CONFIG.GUNSHIP.HORIZONTAL.VELOCITY,
            ENEMY_CONFIG.GUNSHIP.HORIZONTAL.VELOCITY_MAX,
            ENEMY_CONFIG.GUNSHIP.HORIZONTAL.DRAG,
        );
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
        this.#horizontalMovementComponent.update();
        this.#weaponComponent.update(delta);
    }

    #die() {
        this.setActive(false);
        this.setVisible(false);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);
    }
}
