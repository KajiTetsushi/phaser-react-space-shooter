import { GameObjects, Math as MathUtils, Physics } from 'phaser';
import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';
import type InputComponent from '../input/InputComponent';

type WeaponConfig = {
    /**
     * In milliseconds. The minimum time between firing two consecutive projectiles. This is used to control the firing rate of the weapon, preventing it from firing too rapidly and overwhelming the game with too many projectiles at once.
     */
    weaponCooldown: number | { min: number; max: number };
    weaponReport: string;
    projectileAnimationKey: string;
    projectileHitboxSize: {
        w: number;
        h: number;
    };
    /**
     * In seconds. The time it takes for a projectile to disappear after being propelled.
     * This is used to determine how long a projectile should remain active before being despawned and returned to the pool for reuse.
     */
    projectileLifespan: number;
    projectileScale: number;
    projectileSpawnPoolSize: number;
    projectileSpeed: number;
    trajectoryYOffset: number;
    trajectoryFlipY: boolean;
};

export default class WeaponComponent {
    #gameObject: GameObjects.Container;
    #eventBusComponent: EventBusComponent;
    #inputComponent: InputComponent;
    #weaponConfig: WeaponConfig;
    /**
     * Group to manage projectiles propelled by this weapon. It serves as a pool of projectile sprites that can be reused to optimize performance.
     */
    #projectileGroup: Physics.Arcade.Group;
    /**
     * Countdown timer for firing projectiles. When it reaches 0, a projectile can be propelled and the timer is reset to the interval value.
     */
    #propelProjectileInterval: number = 0;

    constructor(
        gameObject: GameObjects.Container,
        inputComponent: InputComponent,
        eventBusComponent: EventBusComponent,
        projectileConfig: WeaponConfig,
    ) {
        this.#gameObject = gameObject;
        this.#inputComponent = inputComponent;
        this.#eventBusComponent = eventBusComponent;
        this.#weaponConfig = projectileConfig;

        this.#projectileGroup = this.#gameObject.scene.physics.add.group({
            name: `projectiles-${MathUtils.RND.uuid()}`,
            enable: false,
        });
        this.#projectileGroup.createMultiple({
            key: 'projectile',
            quantity: this.#weaponConfig.projectileSpawnPoolSize,
            active: false,
            visible: false,
        });

        this.#gameObject.scene.physics.world.on(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
        this.#gameObject.once(
            GameObjects.Events.DESTROY,
            () => {
                this.#gameObject.scene.physics.world.off(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
            },
            this,
        );
    }

    get projectileGroup() {
        return this.#projectileGroup;
    }

    /**
     * Called on each frame of the game loop to update the state of the weapon component.
     * @param delta Timestep, in milliseconds, tied to the browser `requestAnimationFrame` callback, or roughly 60 times per second.
     */
    update(delta: number) {
        this.#propelProjectile(delta);
    }

    #propelProjectile(delta: number) {
        this.#propelProjectileInterval -= delta;

        if (this.#propelProjectileInterval > 0) {
            return;
        }

        if (!this.#inputComponent.shootIsDown) {
            return;
        }

        // Get the first inactive projectile from the pool and propel it.
        const projectile: Physics.Arcade.Sprite | undefined = this.#projectileGroup.getFirstDead(false);

        if (projectile == null) {
            return;
        }

        const x = this.#gameObject.x;
        const y = this.#gameObject.y + this.#weaponConfig.trajectoryYOffset;
        projectile.enableBody(true, x, y, true, true);
        if (projectile.body instanceof Physics.Arcade.Body) {
            projectile.body.velocity.y -= this.#weaponConfig.projectileSpeed;
            projectile.body.setSize(
                this.#weaponConfig.projectileHitboxSize.w,
                this.#weaponConfig.projectileHitboxSize.h,
            );
        }
        projectile.setState(this.#weaponConfig.projectileLifespan);
        projectile.play(this.#weaponConfig.projectileAnimationKey);
        projectile.setScale(this.#weaponConfig.projectileScale);
        projectile.setFlipY(this.#weaponConfig.trajectoryFlipY);

        this.#propelProjectileInterval =
            typeof this.#weaponConfig.weaponCooldown === 'number'
                ? this.#weaponConfig.weaponCooldown
                : MathUtils.RND.between(this.#weaponConfig.weaponCooldown.min, this.#weaponConfig.weaponCooldown.max);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_SHOOT, this.#weaponConfig.weaponReport);
    }

    /**
     * Called on each physics world step to update the lifespan of each projectile.
     * @param delta Timestep, in seconds, since the last world step, fixed to exactly 60Hz a.k.a. 1/60th of a second.
     */
    worldStep(delta: number) {
        const projectiles = this.#projectileGroup.getChildren() as Physics.Arcade.Sprite[];
        projectiles.forEach(this.#decayProjectileLifespan(delta));
    }

    #decayProjectileLifespan(delta: number) {
        return (projectile: Physics.Arcade.Sprite) => {
            if (!projectile.active) {
                return;
            }

            if (typeof projectile.state !== 'number') {
                return;
            }

            // Decrease the projectile's remaining lifespan.
            // If it reaches 0, despawn the projectile.
            // The projectile will be put back to the pool and can be reused by future shots.
            projectile.state -= delta;
            if (projectile.state <= 0) {
                projectile.disableBody(true, true);
            }
        };
    }

    destroyProjectile(projectile: Physics.Arcade.Sprite) {
        projectile.setState(0);
    }
}
