import type { GameObjects, Scene } from 'phaser';
import type EventBusComponent from '../../components/events/EventBusComponent';
import type { GetGameObjectPosition } from '../types';

export interface EnemyImplementable {
    get score(): number;
    shipAssetKey: string;
    shipDestroyedAnimationKey: string;
    shipDestroyedSoundKey: string;
    initialize(eventBusComponent: EventBusComponent, playerPositionCallback: GetGameObjectPosition): void;
    reset(): void;
}

export type EnemyInstance = GameObjects.Container & EnemyImplementable;
export type EnemyConstructor = new (scene: Scene, x: number, y: number) => EnemyInstance;
