import { Math as MathUtils, type Scene } from 'phaser';
import type { EnemyInstance } from '../../objects/enemies/types';
import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';

export default class EnemyDestroyedSpawnerComponent {
    #scene: Scene;
    #eventBusComponent: EventBusComponent;
    #group: Phaser.GameObjects.Group;

    constructor(scene: Scene, eventBusComponent: EventBusComponent) {
        this.#scene = scene;
        this.#eventBusComponent = eventBusComponent;

        this.#group = scene.add.group({
            name: `${this.constructor.name}-${MathUtils.RND.uuid()}`,
        });

        this.#eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, (enemy: EnemyInstance) => {
            const gameObject = this.#group.get(enemy.x, enemy.y, enemy.shipAssetKey, 0);
            gameObject.play({
                key: enemy.shipDestroyedAnimationKey,
            });
        });
    }
}
