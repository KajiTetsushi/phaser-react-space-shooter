import { Scene } from 'phaser';
import EventBusComponent, { CUSTOM_EVENTS } from '../components/events/EventBusComponent';
import EnemyDestroyedSpawnerComponent from '../components/spawners/EnemyDestroyedSpawnerComponent';
import EnemySpawnerComponent from '../components/spawners/EnemySpawnerComponent';
import { ENEMY_CONFIG } from '../config';
import AudioManager from '../objects/audio/AudioManager';
import FighterEnemy from '../objects/enemies/FighterEnemy';
import ScoutEnemy from '../objects/enemies/ScoutEnemy';
import Player from '../objects/player/Player';
import Lives from '../objects/ui/Lives';
import Score from '../objects/ui/Score';

export default class GameScene extends Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.pack('asset_pack', 'assets/data/assets.json');
    }

    create() {
        this.#createBackground();

        const eventBusComponent = new EventBusComponent();
        const player = new Player(this, eventBusComponent);

        // enemy spawners
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
        new EnemyDestroyedSpawnerComponent(this, eventBusComponent);

        // ship-to-ship and ship-to-projectile collisions
        this.physics.add.overlap(player, scoutEnemySpawner.spawnGroup, (playerGameObject, enemyGameObject) => {
            if (!(playerGameObject instanceof Player) || !(enemyGameObject instanceof ScoutEnemy)) {
                return;
            }

            if (!playerGameObject.active || !enemyGameObject.active) {
                return;
            }

            playerGameObject.colliderComponent.collideWithEnemyShip();
            enemyGameObject.colliderComponent.collideWithEnemyShip();
        });
        this.physics.add.overlap(player, fighterEnemySpawner.spawnGroup, (playerGameObject, enemyGameObject) => {
            if (!(playerGameObject instanceof Player) || !(enemyGameObject instanceof FighterEnemy)) {
                return;
            }

            if (!playerGameObject.active || !enemyGameObject.active) {
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

                    if (!playerGameObject.active || !enemyProjectileGameObject.active) {
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

                if (!enemyGameObject.active || !playerProjectileGameObject.active) {
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

                if (!enemyGameObject.active || !playerProjectileGameObject.active) {
                    return;
                }

                player.weaponComponent.destroyProjectile(playerProjectileGameObject);
                enemyGameObject.colliderComponent.collideWithEnemyProjectile();
            },
        );

        new Score(this, eventBusComponent);
        new Lives(this, eventBusComponent);
        new AudioManager(this, eventBusComponent);
    }

    #createBackground() {
        this.add.sprite(0, 0, 'bg1').setOrigin(0, 1).setAlpha(0.7).setAngle(90).setScale(1, 1.25);
        this.add.sprite(0, 0, 'bg2').setOrigin(0, 1).setAlpha(0.7).setAngle(90).setScale(1, 1.25);
        this.add.sprite(0, 0, 'bg3').setOrigin(0, 1).setAlpha(0.7).setAngle(90).setScale(1, 1.25);
    }
}
