import { Scene } from 'phaser';

export default class PreloadScene extends Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.pack('asset_pack', 'assets/data/assets.json');
    }

    create() {
        this.scene.start('GameScene');
    }
}
