import { type GameObjects, Math as PhaserMath, Physics, type Scene, Scenes } from 'phaser';
import SimpleEnemy, { type SimpleEnemyConfig } from '../../objects/enemies/SimpleEnemy';
import type Player from '../../objects/player/Player';
import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';

export type SimpleEnemySpawnerComponentConfig = {
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
        scene: Scene,
        eventBusComponent: EventBusComponent,
        player: Player,
        config?: SimpleEnemySpawnerComponentConfig,
    ) {
        this.#scene = scene;
        this.#player = player;
        this.#eventBusComponent = eventBusComponent;
        this.#config = config ?? null;
        this.#intervalCountdown = this.#config?.initialInterval ?? 0;

        this.#spawnGroup = this.#scene.add.group({
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

            // Stop consuming update loop resources unnecessarily when
            // the enemy as soon as the enemy leaves the bottom of the screen
            // since it's not visible to the player, anyway.
            const enemyHeight = this.#config?.unit?.hitboxHeight ?? 0;
            if (enemy.y > this.#scene.scale.height + enemyHeight) {
                enemy.deactivate();
            }
        });
    }

    update(_time: number, delta: number) {
        this.spawnSimpleEnemy(delta);
    }

    private spawnSimpleEnemy(delta: number) {
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

        const { x, y } = SimpleEnemySpawnerComponent.getSpawnCoords({
            config: this.#config,
            scene: this.#scene,
        });

        // Find unspawned/despawned enemy from the resource pool to respawn.
        const enemy: SimpleEnemy = this.#spawnGroup.get(x, y);
        enemy.reset();

        this.#intervalCountdown = this.#config?.recurringInterval ?? 0;
    }

    static getSpawnCoords = ({
        config,
        scene,
    }: {
        config: SimpleEnemySpawnerComponentConfig | null | undefined;
        scene: Scene;
    }) => {
        const x = PhaserMath.RND.between(
            config?.minViewportXBoundaryClearance ?? 0,
            scene.scale.width - (config?.minViewportXBoundaryClearance ?? 0),
        );

        // We let content authoring allow the unit to spawn in either-or:
        // 1. the given range
        // 2. always off-screen from the top
        const { minViewportY, maxViewportY } = config || {};
        const y =
            minViewportY && maxViewportY
                ? PhaserMath.RND.between(config?.minViewportY ?? 0, config?.maxViewportY ?? 0)
                : (config?.unit?.hitboxHeight ?? 0) * -1;

        return {
            x,
            y,
        };
    };
}
