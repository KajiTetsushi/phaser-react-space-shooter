import { Scene } from 'phaser';

export default class GameScene extends Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.pack('asset_pack', 'assets/data/assets.json');
    }

    create() {
        this.add.image(100, 100, 'ship');
    }
}
