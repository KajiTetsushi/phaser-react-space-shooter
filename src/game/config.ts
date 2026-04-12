export const PLAYER_CONFIG = {
    HEALTH: 4,
    HORIZONTAL: {
        VELOCITY: 20,
        VELOCITY_MAX: 200,
        DRAG: 0.01,
    },
    WEAPON: {
        WEAPON_COOLDOWN: 300,
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
    },
    FIGHTER: {
        HEALTH: 2,
        VERTICAL: {
            VELOCITY: 12,
            VELOCITY_MAX: 120,
            DRAG: 0.01,
        },
        WEAPON: {
            WEAPON_COOLDOWN: 2000,
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
    },
};
