import { GameObjects, Physics, type Scene, Scenes } from 'phaser';
import ColliderComponent from '../components/collider/ColliderComponent';
import type EventBusComponent from '../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../components/events/EventBusComponent';
import HealthComponent from '../components/health/HealthComponent';
import KeyboardInputComponent from '../components/input/KeyboardInputComponent';
import HorizontalMovementComponent from '../components/movement/HorizontalMovementComponent';
import WeaponComponent from '../components/weapon/WeaponComponent';
import { PLAYER_CONFIG } from '../config';

export default class Player extends GameObjects.Container {
    #inputComponent: KeyboardInputComponent;
    #horizontalMovementComponent: HorizontalMovementComponent;
    #healthComponent: HealthComponent;
    #colliderComponent: ColliderComponent;
    #eventBusComponent: EventBusComponent;
    #weaponComponent: WeaponComponent;
    #shipSprite: GameObjects.Sprite;
    #shipEngineSprite: GameObjects.Sprite;
    #shipEngineThrusterSprite: GameObjects.Sprite;

    constructor(scene: Scene, eventBusComponent: EventBusComponent) {
        // The player is centered horizontally and placed near the bottom of the screen.
        // Any sprite and animation that is added to this container will be positioned relative to this container.
        super(scene, scene.scale.width / 2, scene.scale.height - 32, []);

        this.#eventBusComponent = eventBusComponent;

        this.#shipSprite = scene.add.sprite(0, 0, 'ship');
        this.#shipEngineSprite = scene.add.sprite(0, 0, 'ship_engine');
        this.#shipEngineThrusterSprite = scene.add.sprite(0, 0, 'ship_engine_thruster');
        this.#shipEngineThrusterSprite.play('ship_engine_thruster');
        this.add([
            // Ship is on top, so it's added last.
            this.#shipEngineThrusterSprite,
            this.#shipEngineSprite,
            this.#shipSprite,
        ]);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        if (this.body instanceof Physics.Arcade.Body) {
            this.body.setSize(24, 24);
            this.body.setOffset(-12, -12);
            this.body.setCollideWorldBounds(true);
        }
        this.setDepth(2);

        this.#inputComponent = new KeyboardInputComponent(this.scene);
        this.#horizontalMovementComponent = new HorizontalMovementComponent(
            this,
            this.#inputComponent,
            PLAYER_CONFIG.HORIZONTAL.VELOCITY,
            PLAYER_CONFIG.HORIZONTAL.VELOCITY_MAX,
            PLAYER_CONFIG.HORIZONTAL.DRAG,
        );
        this.#weaponComponent = new WeaponComponent(this, this.#inputComponent, {
            weaponCooldown: PLAYER_CONFIG.WEAPON.WEAPON_COOLDOWN,
            projectileAnimationKey: PLAYER_CONFIG.WEAPON.PROJECTILE_ANIMATION_KEY,
            projectileHitboxSize: PLAYER_CONFIG.WEAPON.PROJECTILE_HITBOX_SIZE,
            projectileScale: PLAYER_CONFIG.WEAPON.PROJECTILE_SCALE,
            projectileSpeed: PLAYER_CONFIG.WEAPON.PROJECTILE_SPEED,
            projectileLifespan: PLAYER_CONFIG.WEAPON.PROJECTILE_LIFESPAN,
            projectileSpawnPoolSize: PLAYER_CONFIG.WEAPON.PROJECTILE_SPAWN_POOL_SIZE,
            trajectoryFlipY: false,
            trajectoryYOffset: -20,
        });
        this.#healthComponent = new HealthComponent(PLAYER_CONFIG.HEALTH);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent);

        this.scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.once(
            Scenes.Events.DESTROY,
            () => {
                this.scene.events.off(Scenes.Events.UPDATE, this.update, this);
            },
            this,
        );

        this.#hide();
        this.#eventBusComponent.on(CUSTOM_EVENTS.PLAYER_SPAWN, this.#spawn, this);
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

    update(_timestamp: number, delta: number) {
        if (!this.active) {
            return;
        }

        if (this.#healthComponent.isHealthDepleted) {
            this.#die();
            return;
        }

        this.#shipSprite.setFrame(PLAYER_CONFIG.HEALTH - this.#healthComponent.health);
        this.#inputComponent.update();
        this.#horizontalMovementComponent.update();
        this.#weaponComponent.update(delta);
    }

    #die() {
        this.setActive(false);
        this.#shipEngineSprite.setVisible(false);
        this.#shipEngineThrusterSprite.setVisible(false);
        this.#inputComponent.setInputLocked(true);
        this.#shipSprite.play({
            key: 'explosion',
        });
        this.#eventBusComponent.emit(CUSTOM_EVENTS.PLAYER_DESTROYED);

        this.#shipSprite.once(
            'animationcomplete',
            () => {
                // this.setVisible(false);
                this.#eventBusComponent.emit(CUSTOM_EVENTS.GAME_OVER);
            },
            this,
        );
    }

    #spawn() {
        this.setActive(true);
        this.setVisible(true);
        this.#shipSprite.setVisible(true);
        this.#shipEngineSprite.setVisible(true);
        this.#shipEngineThrusterSprite.setVisible(true);
        this.#inputComponent.setInputLocked(false);
        this.#shipSprite.setTexture('ship', 0);
        this.setPosition(this.scene.scale.width / 2, this.scene.scale.height - 32);
        this.#healthComponent.reset();
    }

    #hide() {
        this.setActive(false);
        this.setVisible(false);
        this.#shipEngineSprite.setVisible(false);
        this.#shipEngineThrusterSprite.setVisible(false);
        this.#inputComponent.setInputLocked(true);
    }
}
