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
        const player = new Player(this);
        const scoutEnemy = new ScoutEnemy(this, this.scale.width / 2, 20);
        const fighterEnemy = new FighterEnemy(this, this.scale.width / 2, 20);
    }
}
