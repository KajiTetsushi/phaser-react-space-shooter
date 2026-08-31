import { type GameObjects, Math as PhaserMath, Physics, type Scene, Scenes } from 'phaser';
import SimpleEnemy, { type SimpleEnemyConfig } from '../../objects/enemies/SimpleEnemy';
import type Player from '../../objects/player/Player';
import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';

/**
 * @deprecated
 */
const ENEMY_OFFSCREEN_FLIGHT_PATTERN_SPAWN_Y_CONFIG = -20;

export type SimpleEnemySpawnerComponentConfig = {
    // TODO: Consider adding some variance to the spawn interval and max center x offset to make the game feel less predictable.
    // interval: 2000,
    // intervalVariance: 0.5,
    maxOnScreen?: number;
    minViewportY?: number;
    maxViewportY?: number;
    minViewportXBoundaryClearance?: number;
    recurringInterval?: number;
    initialInterval?: number;
    unit?: SimpleEnemyConfig;
};

export default class SimpleEnemySpawnerComponent {
    #scene: Scene;
    #eventBusComponent: EventBusComponent;
    #player: Player;
    #disabled = false;
    #intervalCountdown: number;
    #spawnGroup: GameObjects.Group;
    #config?: SimpleEnemySpawnerComponentConfig | null = null;

    constructor(
        private scene: Scene,
        eventBusComponent: EventBusComponent,
        player: Player,
        config?: SimpleEnemySpawnerComponentConfig,
    ) {
        this.#scene = scene;
        this.#player = player;
        this.#eventBusComponent = eventBusComponent;
        this.#config = config ?? null;
        this.#intervalCountdown = this.#config?.initialInterval ?? 0;

        this.#spawnGroup = this.scene.add.group({
            name: `${this.constructor.name}-${PhaserMath.RND.uuid()}`,
            classType: SimpleEnemy,
            runChildUpdate: true,
            createCallback: (item) => {
                const enemy = item as SimpleEnemy;
                enemy.initialize(this.#eventBusComponent, this.#player, this.#config?.unit);
            },
        });

        this.#setupEventHandlers();
    }

    #setupEventHandlers() {
        this.#scene.physics.world.on(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);

        this.#scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.#scene.events.once(
            Scenes.Events.DESTROY,
            () => {
                this.#scene.events.off(Scenes.Events.UPDATE, this.update, this);
                this.#scene.physics.world.off(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
            },
            this,
        );

        this.#eventBusComponent.on(CUSTOM_EVENTS.GAME_OVER, this.reset, this);
    }

    get spawnGroup() {
        return this.#spawnGroup;
    }

    reset(): void {
        this.#disabled = true;
    }

    worldStep(_delta: number) {
        this.#spawnGroup.getChildren().forEach((child) => {
            const enemy = child as SimpleEnemy;
            if (!enemy.active) {
                return;
            }

            // TODO: Check out what happens when we remove this magic number offset.
            if (enemy.y > this.#scene.scale.height + 50) {
                enemy.setActive(false);
                enemy.setVisible(false);
            }
        });
    }

    update(_time: number, delta: number) {
        if (this.#disabled) {
            return;
        }

        const maxOnScreen = this.#config?.maxOnScreen;
        const activeEnemyCount = this.#spawnGroup.getChildren().filter((children) => children.active).length;
        if (maxOnScreen && activeEnemyCount >= maxOnScreen) {
            return;
        }

        this.#intervalCountdown -= delta;
        if (this.#intervalCountdown > 0) {
            return;
        }

        const { x, y } = this.spawnCoords;
        // Find unspawned/despawned enemy from the resource pool to respawn.
        const enemy: SimpleEnemy = this.#spawnGroup.get(x, y);
        enemy.reset();

        this.#intervalCountdown = this.#config?.recurringInterval ?? 0;
    }

    get spawnCoords() {
        const x = PhaserMath.RND.between(
            this.#config?.minViewportXBoundaryClearance ?? 0,
            this.#scene.scale.width - (this.#config?.minViewportXBoundaryClearance ?? 0),
        );

        const { minViewportY, maxViewportY } = this.#config || {};
        const y =
            minViewportY && maxViewportY
                ? PhaserMath.RND.between(this.#config?.minViewportY ?? 0, this.#config?.maxViewportY ?? 0)
                : // TODO: Find a way to not need this magic number offset.
                  ENEMY_OFFSCREEN_FLIGHT_PATTERN_SPAWN_Y_CONFIG;

        return {
            x,
            y,
        };
    }
}
