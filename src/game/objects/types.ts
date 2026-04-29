import type { GameObjects } from 'phaser';

export type GameObjectPosition = Pick<GameObjects.Container, 'x' | 'y'>;

export type GetGameObjectPosition = () => GameObjectPosition;
