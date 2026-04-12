import type { GameObjects, Scene } from 'phaser';
import type EventBusComponent from '../../components/events/EventBusComponent';

export interface EnemyImplementable {
    initialize(eventBusComponent: EventBusComponent): void;
    reset(): void;
}

export type EnemyInstance = GameObjects.Container & EnemyImplementable;
export type EnemyConstructor = new (scene: Scene, x: number, y: number) => EnemyInstance;
