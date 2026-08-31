import { GameObjects, Math as MathUtils, Physics } from 'phaser';

import assert from '../../utils/assert';
import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';
import type InputComponent from '../input/InputComponent';

export type WeaponConfig = {
    /**
     * In milliseconds. The minimum time between firing two consecutive projectiles. This is used to control the firing rate of the weapon, preventing it from firing too rapidly and overwhelming the game with too many projectiles at once.
     */
    weaponCooldown?: number;
    weaponReport?: string;
    weaponCluster?: number;
    weaponClusterOffset?: number;
    projectileAnimationKey?: string;
    projectileHitboxSize?: {
        w?: number;
        h?: number;
    };
    /**
     * In seconds. The time it takes for a projectile to disappear after being propelled.
     * This is used to determine how long a projectile should remain active before being despawned and returned to the pool for reuse.
     */
    projectileLifespan?: number;
    projectileScale?: number;
    projectileSpawnPoolSize?: number;
    projectileSpeed?: number;
    trajectoryYOffset?: number;
    trajectoryFlipY?: boolean;
};

export default class WeaponComponent {
    #gameObject: GameObjects.Container;
    #eventBusComponent: EventBusComponent;
    #inputComponent: InputComponent;
    #config?: WeaponConfig | null = null;
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
        config: WeaponConfig,
    ) {
        this.#gameObject = gameObject;
        this.#inputComponent = inputComponent;
        this.#eventBusComponent = eventBusComponent;
        this.#config = config;

        this.#projectileGroup = this.#gameObject.scene.physics.add.group({
            name: `projectiles-${MathUtils.RND.uuid()}`,
            enable: false,
        });
        this.#projectileGroup.createMultiple({
            key: 'projectile',
            quantity: this.#config?.projectileSpawnPoolSize,
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

    updateWeaponConfig(config: Partial<WeaponConfig>) {
        if (!this.#config) {
            this.#config = config;
        } else {
            this.#config = {
                ...this.#config,
                ...config,
            };
        }
    }

    /**
     * Called on each frame of the game loop to update the state of the weapon component.
     * @param delta Timestep, in milliseconds, tied to the browser `requestAnimationFrame` callback, or roughly 60 times per second.
     */
    update(_time: number, delta: number) {
        this.#propelProjectiles(delta);
    }

    #propelProjectiles(delta: number) {
        this.#propelProjectileInterval -= delta;

        if (this.#propelProjectileInterval > 0) {
            return;
        }

        if (!this.#inputComponent.shoot) {
            return;
        }

        const { weaponCluster = 1, weaponClusterOffset = 0 } = this.#config ?? {};

        for (let iteration = 0; iteration < weaponCluster; iteration++) {
            const weaponBurstSequence = iteration % weaponCluster;
            const xOffset = (() => {
                if (weaponBurstSequence === 0) {
                    return 0;
                } else if (weaponBurstSequence < weaponCluster / 2) {
                    return weaponBurstSequence * weaponClusterOffset;
                } else {
                    return (weaponCluster - weaponBurstSequence) * -weaponClusterOffset;
                }
            })();
            this.#propelProjectile(xOffset);
        }

        this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_SHOOT, this.#config?.weaponReport);
    }

    #propelProjectile(xOffset: number = 0) {
        // Get the first inactive projectile from the pool and propel it.
        const projectile: Physics.Arcade.Sprite | undefined = this.#projectileGroup.getFirstDead(false);

        if (projectile == null) {
            return;
        }

        const x = this.#gameObject.x + xOffset;
        const y = this.#gameObject.y + (this.#config?.trajectoryYOffset ?? 0);
        projectile.enableBody(true, x, y, true, true);

        const { body } = projectile;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        body.velocity.y -= this.#config?.projectileSpeed ?? 0;
        body.setSize(this.#config?.projectileHitboxSize?.w, this.#config?.projectileHitboxSize?.h);

        projectile.setState(this.#config?.projectileLifespan ?? 0);
        projectile.play(this.#config?.projectileAnimationKey ?? '');
        projectile.setScale(this.#config?.projectileScale ?? 0);
        projectile.setFlipY(this.#config?.trajectoryFlipY ?? false);

        this.#propelProjectileInterval = this.#config?.weaponCooldown ?? 0;
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
