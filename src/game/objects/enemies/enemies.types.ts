import type { GameObjects, Scene } from 'phaser';
import type EventBusComponent from '../../components/events/EventBusComponent';
import type Player from '../player/Player';

export interface EnemyImplementable {
    get score(): number | undefined;
    get shipSpriteAssetKey(): string | undefined;
    get shipDestroyedSpriteAnimationKey(): string | undefined;
    get shipDestroyedSpriteAnimationXScale(): number | undefined;
    get shipDestroyedSpriteAnimationYScale(): number | undefined;
    get shipDestroyedSoundKey(): string | undefined;
    get shipAngle(): number;
    initialize(eventBusComponent: EventBusComponent, player: Player): void;
    reset(): void;
}

export type EnemyInstance = GameObjects.Container & EnemyImplementable;
export type EnemyConstructor = new (scene: Scene, x: number, y: number) => EnemyInstance;
