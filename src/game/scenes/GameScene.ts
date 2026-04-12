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

        this.physics.add.overlap(player, scoutEnemy, (playerGameObject, enemyGameObject) => {
            if (!(playerGameObject instanceof Player) || !(enemyGameObject instanceof ScoutEnemy)) {
                return;
            }

            playerGameObject.colliderComponent.collideWithEnemyShip();
            enemyGameObject.colliderComponent.collideWithEnemyShip();
        });
        this.physics.add.overlap(player, fighterEnemy, (playerGameObject, enemyGameObject) => {
            if (!(playerGameObject instanceof Player) || !(enemyGameObject instanceof FighterEnemy)) {
                return;
            }

            playerGameObject.colliderComponent.collideWithEnemyShip();
            enemyGameObject.colliderComponent.collideWithEnemyShip();
        });
        // NOTE: Phaser always passes an independent sprite first, followed by a sprite from a sprite group.
        this.physics.add.overlap(
            player,
            fighterEnemy.projectileGroup,
            (playerGameObject, enemyProjectileGameObject) => {
                console.log('player collided with enemy projectile', playerGameObject, enemyProjectileGameObject);
            },
        );
        this.physics.add.overlap(
            fighterEnemy,
            player.projectileGroup,
            (enemyGameObject, playerProjectileGameObject) => {
                console.log('enemy collided with player projectile', enemyGameObject, playerProjectileGameObject);
            },
        );
    }
}
