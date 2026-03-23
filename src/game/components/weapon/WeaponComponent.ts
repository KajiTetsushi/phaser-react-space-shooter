import { GameObjects, Math as PhaserMath, Physics } from 'phaser';
import type InputComponent from '../input/InputComponent';

type BulletConfig = {
    speed: number;
    /**
     * In milliseconds. The minimum time between firing two consecutive bullets. This is used to control the firing rate of the weapon, preventing it from firing too rapidly and overwhelming the game with too many bullets at once.
     */
    interval: number;
    /**
     * In seconds. The time it takes for a bullet to disappear after being fired.
     * This is used to determine how long a bullet should remain active before being despawned and returned to the pool for reuse.
     */
    lifespan: number;
    maxCount: number;
    yOffset: number;
    flipY: boolean;
};

export default class WeaponComponent {
    #gameObject: GameObjects.Container;
    #inputComponent: InputComponent;
    #bulletConfig: BulletConfig;
    /**
     * Group to manage bullets fired by this weapon. It serves as a pool of bullet sprites that can be reused to optimize performance.
     */
    #bulletGroup: Physics.Arcade.Group;
    /**
     * Countdown timer for firing bullets. When it reaches 0, a bullet can be fired and the timer is reset to the interval value.
     */
    #fireBulletInterval: number = 0;

    constructor(gameObject: GameObjects.Container, inputComponent: InputComponent, bulletConfig: BulletConfig) {
        this.#gameObject = gameObject;
        this.#inputComponent = inputComponent;
        this.#bulletConfig = bulletConfig;

        this.#bulletGroup = this.#gameObject.scene.physics.add.group({
            name: `bullets-${PhaserMath.RND.uuid()}`,
            enable: false,
        });
        this.#bulletGroup.createMultiple({
            key: 'bullet',
            quantity: this.#bulletConfig.maxCount,
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

    /**
     * Called on each frame of the game loop to update the state of the weapon component.
     * @param delta Timestep, in milliseconds, tied to the browser `requestAnimationFrame` callback, or roughly 60 times per second.
     */
    update(delta: number) {
        this.#fireBullet(delta);
    }

    #fireBullet(delta: number) {
        this.#fireBulletInterval -= delta;

        if (this.#fireBulletInterval > 0) {
            return;
        }

        if (!this.#inputComponent.shootIsDown) {
            return;
        }

        // Get the first inactive bullet from the pool and fire it.
        const bullet: Physics.Arcade.Sprite | undefined = this.#bulletGroup.getFirstDead(false);

        if (bullet == null) {
            return;
        }

        const x = this.#gameObject.x;
        const y = this.#gameObject.y + this.#bulletConfig.yOffset;
        bullet.enableBody(true, x, y, true, true);
        if (bullet.body instanceof Physics.Arcade.Body) {
            bullet.body.velocity.y -= this.#bulletConfig.speed;
            bullet.body.setSize(14, 18);
        }
        bullet.setState(this.#bulletConfig.lifespan);
        bullet.play('bullet');
        bullet.setScale(0.8);
        bullet.setFlipY(this.#bulletConfig.flipY);

        this.#fireBulletInterval = this.#bulletConfig.interval;
    }

    /**
     * Called on each physics world step to update the lifespan of each bullet.
     * @param delta Timestep, in seconds, since the last world step, fixed to exactly 60Hz a.k.a. 1/60th of a second.
     */
    worldStep(delta: number) {
        const bullets = this.#bulletGroup.getChildren() as Physics.Arcade.Sprite[];
        bullets.forEach(this.#decayBulletLifespan(delta));
    }

    #decayBulletLifespan(delta: number) {
        return (bullet: Physics.Arcade.Sprite) => {
            if (!bullet.active) {
                return;
            }

            if (typeof bullet.state !== 'number') {
                return;
            }

            // Decrease the bullet's remaining lifespan.
            // If it reaches 0, despawn the bullet.
            // The bullet will be put back to the pool and can be reused by future shots.
            bullet.state -= delta;
            if (bullet.state <= 0) {
                bullet.disableBody(true, true);
            }
        };
    }
}
