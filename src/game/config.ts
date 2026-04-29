export const PLAYER_CONFIG = {
    LIVES: 3,
    HEALTH: 4,
    RESPAWN_DELAY: 1500,
    HIT_SOUND: 'hit',
    HORIZONTAL: {
        VELOCITY: 20,
        VELOCITY_MAX: 200,
        DRAG: 0.01,
    },
    WEAPON: {
        WEAPON_COOLDOWN: 300,
        WEAPON_REPORT: 'shot2',
        PROJECTILE_ANIMATION_KEY: 'bullet',
        PROJECTILE_HITBOX_SIZE: {
            w: 14,
            h: 18,
        },
        PROJECTILE_LIFESPAN: 3,
        PROJECTILE_SCALE: 0.8,
        PROJECTILE_SPAWN_POOL_SIZE: 10,
        PROJECTILE_SPEED: 300,
    },
};

export const ENEMY_CONFIG = {
    SCOUT: {
        HEALTH: 2,
        SCORE: 100,
        HIT_SOUND: 'hit',
        EXPLOSION_SOUND: 'explosion',
        HORIZONTAL: {
            VELOCITY: 12,
            VELOCITY_MAX: 120,
            DRIFT_MAX: 40,
            DRAG: 0.01,
        },
        VERTICAL: {
            VELOCITY: 10,
            VELOCITY_MAX: 100,
            DRAG: 0.01,
        },
        SPAWN: {
            MIN_VIEWPORT_X_BOUNDARY_CLEARANCE: 30,
            RECURRING_INTERVAL: 5000,
            INITIAL_INTERVAL: 1000,
        },
    },
    FIGHTER: {
        HEALTH: 2,
        SCORE: 200,
        HIT_SOUND: 'hit',
        EXPLOSION_SOUND: 'explosion',
        VERTICAL: {
            VELOCITY: 12,
            VELOCITY_MAX: 120,
            DRAG: 0.01,
        },
        WEAPON: {
            WEAPON_COOLDOWN: 2000,
            WEAPON_REPORT: 'shot1',
            PROJECTILE_ANIMATION_KEY: 'bullet',
            PROJECTILE_HITBOX_SIZE: {
                w: 14,
                h: 18,
            },
            PROJECTILE_LIFESPAN: 3,
            PROJECTILE_SCALE: 0.8,
            PROJECTILE_SPAWN_POOL_SIZE: 10,
            PROJECTILE_SPEED: -250,
        },
        SPAWN: {
            MIN_VIEWPORT_X_BOUNDARY_CLEARANCE: 30,
            RECURRING_INTERVAL: 3000,
            INITIAL_INTERVAL: 6000,
        },
    },
};
