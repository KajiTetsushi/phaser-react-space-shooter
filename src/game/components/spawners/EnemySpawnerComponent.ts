import { type GameObjects, Math as MathUtils, Physics, type Scene, Scenes } from 'phaser';
import { ENEMY_OFFSCREEN_FLIGHT_PATTERN_SPAWN_Y_CONFIG } from '../../config';
import type { EnemyConstructor, EnemyInstance } from '../../objects/enemies/enemies.types';
import type { GetGameObjectPosition } from '../../objects/objects.types';
import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';

export type EnemySpawnerConfig = Readonly<{
    // TODO: Consider adding some variance to the spawn interval and max center x offset to make the game feel less predictable.
    // interval: 2000,
    // intervalVariance: 0.5,
    maxOnScreen?: number;
    minViewportY?: number;
    maxViewportY?: number;
    minViewportXBoundaryClearance: number;
    recurringInterval: number;
    initialInterval: number;
}>;

export default class EnemySpawnerComponent {
    #scene: Scene;

    #config: EnemySpawnerConfig;
    #intervalCountdown: number;
    #group: GameObjects.Group;
    #disabled = false;

    constructor(
        scene: Scene,
        eventBusComponent: EventBusComponent,
        getPlayerPosition: GetGameObjectPosition,
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
                enemy.initialize(eventBusComponent, getPlayerPosition);
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

        eventBusComponent.on(CUSTOM_EVENTS.GAME_OVER, () => {
            this.#disabled = true;
        });
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
        if (this.#disabled) {
            return;
        }

        const { maxOnScreen } = this.#config;
        const activeEnemyCount = this.#group.getChildren().filter((enemy) => enemy.active).length;
        if (maxOnScreen && activeEnemyCount >= maxOnScreen) {
            return;
        }

        this.#intervalCountdown -= delta;

        if (this.#intervalCountdown > 0) {
            return;
        }

        const { x, y } = this.spawnCoords;
        // Find unspawned/despawned enemy from the resource pool to respawn.
        const enemy: EnemyInstance = this.#group.get(x, y);
        enemy.reset();
        this.#intervalCountdown = this.#config.recurringInterval;
    }

    get spawnCoords() {
        const x = MathUtils.RND.between(
            this.#config.minViewportXBoundaryClearance,
            this.#scene.scale.width - this.#config.minViewportXBoundaryClearance,
        );

        const { minViewportY, maxViewportY } = this.#config;
        const y =
            minViewportY && maxViewportY
                ? MathUtils.RND.between(this.#config.minViewportY ?? 0, this.#config.maxViewportY ?? 0)
                : ENEMY_OFFSCREEN_FLIGHT_PATTERN_SPAWN_Y_CONFIG;

        return {
            x,
            y,
        };
    }
}
