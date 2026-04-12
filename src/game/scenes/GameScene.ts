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
                if (
                    !(playerGameObject instanceof Player) ||
                    !(enemyProjectileGameObject instanceof Phaser.Physics.Arcade.Sprite)
                ) {
                    return;
                }

                fighterEnemy.weaponComponent.destroyProjectile(enemyProjectileGameObject);
                playerGameObject.colliderComponent.collideWithEnemyProjectile();
            },
        );
        this.physics.add.overlap(
            // TODO: Scale up.
            scoutEnemy,
            player.projectileGroup,
            (enemyGameObject, playerProjectileGameObject) => {
                if (
                    !(enemyGameObject instanceof ScoutEnemy) ||
                    !(playerProjectileGameObject instanceof Phaser.Physics.Arcade.Sprite)
                ) {
                    return;
                }

                player.weaponComponent.destroyProjectile(playerProjectileGameObject);
                enemyGameObject.colliderComponent.collideWithEnemyProjectile();
            },
        );
        this.physics.add.overlap(
            fighterEnemy,
            player.projectileGroup,
            (enemyGameObject, playerProjectileGameObject) => {
                if (
                    !(enemyGameObject instanceof FighterEnemy) ||
                    !(playerProjectileGameObject instanceof Phaser.Physics.Arcade.Sprite)
                ) {
                    return;
                }

                player.weaponComponent.destroyProjectile(playerProjectileGameObject);
                enemyGameObject.colliderComponent.collideWithEnemyProjectile();
            },
        );
    }
}
