import { Scene } from 'phaser';
import FighterEnemy from '../objects/enemies/FighterEnemy';
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
        new FighterEnemy(this, this.scale.width / 2, 20);
    }
}
