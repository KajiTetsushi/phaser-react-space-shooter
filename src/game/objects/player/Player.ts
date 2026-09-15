import { GameObjects, Physics, type Scene, Scenes } from 'phaser';

import ColliderComponent from '../../components/collider/ColliderComponent';
import type EventBusComponent from '../../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../../components/events/EventBusComponent';
import HealthComponent from '../../components/health/HealthComponent';
import KeyboardInputComponent from '../../components/input/KeyboardInputComponent';
import MovementComponent from '../../components/movement/MovementComponent';
import PowerupLevelComponent from '../../components/powerup/PowerupLevelComponent';
import WeaponComponent from '../../components/weapon/WeaponComponent';
import { PLAYER_CONFIG } from '../../config';
import assert from '../../utils/assert';

export default class Player extends GameObjects.Container {
    #inputComponent: KeyboardInputComponent;
    #movementComponent: MovementComponent;
    #healthComponent: HealthComponent;
    #powerupLevelComponent: PowerupLevelComponent;
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

        const { body } = this;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        body.setSize(PLAYER_CONFIG.HITBOX_SIZE.WIDTH, PLAYER_CONFIG.HITBOX_SIZE.HEIGHT);
        body.setOffset(-PLAYER_CONFIG.HITBOX_SIZE.WIDTH / 2, -PLAYER_CONFIG.HITBOX_SIZE.HEIGHT / 2);
        body.setCollideWorldBounds(true);

        this.setDepth(2);

        this.#inputComponent = new KeyboardInputComponent(this.scene);
        this.#movementComponent = new MovementComponent(body, this.#inputComponent, PLAYER_CONFIG.movement);
        this.#powerupLevelComponent = new PowerupLevelComponent({
            onLevelChange: (nextPowerupLevel) => {
                if (nextPowerupLevel > PLAYER_CONFIG.POWERUP_MAX) {
                    this.#healthComponent.takeDamage(-1);
                    return;
                }

                if (nextPowerupLevel === PLAYER_CONFIG.POWERUP_MAX) {
                    this.#weaponComponent.updateWeaponConfig({
                        weaponCooldown: 200,
                        projectileSpeed: 400,
                    });
                    return;
                }

                this.#weaponComponent.updateWeaponConfig({
                    weaponCluster: nextPowerupLevel,
                });
            },
        });
        this.#weaponComponent = new WeaponComponent(
            this,
            this.#inputComponent,
            this.#eventBusComponent,
            PLAYER_CONFIG.weapon,
        );
        this.#healthComponent = new HealthComponent(PLAYER_CONFIG.HEALTH, this.#eventBusComponent);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent, {
            hitSound: PLAYER_CONFIG.HIT_SOUND,
        });

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
        this.#eventBusComponent.on(
            CUSTOM_EVENTS.POWERUP_COLLECTED,
            () => {
                this.#powerupLevelComponent.incrementLevel();
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

    update(time: number, delta: number) {
        if (!this.active) {
            return;
        }

        if (this.#healthComponent.isHealthDepleted) {
            this.#die();
            return;
        }

        this.#shipSprite.setFrame(PLAYER_CONFIG.HEALTH - this.#healthComponent.health);
        this.#inputComponent.update(time, delta);
        this.#movementComponent.update(time, delta);
        this.#weaponComponent.update(time, delta);
    }

    #die() {
        this.setActive(false);
        this.#shipEngineSprite.setVisible(false);
        this.#shipEngineThrusterSprite.setVisible(false);
        this.#inputComponent.setInputLocked(true);
        this.#shipSprite.play({
            key: 'explosion',
        });
        this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_EXPLOSION, PLAYER_CONFIG.EXPLOSION_SOUND);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.PLAYER_DESTROYED);
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
        this.#powerupLevelComponent.resetLevel();
        this.#weaponComponent.updateWeaponConfig({
            weaponCluster: undefined,
            weaponCooldown: PLAYER_CONFIG.weapon.weaponCooldown,
            projectileSpeed: PLAYER_CONFIG.weapon.projectileSpeed,
        });
    }

    #hide() {
        this.setActive(false);
        this.setVisible(false);
        this.#shipEngineSprite.setVisible(false);
        this.#shipEngineThrusterSprite.setVisible(false);
        this.#inputComponent.setInputLocked(true);
    }
}
