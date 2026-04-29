import type { GameObjects } from 'phaser';

type GameObjectPosition = Pick<GameObjects.Container, 'x' | 'y'>;

export type GetGameObjectPosition = () => GameObjectPosition;
