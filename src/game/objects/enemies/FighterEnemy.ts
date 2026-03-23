import { GameObjects, Physics, type Scene, Scenes } from 'phaser';
import FighterInputComponent from '../../components/input/bots/FighterInputComponent';
import type InputComponent from '../../components/input/InputComponent';
import VerticalMovementComponent from '../../components/movement/VerticalMovementComponent';
import WeaponComponent from '../../components/weapon/WeaponComponent';
import { ENEMY_CONFIG } from '../../config';

export default class FighterEnemy extends GameObjects.Container {
    #inputComponent: InputComponent;
    #verticalMovementComponent: VerticalMovementComponent;
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

        this.#inputComponent = new FighterInputComponent();
        this.#verticalMovementComponent = new VerticalMovementComponent(
            this,
            this.#inputComponent,
            ENEMY_CONFIG.FIGHTER.VERTICAL.VELOCITY,
            ENEMY_CONFIG.FIGHTER.VERTICAL.VELOCITY_MAX,
            ENEMY_CONFIG.FIGHTER.VERTICAL.DRAG,
        );
        this.#weaponComponent = new WeaponComponent(this, this.#inputComponent, {
            weaponCooldown: ENEMY_CONFIG.FIGHTER.WEAPON.WEAPON_COOLDOWN,
            projectileAnimationKey: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_ANIMATION_KEY,
            projectileHitboxSize: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_HITBOX_SIZE,
            projectileScale: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_SCALE,
            projectileSpeed: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_SPEED,
            projectileLifespan: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_LIFESPAN,
            projectileSpawnPoolSize: ENEMY_CONFIG.FIGHTER.WEAPON.PROJECTILE_SPAWN_POOL_SIZE,
            trajectoryFlipY: true,
            trajectoryYOffset: 10,
        });

        this.scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.once(
            Scenes.Events.DESTROY,
            () => {
                this.scene.events.off(Scenes.Events.UPDATE, this.update, this);
            },
            this,
        );
    }

    get weaponComponent() {
        return this.#weaponComponent;
    }

    get projectileGroup() {
        return this.weaponComponent.projectileGroup;
    }

    update(_timestamp: number, delta: number) {
        this.#inputComponent.update();
        this.#verticalMovementComponent.update();
        this.#weaponComponent.update(delta);
    }
}
