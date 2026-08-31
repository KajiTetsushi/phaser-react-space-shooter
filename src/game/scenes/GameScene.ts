import { type GameObjects, Math as PhaserMath, Physics, Scene } from 'phaser';

import EventBusComponent, { CUSTOM_EVENTS } from '../components/events/EventBusComponent';
import PowerupDropSpawnerComponent from '../components/spawners/PowerupDropSpawnerComponent';
import SimpleEnemyDestroyedSpawnerComponent from '../components/spawners/SimpleEnemyDestroyedSpawnerComponent';
import SimpleEnemySpawnerComponent from '../components/spawners/SimpleEnemySpawnerComponent';
import { SIMPLE_ENEMIES } from '../config';
import AudioManager from '../objects/audio/AudioManager';
import PowerupDrop from '../objects/enemies/PowerupDrop';
import SimpleEnemy from '../objects/enemies/SimpleEnemy';
import Player from '../objects/player/Player';
import Lives from '../objects/ui/Lives';
import PauseGameManager from '../objects/ui/PauseGameManager';
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
        const spawnerComponentArgs = [this, eventBusComponent, player] as const;
        Object.entries(SIMPLE_ENEMIES).forEach(([_unitName, unitConfig]) => {
            const simpleEnemySpawnerComponent = new SimpleEnemySpawnerComponent(...spawnerComponentArgs, unitConfig);

            this.physics.add.overlap(
                player,
                simpleEnemySpawnerComponent.spawnGroup,
                (playerGameObject, simpleEnemyGameObject) => {
                    if (!(playerGameObject instanceof Player) || !(simpleEnemyGameObject instanceof SimpleEnemy)) {
                        return;
                    }

                    if (!playerGameObject.active || !simpleEnemyGameObject.active) {
                        return;
                    }

                    playerGameObject.colliderComponent.collideWithEnemyShip();
                    simpleEnemyGameObject.colliderComponent.collideWithEnemyShip();
                },
            );

            this.physics.add.overlap(
                player.projectileGroup,
                simpleEnemySpawnerComponent.spawnGroup,
                (simpleEnemyGameObject, playerProjectileGameObject) => {
                    if (
                        !(simpleEnemyGameObject instanceof SimpleEnemy) ||
                        !(playerProjectileGameObject instanceof Physics.Arcade.Sprite)
                    ) {
                        return;
                    }

                    if (!simpleEnemyGameObject.active || !playerProjectileGameObject.active) {
                        return;
                    }

                    player.weaponComponent.destroyProjectile(playerProjectileGameObject);
                    simpleEnemyGameObject.colliderComponent.collideWithEnemyProjectile();
                },
            );
        });
        const powerupDropSpawner = new PowerupDropSpawnerComponent(this, eventBusComponent);
        new SimpleEnemyDestroyedSpawnerComponent(this, eventBusComponent);

        // ship-to-ship and ship-to-projectile collisions
        this.physics.add.overlap(player, powerupDropSpawner.spawnGroup, (playerGameObject, powerupDropGameObject) => {
            if (!(playerGameObject instanceof Player) || !(powerupDropGameObject instanceof PowerupDrop)) {
                return;
            }

            if (!playerGameObject.active || !powerupDropGameObject.active) {
                return;
            }

            playerGameObject.colliderComponent.collideWithPowerup();
            powerupDropGameObject.colliderComponent.collideWithEnemyShip();
        });
        // NOTE: Phaser always passes an independent sprite first, followed by a sprite from a sprite group.
        // ship-to-projectile collisions
        eventBusComponent.on(CUSTOM_EVENTS.ENEMY_INIT, (enemyGameObject: GameObjects.GameObject) => {
            if (!(enemyGameObject instanceof SimpleEnemy)) {
                return;
            }

            this.physics.add.overlap(
                player,
                enemyGameObject.projectileGroup,
                (playerGameObject, enemyProjectileGameObject) => {
                    if (
                        !(playerGameObject instanceof Player) ||
                        !(enemyProjectileGameObject instanceof Physics.Arcade.Sprite)
                    ) {
                        return;
                    }

                    if (!playerGameObject.active || !enemyProjectileGameObject.active) {
                        return;
                    }

                    enemyGameObject.weaponComponent.destroyProjectile(enemyProjectileGameObject);
                    playerGameObject.colliderComponent.collideWithEnemyProjectile();
                },
            );
        });
        eventBusComponent.on(
            CUSTOM_EVENTS.HEAL,
            () => {
                const FLASH_COLOR = {
                    R: 0,
                    G: 210,
                    B: 234,
                };
                this.cameras.main.flash(100, FLASH_COLOR.R, FLASH_COLOR.G, FLASH_COLOR.B, true);
            },
            this,
        );
        eventBusComponent.on(
            CUSTOM_EVENTS.HURT,
            () => {
                this.cameras.main.shake(50, new PhaserMath.Vector2(0, 0.01), true);
                const FLASH_COLOR = {
                    R: 255,
                    G: 10,
                    B: 10,
                };
                this.cameras.main.flash(50, FLASH_COLOR.R, FLASH_COLOR.G, FLASH_COLOR.B, true);
            },
            this,
        );

        new Score(this, eventBusComponent);
        new Lives(this, eventBusComponent);
        new AudioManager(this, eventBusComponent);

        PauseGameManager(this);
    }

    #createBackground() {
        this.add.sprite(0, 0, 'bg1').setOrigin(0, 1).setAlpha(0.7).setAngle(90).setScale(1, 1.25);
        this.add.sprite(0, 0, 'bg2').setOrigin(0, 1).setAlpha(0.7).setAngle(90).setScale(1, 1.25);
        this.add.sprite(0, 0, 'bg3').setOrigin(0, 1).setAlpha(0.7).setAngle(90).setScale(1, 1.25);
    }
}
