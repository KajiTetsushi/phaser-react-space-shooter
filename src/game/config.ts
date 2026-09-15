import type { MovementComponentConfig } from './components/movement/movement.types';
import type { SimpleEnemySpawnerComponentConfig } from './components/spawners/SimpleEnemySpawnerComponent';
import type { WeaponConfig } from './components/weapon/WeaponComponent';

type PlayerConfig = {
    POWERUP_MAX: number;
    LIVES: number;
    HEALTH: number;
    RESPAWN_DELAY: number;
    HIT_SOUND: string;
    EXPLOSION_SOUND: string;
    movement: MovementComponentConfig;
    weapon: WeaponConfig;
    HITBOX_SIZE: {
        WIDTH: number;
        HEIGHT: number;
    };
};

export const PLAYER_CONFIG = {
    POWERUP_MAX: 4,
    LIVES: 3,
    HEALTH: 4,
    RESPAWN_DELAY: 1500,
    HIT_SOUND: 'hit',
    EXPLOSION_SOUND: 'explosion',
    HITBOX_SIZE: {
        WIDTH: 24,
        HEIGHT: 24,
    },
    movement: {
        accelerates: false,
        velocity: 200,
    },
    weapon: {
        weaponCooldown: 300,
        weaponReport: 'shot2',
        weaponClusterOffset: 12,
        projectileAnimationKey: 'bullet',
        projectileHitboxSize: {
            w: 14,
            h: 18,
        },
        projectileLifespan: 3,
        projectileScale: 0.8,
        projectileSpawnPoolSize: 60,
        projectileSpeed: 300,
        trajectoryFlipY: false,
        trajectoryYOffset: -20,
    },
} satisfies PlayerConfig;

type PowerupDropConfig = {
    HEALTH: number;
    SCORE: number;
    SHIP_KEY: string;
    HIT_SOUND: string;
    HITBOX_SIZE: {
        WIDTH: number;
        HEIGHT: number;
    };
    movement: MovementComponentConfig;
};

export const POWERUP_DROP_CONFIG = {
    HEALTH: 1,
    SCORE: 100,
    // TODO: Sprite.
    SHIP_KEY: 'powerup',
    HIT_SOUND: 'hit',
    HITBOX_SIZE: {
        WIDTH: 24,
        HEIGHT: 24,
    },
    movement: {
        accelerates: true,
        velocityIncrement: 10,
        velocityMaximum: 100,
        drag: 0.01,
    },
} satisfies PowerupDropConfig;

type SimpleEnemyNames = 'Scout' | 'Fighter' | 'Gunship' | 'Powerup';

export const SIMPLE_ENEMIES: Readonly<Record<SimpleEnemyNames, SimpleEnemySpawnerComponentConfig>> = {
    Scout: {
        minViewportXBoundaryClearance: 30,
        recurringInterval: 5000,
        initialInterval: 1000,
        unit: {
            angle: 180,
            health: 1,
            hitboxHeight: 24,
            hitboxWidth: 24,
            score: 200,
            shipSpriteAssetKey: 'scout',
            shipSpriteAssetXScale: 1,
            shipSpriteAssetYScale: 1,
            shipEngineSpriteAssetKey: 'scout_engine',
            shipEngineSpriteAssetXScale: 1,
            shipEngineSpriteAssetYScale: 1,
            shipDestroyedSoundKey: 'explosion',
            shipDestroyedSpriteAnimationKey: 'scout_destroy',
            shipDestroyedSpriteAnimationXScale: 1,
            shipDestroyedSpriteAnimationYScale: 1,
            movement: {
                accelerates: true,
                velocityIncrement: 12,
                velocityMaximum: 120,
                drag: 0.01,
            },
            ai: {
                initialize: {
                    direction: {
                        x: 'random',
                        y: 'down',
                    },
                },
                update: {
                    zigzagFromInitialPosition: {
                        x: 40,
                    },
                },
            },
        },
    },
    Fighter: {
        minViewportXBoundaryClearance: 30,
        recurringInterval: 3000,
        initialInterval: 6000,
        unit: {
            angle: 180,
            health: 1,
            hitboxHeight: 24,
            hitboxWidth: 24,
            score: 200,
            shipSpriteAssetKey: 'fighter',
            shipSpriteAssetXScale: 1,
            shipSpriteAssetYScale: 1,
            shipEngineSpriteAssetKey: 'fighter_engine',
            shipEngineSpriteAssetXScale: 1,
            shipEngineSpriteAssetYScale: 1,
            shipDestroyedSoundKey: 'explosion',
            shipDestroyedSpriteAnimationKey: 'fighter_destroy',
            shipDestroyedSpriteAnimationXScale: 1,
            shipDestroyedSpriteAnimationYScale: 1,
            movement: {
                accelerates: true,
                velocityIncrement: 12,
                velocityMaximum: 120,
                drag: 0.01,
            },
            weapon: {
                weaponCooldown: 3000,
                weaponReport: 'shot1',
                projectileAnimationKey: 'bullet',
                projectileHitboxSize: {
                    w: 14,
                    h: 18,
                },
                projectileLifespan: 3,
                projectileScale: 0.8,
                projectileSpawnPoolSize: 10,
                projectileSpeed: -250,
                trajectoryFlipY: true,
                trajectoryYOffset: 10,
            },
            ai: {
                initialize: {
                    direction: {
                        y: 'down',
                    },
                    shoot: true,
                },
            },
        },
    },
    Gunship: {
        maxOnScreen: 2,
        minViewportY: 50,
        maxViewportY: 100,
        minViewportXBoundaryClearance: 30,
        recurringInterval: 5000,
        initialInterval: 8000,
        unit: {
            angle: 180,
            health: 6,
            hitboxHeight: 24,
            hitboxWidth: 24,
            hitSound: 'hit',
            score: 600,
            shipSpriteAssetKey: 'fighter',
            shipSpriteAssetXScale: 1,
            shipSpriteAssetYScale: 1,
            shipEngineSpriteAssetKey: 'fighter_engine',
            shipEngineSpriteAssetXScale: 1,
            shipEngineSpriteAssetYScale: 1,
            shipDestroyedSoundKey: 'explosion',
            shipDestroyedSpriteAnimationKey: 'fighter_destroy',
            shipDestroyedSpriteAnimationXScale: 1,
            shipDestroyedSpriteAnimationYScale: 1,
            movement: {
                accelerates: false,
                velocity: 16,
            },
            weapon: {
                weaponCooldown: 50,
                weaponReport: 'shot1',
                projectileAnimationKey: 'enemy-bullet',
                projectileHitboxSize: {
                    w: 15,
                    h: 15,
                },
                projectileLifespan: 3,
                projectileScale: 1.5,
                projectileSpawnPoolSize: 18,
                projectileSpeed: -500,
                trajectoryFlipY: true,
                trajectoryYOffset: 10,
            },
            ai: {
                update: {
                    followPlayerDirections: {
                        x: true,
                    },
                    shootRandomly: {
                        relativeXDistanceToPlayerRanges: {
                            150: [50, 1000],
                            200: [200, 2000],
                            '*': [500, 3000],
                        },
                    },
                },
            },
        },
    },
    Powerup: {
        maxOnScreen: 1,
        minViewportY: 50,
        maxViewportY: 100,
        minViewportXBoundaryClearance: 50,
        recurringInterval: 4000,
        initialInterval: 5000,
        unit: {
            angle: 180,
            dropsPowerup: true,
            health: 1,
            hitboxHeight: 20,
            hitboxWidth: 20,
            score: 100,
            shipSpriteAssetKey: 'enemy-yellow',
            shipSpriteAssetXScale: 0.75,
            shipSpriteAssetYScale: 0.75,
            shipDestroyedSoundKey: 'explosion',
            shipDestroyedSpriteAnimationKey: 'fighter_destroy',
            shipDestroyedSpriteAnimationXScale: 1,
            shipDestroyedSpriteAnimationYScale: 1,
            movement: {
                accelerates: true,
                velocityIncrement: 4,
                velocityMaximum: 20,
                drag: 0.01,
            },
            ai: {
                initialize: {
                    direction: {
                        x: 'random',
                    },
                },
                update: {
                    zigzagWithinBounds: {
                        x: 0,
                    },
                },
            },
        },
    },
};
