import { Scene } from 'phaser';
import EventBusComponent, { CUSTOM_EVENTS } from '../components/events/EventBusComponent';
import EnemySpawnerComponent from '../components/spawners/EnemySpawnerComponent';
import { ENEMY_CONFIG } from '../config';
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
        const eventBusComponent = new EventBusComponent();
        const player = new Player(this);
        const scoutEnemySpawner = new EnemySpawnerComponent(this, eventBusComponent, ScoutEnemy, {
            minViewportXBoundaryClearance: ENEMY_CONFIG.SCOUT.SPAWN.MIN_VIEWPORT_X_BOUNDARY_CLEARANCE,
            recurringInterval: ENEMY_CONFIG.SCOUT.SPAWN.RECURRING_INTERVAL,
            initialInterval: ENEMY_CONFIG.SCOUT.SPAWN.INITIAL_INTERVAL,
        });
        const fighterEnemySpawner = new EnemySpawnerComponent(this, eventBusComponent, FighterEnemy, {
            minViewportXBoundaryClearance: ENEMY_CONFIG.FIGHTER.SPAWN.MIN_VIEWPORT_X_BOUNDARY_CLEARANCE,
            recurringInterval: ENEMY_CONFIG.FIGHTER.SPAWN.RECURRING_INTERVAL,
            initialInterval: ENEMY_CONFIG.FIGHTER.SPAWN.INITIAL_INTERVAL,
        });

        this.physics.add.overlap(player, scoutEnemySpawner.spawnGroup, (playerGameObject, enemyGameObject) => {
            if (!(playerGameObject instanceof Player) || !(enemyGameObject instanceof ScoutEnemy)) {
                return;
            }

            playerGameObject.colliderComponent.collideWithEnemyShip();
            enemyGameObject.colliderComponent.collideWithEnemyShip();
        });
        this.physics.add.overlap(player, fighterEnemySpawner.spawnGroup, (playerGameObject, enemyGameObject) => {
            if (!(playerGameObject instanceof Player) || !(enemyGameObject instanceof FighterEnemy)) {
                return;
            }

            playerGameObject.colliderComponent.collideWithEnemyShip();
            enemyGameObject.colliderComponent.collideWithEnemyShip();
        });
        // NOTE: Phaser always passes an independent sprite first, followed by a sprite from a sprite group.
        eventBusComponent.on(CUSTOM_EVENTS.ENEMY_INIT, (enemyGameObject: Phaser.GameObjects.GameObject) => {
            if (!(enemyGameObject instanceof FighterEnemy)) {
                return;
            }

            const fighterEnemy = enemyGameObject as FighterEnemy;
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
        });
        this.physics.add.overlap(
            scoutEnemySpawner.spawnGroup,
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
            fighterEnemySpawner.spawnGroup,
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
