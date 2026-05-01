import type { GameObjects, Scene } from 'phaser';
import type EventBusComponent from '../../components/events/EventBusComponent';
import type { GameObjectImplementable, GetGameObjectPosition } from '../objects.types';

export interface EnemyImplementable extends GameObjectImplementable {
    get score(): number;
    get shipAssetKey(): string;
    get shipDestroyedAnimationKey(): string;
    get shipDestroyedAnimationScale(): number;
    get shipDestroyedSoundKey(): string;
    initialize(eventBusComponent: EventBusComponent, getPlayerPosition: GetGameObjectPosition): void;
    reset(): void;
}

export type EnemyInstance = GameObjects.Container & EnemyImplementable;
export type EnemyConstructor = new (scene: Scene, x: number, y: number) => EnemyInstance;
