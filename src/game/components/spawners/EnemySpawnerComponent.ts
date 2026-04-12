import { type GameObjects, Math as MathUtils, Physics, type Scene, Scenes } from 'phaser';
import type { EnemyConstructor, EnemyInstance } from '../../objects/enemies/types';
import type EventBusComponent from '../events/EventBusComponent';

export type EnemySpawnerConfig = Readonly<{
    // TODO: Consider adding some variance to the spawn interval and max center x offset to make the game feel less predictable.
    // interval: 2000,
    // intervalVariance: 0.5,
    // maxOnScreen: 5,
    minViewportXBoundaryClearance: number;
    recurringInterval: number;
    initialInterval: number;
}>;

export default class EnemySpawnerComponent {
    #scene: Scene;

    #config: EnemySpawnerConfig;
    #intervalCountdown: number;
    #group: GameObjects.Group;

    constructor(
        scene: Scene,
        eventBusComponent: EventBusComponent,
        spawnClass: EnemyConstructor,
        spawnConfig: EnemySpawnerConfig,
    ) {
        this.#scene = scene;

        this.#config = spawnConfig;
        this.#intervalCountdown = this.#config.initialInterval;

        this.#group = this.#scene.add.group({
            name: `${this.constructor.name}-${MathUtils.RND.uuid()}`,
            classType: spawnClass,
            runChildUpdate: true,
            createCallback: (item) => {
                const enemy = item as EnemyInstance;
                enemy.initialize(eventBusComponent);
            },
        });

        this.#scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.#scene.physics.world.on(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
        this.#scene.events.once(
            Scenes.Events.DESTROY,
            () => {
                this.#scene.events.off(Scenes.Events.UPDATE, this.update, this);
                this.#scene.physics.world.off(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
            },
            this,
        );
    }

    get spawnGroup() {
        return this.#group;
    }

    worldStep(_delta: number) {
        this.#group.getChildren().forEach((child) => {
            const enemy = child as EnemyInstance;
            if (!enemy.active) {
                return;
            }

            if (enemy.y > this.#scene.scale.height + 50) {
                enemy.setActive(false);
                enemy.setVisible(false);
            }
        });
    }

    update(_timestamp: number, delta: number) {
        this.#intervalCountdown -= delta;

        if (this.#intervalCountdown > 0) {
            return;
        }

        const x = MathUtils.RND.between(
            this.#config.minViewportXBoundaryClearance,
            this.#scene.scale.width - this.#config.minViewportXBoundaryClearance,
        );
        const enemy: EnemyInstance = this.#group.get(x, -20);
        enemy.reset();
        this.#intervalCountdown = this.#config.recurringInterval;
    }
}
