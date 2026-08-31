import { type GameObjects, Math as MathUtils, type Scene } from 'phaser';

import type { EnemyInstance } from '../../objects/enemies/enemies.types';
import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';

export default class SimpleEnemyDestroyedSpawnerComponent {
    #scene: Scene;
    #eventBusComponent: EventBusComponent;
    #group: GameObjects.Group;

    constructor(scene: Scene, eventBusComponent: EventBusComponent) {
        this.#scene = scene;
        this.#eventBusComponent = eventBusComponent;

        this.#group = this.#scene.add.group({
            name: `${this.constructor.name}-${MathUtils.RND.uuid()}`,
        });

        this.#eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, (enemy: EnemyInstance) => {
            const gameObject: GameObjects.Sprite | null = this.#group.get(
                enemy.x,
                enemy.y,
                enemy.shipSpriteAssetKey,
                0,
            );

            if (enemy.shipDestroyedSpriteAnimationKey) {
                gameObject
                    ?.play(enemy.shipDestroyedSpriteAnimationKey)
                    ?.setScale(enemy.shipDestroyedSpriteAnimationXScale, enemy.shipDestroyedSpriteAnimationYScale)
                    ?.setAngle(enemy.shipAngle);
            }

            this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_EXPLOSION, enemy.shipDestroyedSoundKey);
        });
    }
}
