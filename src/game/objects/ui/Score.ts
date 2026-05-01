import { GameObjects } from 'phaser';
import type EventBusComponent from '../../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../../components/events/EventBusComponent';
import type { EnemyInstance } from '../enemies/enemies.types';

export default class Score extends GameObjects.Text {
    #score: number;
    #eventBusComponent: EventBusComponent;

    constructor(scene: Phaser.Scene, eventBusComponent: EventBusComponent) {
        super(scene, scene.scale.width / 2, 20, '0', {
            fontSize: '24px',
            color: '#ff2f66',
        });

        this.scene.add.existing(this);
        this.#eventBusComponent = eventBusComponent;
        this.#score = 0;
        this.setOrigin();

        this.#eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, (enemy: EnemyInstance) => {
            this.#score += enemy.score;
            this.setText(this.#score.toString());
        });
    }
}
