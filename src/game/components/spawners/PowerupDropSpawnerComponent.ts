import { type GameObjects, Math as PhaserMath, Physics, type Scene } from 'phaser';

import type { EnemyInstance } from '../../objects/enemies/enemies.types';
import PowerupDrop from '../../objects/enemies/PowerupDrop';
import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';

export default class PowerupDropSpawnerComponent {
    #scene: Scene;
    #eventBusComponent: EventBusComponent;
    #group: GameObjects.Group;
    #disabled = false;

    constructor(scene: Scene, eventBusComponent: EventBusComponent) {
        this.#scene = scene;
        this.#eventBusComponent = eventBusComponent;

        this.#group = this.#scene.add.group({
            name: `${this.constructor.name}-${PhaserMath.RND.uuid()}`,
            classType: PowerupDrop,
            runChildUpdate: true,
            createCallback: (item) => {
                const powerupDrop = item as PowerupDrop;
                powerupDrop.initialize(this.#eventBusComponent);
            },
        });

        this.#scene.physics.world.on(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);

        this.#eventBusComponent.on(CUSTOM_EVENTS.POWERUP_DESTROYED, this.spawnPowerupDrop, this);

        eventBusComponent.on(CUSTOM_EVENTS.GAME_OVER, () => {
            this.#disabled = true;
        });
    }

    get spawnGroup() {
        return this.#group;
    }

    spawnPowerupDrop(powerupEnemy: EnemyInstance) {
        if (this.#disabled) {
            return;
        }

        const powerupDrop: PowerupDrop = this.#group.get(powerupEnemy.x, powerupEnemy.y, powerupEnemy.shipAssetKey, 0);

        powerupDrop.reset();
    }

    worldStep(_delta: number) {
        this.#group.getChildren().forEach((child) => {
            const powerupDrop = child as PowerupDrop;
            if (!powerupDrop.active) {
                return;
            }

            if (powerupDrop.y > this.#scene.scale.height + powerupDrop.height) {
                powerupDrop.setActive(false);
                powerupDrop.setVisible(false);
            }
        });
    }
}
