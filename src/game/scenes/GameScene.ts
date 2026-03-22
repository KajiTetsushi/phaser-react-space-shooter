import { Scene } from 'phaser';
import ScoutEnemy from '../objects/enemies/ScoutEnemy';
import Player from '../objects/Player';

export default class GameScene extends Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.pack('asset_pack', 'assets/data/assets.json');
    }

    create() {
        new Player(this);
        new ScoutEnemy(this, this.scale.width / 2, 20);
    }
}
