import type { GameObjects, Scene } from 'phaser';
import type EventBusComponent from '../../components/events/EventBusComponent';

export interface EnemyImplementable {
    get score(): number;
    shipAssetKey: string;
    shipDestroyedAnimationKey: string;
    shipDestroyedSoundKey: string;
    initialize(eventBusComponent: EventBusComponent, playerPositionCallback: () => { x: number; y: number }): void;
    reset(): void;
}

export type EnemyInstance = GameObjects.Container & EnemyImplementable;
export type EnemyConstructor = new (scene: Scene, x: number, y: number) => EnemyInstance;
