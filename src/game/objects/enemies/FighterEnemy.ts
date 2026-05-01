import { GameObjects, Physics, type Scene, Scenes } from 'phaser';
import ColliderComponent from '../../components/collider/ColliderComponent';
import type EventBusComponent from '../../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../../components/events/EventBusComponent';
import HealthComponent from '../../components/health/HealthComponent';
import FighterInputComponent from '../../components/input/bots/FighterInputComponent';
import VerticalMovementComponent from '../../components/movement/VerticalMovementComponent';
import WeaponComponent from '../../components/weapon/WeaponComponent';
import { ENEMY_CONFIG } from '../../config';
import type { EnemyImplementable } from './enemies.types';

export default class FighterEnemy extends GameObjects.Container implements EnemyImplementable {
    #isInitialized = false;
    #eventBusComponent: EventBusComponent;
    #inputComponent: FighterInputComponent;
    #verticalMovementComponent: VerticalMovementComponent;
    #healthComponent: HealthComponent;
    #colliderComponent: ColliderComponent;
    #weaponComponent: WeaponComponent;
    #shipSprite: GameObjects.Sprite;
    #shipEngineSprite: GameObjects.Sprite;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, []);

        this.#shipSprite = scene.add
            .sprite(0, 0, ENEMY_CONFIG.FIGHTER.SHIP_KEY)
            .setScale(ENEMY_CONFIG.FIGHTER.SHIP_SCALE);
        this.#shipEngineSprite = scene.add
            .sprite(0, 0, ENEMY_CONFIG.FIGHTER.SHIP_ENGINE_KEY)
            .setScale(ENEMY_CONFIG.FIGHTER.SHIP_ENGINE_SCALE)
            .setFlipY(true);
        this.#shipEngineSprite.play(ENEMY_CONFIG.FIGHTER.SHIP_ENGINE_KEY);
        this.add([
            // Ship is on top, so it's added last.
            this.#shipEngineSprite,
            this.#shipSprite,
        ]);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        if (this.body instanceof Physics.Arcade.Body) {
            this.body.setSize(ENEMY_CONFIG.FIGHTER.HITBOX_SIZE.WIDTH, ENEMY_CONFIG.FIGHTER.HITBOX_SIZE.HEIGHT);
            this.body.setOffset(
                -ENEMY_CONFIG.FIGHTER.HITBOX_SIZE.WIDTH / 2,
                -ENEMY_CONFIG.FIGHTER.HITBOX_SIZE.HEIGHT / 2,
            );
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
        return ENEMY_CONFIG.FIGHTER.SHIP_KEY;
    }

    get shipDestroyedAnimationKey() {
        return ENEMY_CONFIG.FIGHTER.EXPLOSION_ANIMATION_KEY;
    }

    get shipDestroyedAnimationScale() {
        return ENEMY_CONFIG.FIGHTER.EXPLOSION_ANIMATION_SCALE;
    }

    get shipDestroyedSoundKey() {
        return ENEMY_CONFIG.FIGHTER.EXPLOSION_SOUND;
    }

    get score() {
        return ENEMY_CONFIG.FIGHTER.SCORE;
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
        this.#inputComponent = new FighterInputComponent();
        this.#verticalMovementComponent = new VerticalMovementComponent(
            this,
            this.#inputComponent,
            ENEMY_CONFIG.FIGHTER.VERTICAL.VELOCITY,
            ENEMY_CONFIG.FIGHTER.VERTICAL.VELOCITY_MAX,
            ENEMY_CONFIG.FIGHTER.VERTICAL.DRAG,
        );
        this.#weaponComponent = new WeaponComponent(this, this.#inputComponent, this.#eventBusComponent, {
            weaponCooldown: ENEMY_CONFIG.FIGHTER.WEAPON.WEAPON_COOLDOWN,
            weaponReport: ENEMY_CONFIG.FIGHTER.WEAPON.WEAPON_REPORT,
            projectileAnimationKey: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_ANIMATION_KEY,
            projectileHitboxSize: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_HITBOX_SIZE,
            projectileScale: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_SCALE,
            projectileSpeed: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_SPEED,
            projectileLifespan: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_LIFESPAN,
            projectileSpawnPoolSize: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_SPAWN_POOL_SIZE,
            trajectoryFlipY: true,
            trajectoryYOffset: 10,
        });
        this.#healthComponent = new HealthComponent(ENEMY_CONFIG.FIGHTER.HEALTH);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent, {
            hitSound: ENEMY_CONFIG.SCOUT.HIT_SOUND,
        });
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
    }

    reset() {
        this.setActive(true);
        this.setVisible(true);
        this.#healthComponent.reset();
        this.#verticalMovementComponent.reset();
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

        this.#inputComponent.update();
        this.#verticalMovementComponent.update();
        this.#weaponComponent.update(delta);
    }

    #die() {
        this.setActive(false);
        this.setVisible(false);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);
    }
}
