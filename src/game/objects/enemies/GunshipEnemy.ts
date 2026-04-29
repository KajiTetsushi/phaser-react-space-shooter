import { GameObjects, Physics, type Scene, Scenes } from 'phaser';
import ColliderComponent from '../../components/collider/ColliderComponent';
import type EventBusComponent from '../../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../../components/events/EventBusComponent';
import HealthComponent from '../../components/health/HealthComponent';
import GunshipInputComponent from '../../components/input/bots/GunshipInputComponent';
import HorizontalMovementComponent from '../../components/movement/HorizontalMovementComponent';
import WeaponComponent from '../../components/weapon/WeaponComponent';
import { ENEMY_CONFIG } from '../../config';
import type { GetGameObjectPosition } from '../types';
import type { EnemyImplementable } from './types';

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

        this.#shipSprite = scene.add.sprite(0, 0, 'fighter');
        this.#shipEngineSprite = scene.add.sprite(0, 0, 'fighter_engine').setFlipY(true);
        this.#shipEngineSprite.play('fighter_engine');
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
        return 'fighter';
    }

    get shipDestroyedAnimationKey() {
        return 'fighter_destroy';
    }

    get score(): number {
        return ENEMY_CONFIG.GUNSHIP.SCORE;
    }

    initialize(eventBusComponent: EventBusComponent, getPlayerPosition: GetGameObjectPosition) {
        this.#isInitialized = true;
        this.#eventBusComponent = eventBusComponent;
        this.#inputComponent = new GunshipInputComponent(this, getPlayerPosition);
        this.#weaponComponent = new WeaponComponent(this, this.#inputComponent, {
            weaponCooldown: ENEMY_CONFIG.GUNSHIP.WEAPON.WEAPON_COOLDOWN,
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
        this.#colliderComponent = new ColliderComponent(this.#healthComponent);
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
