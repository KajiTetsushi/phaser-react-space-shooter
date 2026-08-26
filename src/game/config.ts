import type { GunshipInputComponentOptions } from './components/input/bots/GunshipInputComponent';
import type { MovementComponentConfig } from './components/movement/movement.types';
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

type EnemyConfigBase<SpawnExtraConfigs extends object = Record<string, unknown>> = {
    HEALTH: number;
    SCORE: number;
    SHIP_KEY: string;
    SHIP_SCALE: number;
    SHIP_ENGINE_KEY: string;
    SHIP_ENGINE_SCALE: number;
    HIT_SOUND: string;
    EXPLOSION_ANIMATION_KEY: string;
    EXPLOSION_ANIMATION_SCALE: number;
    EXPLOSION_SOUND: string;
    HITBOX_SIZE: {
        WIDTH: number;
        HEIGHT: number;
    };
    movement: MovementComponentConfig;
    weapon?: WeaponConfig;
    SPAWN: {
        MIN_VIEWPORT_X_BOUNDARY_CLEARANCE: number;
        RECURRING_INTERVAL: number;
        INITIAL_INTERVAL: number;
    } & SpawnExtraConfigs;
};

type EnemySpawnLimit = {
    MAX_ON_SCREEN: number;
    MIN_VIEWPORT_Y: number;
    MAX_VIEWPORT_Y: number;
};

type EnemyConfig = {
    SCOUT: EnemyConfigBase & {
        /**
         * Maximum horizontal drift from the initial spawn position.
         */
        movementHorizontalDriftMax: number;
    };
    FIGHTER: EnemyConfigBase;
    GUNSHIP: EnemyConfigBase<EnemySpawnLimit> & {
        ai: GunshipInputComponentOptions;
    };
    POWERUP: EnemyConfigBase<EnemySpawnLimit>;
};

export const ENEMY_OFFSCREEN_FLIGHT_PATTERN_SPAWN_Y_CONFIG = -20;
export const ENEMY_CONFIG = {
    SCOUT: {
        HEALTH: 1,
        SCORE: 100,
        SHIP_KEY: 'scout',
        SHIP_SCALE: 1,
        SHIP_ENGINE_KEY: 'scout_engine',
        SHIP_ENGINE_SCALE: 1,
        HIT_SOUND: 'hit',
        EXPLOSION_ANIMATION_KEY: 'scout_destroy',
        EXPLOSION_ANIMATION_SCALE: 1,
        EXPLOSION_SOUND: 'explosion',
        HITBOX_SIZE: {
            WIDTH: 24,
            HEIGHT: 24,
        },
        movement: {
            accelerates: true,
            velocityIncrement: 12,
            velocityMaximum: 120,
            drag: 0.01,
        },
        movementHorizontalDriftMax: 40,
        SPAWN: {
            MIN_VIEWPORT_X_BOUNDARY_CLEARANCE: 30,
            RECURRING_INTERVAL: 5000,
            INITIAL_INTERVAL: 1000,
        },
    },
    FIGHTER: {
        HEALTH: 1,
        SCORE: 200,
        SHIP_KEY: 'fighter',
        SHIP_SCALE: 1,
        SHIP_ENGINE_KEY: 'fighter_engine',
        SHIP_ENGINE_SCALE: 1,
        HIT_SOUND: 'hit',
        EXPLOSION_ANIMATION_KEY: 'fighter_destroy',
        EXPLOSION_ANIMATION_SCALE: 1,
        EXPLOSION_SOUND: 'explosion',
        HITBOX_SIZE: {
            WIDTH: 24,
            HEIGHT: 24,
        },
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
        SPAWN: {
            MIN_VIEWPORT_X_BOUNDARY_CLEARANCE: 30,
            RECURRING_INTERVAL: 3000,
            INITIAL_INTERVAL: 6000,
        },
    },
    GUNSHIP: {
        HEALTH: 6,
        SCORE: 600,
        SHIP_KEY: 'fighter',
        SHIP_SCALE: 1,
        SHIP_ENGINE_KEY: 'fighter_engine',
        SHIP_ENGINE_SCALE: 1,
        HIT_SOUND: 'hit',
        EXPLOSION_ANIMATION_KEY: 'fighter_destroy',
        EXPLOSION_ANIMATION_SCALE: 1,
        EXPLOSION_SOUND: 'explosion',
        HITBOX_SIZE: {
            WIDTH: 24,
            HEIGHT: 24,
        },
        movement: {
            accelerates: true,
            velocityIncrement: 2,
            velocityMaximum: 16,
            drag: 0.01,
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
        SPAWN: {
            MAX_ON_SCREEN: 2,
            MIN_VIEWPORT_Y: 50,
            MAX_VIEWPORT_Y: 100,
            MIN_VIEWPORT_X_BOUNDARY_CLEARANCE: 30,
            RECURRING_INTERVAL: 5000,
            INITIAL_INTERVAL: 8000,
        },
        ai: {
            ai: {
                relativeXDistanceToPlayerRanges: {
                    150: [50, 1000],
                    200: [200, 2000],
                    '*': [500, 3000],
                },
            },
        },
    },
    POWERUP: {
        HEALTH: 1,
        SCORE: 100,
        SHIP_KEY: 'enemy-yellow',
        SHIP_SCALE: 0.75,
        SHIP_ENGINE_KEY: '',
        SHIP_ENGINE_SCALE: 0,
        HIT_SOUND: 'hit',
        EXPLOSION_ANIMATION_KEY: 'fighter_destroy',
        EXPLOSION_ANIMATION_SCALE: 1,
        EXPLOSION_SOUND: 'explosion',
        HITBOX_SIZE: {
            WIDTH: 20,
            HEIGHT: 20,
        },
        movement: {
            accelerates: true,
            velocityIncrement: 4,
            velocityMaximum: 20,
            drag: 0.01,
        },
        SPAWN: {
            MAX_ON_SCREEN: 2,
            MIN_VIEWPORT_Y: 50,
            MAX_VIEWPORT_Y: 100,
            MIN_VIEWPORT_X_BOUNDARY_CLEARANCE: 30,
            RECURRING_INTERVAL: 4000,
            INITIAL_INTERVAL: 5000,
        },
    },
} satisfies EnemyConfig;
