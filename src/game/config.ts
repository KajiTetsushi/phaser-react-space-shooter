export const PLAYER_CONFIG = {
    HORIZONTAL: {
        VELOCITY: 20,
        VELOCITY_MAX: 200,
        DRAG: 0.01,
    },
    WEAPON: {
        SPEED: 300,
        INTERVAL: 300,
        LIFESPAN: 3,
        ROUNDS_RENDER_MAX: 10,
    },
};

export const ENEMY_CONFIG = {
    SCOUT: {
        VERTICAL: {
            VELOCITY: 10,
            VELOCITY_MAX: 100,
            DRAG: 0.01,
        },
    },
    FIGHTER: {
        HORIZONTAL: {
            VELOCITY: 12,
            VELOCITY_MAX: 120,
            DRIFT_MAX: 40,
            DRAG: 0.01,
        },
        VERTICAL: {
            VELOCITY: 12,
            VELOCITY_MAX: 120,
            DRAG: 0.01,
        },
    },
};
