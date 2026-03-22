import { CANVAS, Game, Scale, type Types } from 'phaser';
import { Game as MainGame } from './scenes/Game';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: CANVAS,
    pixelArt: true,
    roundPixels: true,
    scale: {
        parent: 'game-container',
        width: 450,
        height: 640,
        autoCenter: Scale.CENTER_BOTH,
        mode: Scale.HEIGHT_CONTROLS_WIDTH,
    },
    backgroundColor: '#000000',
    scene: [MainGame],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0,
            },
        },
    },
};

const startGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default startGame;
