import { GameObjects } from 'phaser';
import type EventBusComponent from '../../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../../components/events/EventBusComponent';
import { ENEMY_CONFIG } from '../../config';
import type { EnemyInstance } from '../enemies/types';

const ENEMY_SCORES = {
    ScoutEnemy: ENEMY_CONFIG.SCOUT.SCORE,
    FighterEnemy: ENEMY_CONFIG.FIGHTER.SCORE,
};

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
            this.#score += ENEMY_SCORES[enemy.constructor.name as keyof typeof ENEMY_SCORES];
            this.setText(this.#score.toString());
        });
    }
}
