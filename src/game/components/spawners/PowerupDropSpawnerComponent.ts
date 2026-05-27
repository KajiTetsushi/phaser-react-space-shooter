import type { EnemyInstance } from '../../objects/enemies/enemies.types';
import PowerupDrop from '../../objects/enemies/PowerupDrop';
import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';

export default class PowerupDropSpawnerComponent {
    #scene: Phaser.Scene;
    #eventBusComponent: EventBusComponent;
    #group: Phaser.GameObjects.Group;
    #disabled = false;

    constructor(scene: Phaser.Scene, eventBusComponent: EventBusComponent) {
        this.#scene = scene;
        this.#eventBusComponent = eventBusComponent;

        this.#group = this.#scene.add.group({
            name: `${this.constructor.name}-${Phaser.Math.RND.uuid()}`,
            classType: PowerupDrop,
            runChildUpdate: true,
            createCallback: (item) => {
                console.log('PowerupDrop created');
                const powerupDrop = item as PowerupDrop;
                powerupDrop.initialize(this.#eventBusComponent);
            },
        });

        this.#scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.#scene.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);

        this.#eventBusComponent.on(CUSTOM_EVENTS.POWERUP_DESTROYED, this.spawnPowerupDrop, this);
    }

    get spawnGroup() {
        return this.#group;
    }

    spawnPowerupDrop(powerupEnemy: EnemyInstance) {
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

    update() {
        if (this.#disabled) {
            return;
        }
    }
}
