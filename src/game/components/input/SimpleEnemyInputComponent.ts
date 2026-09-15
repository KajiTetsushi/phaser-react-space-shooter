import { type GameObjects, Math as PhaserMath, Physics } from 'phaser';
import type Player from '../../objects/player/Player';
import assert from '../../utils/assert';
import InputComponent, { type XDirection, type YDirection } from './InputComponent';

type DirectionAxes = {
    x?: XDirection | 'random';
    y?: YDirection | 'random';
};

type InitialConfig = {
    direction?: DirectionAxes;
    shoot?: boolean;
};

type MinAndMax = readonly [number, number];

type RelativeDistanceToPlayerRanges = {
    [key: number]: MinAndMax;
    /**
     * Catch-all min and max.
     */
    '*': MinAndMax;
};

type UpdateConfig = {
    zigzagWithinBounds?: {
        x?: number;
        y?: number;
    };
    zigzagFromInitialPosition?: {
        x?: number;
        y?: number;
    };
    followPlayerDirections?: {
        x?: boolean;
        y?: boolean;
    };
    shootRandomly?: {
        relativeXDistanceToPlayerRanges?: RelativeDistanceToPlayerRanges;
        relativeYDistanceToPlayerRanges?: RelativeDistanceToPlayerRanges;
    };
};

export type SimpleEnemyInputComponentAi = {
    initialize?: InitialConfig;
    update?: UpdateConfig;
};

export default class SimpleEnemyInputComponent extends InputComponent {
    #enemy: GameObjects.Container;
    #player: Player;
    #shootRandomlyXManager: SimpleEnemyShootRandomlyManager | null = null;
    #shootRandomlyYManager: SimpleEnemyShootRandomlyManager | null = null;
    #initialPosition: {
        /**
         * The initial x position of this Game Object.
         */
        x: number;
        /**
         * The initial y position of this Game Object.
         */
        y: number;
    };
    #ai?: SimpleEnemyInputComponentAi;

    constructor(enemy: GameObjects.Container, player: Player, ai?: SimpleEnemyInputComponentAi) {
        super();

        this.#enemy = enemy;
        this.#player = player;
        this.#ai = ai;

        this.#initialPosition = {
            x: this.#enemy.x,
            y: this.#enemy.y,
        };

        if (this.#ai?.update?.shootRandomly?.relativeXDistanceToPlayerRanges) {
            this.#shootRandomlyXManager = new SimpleEnemyShootRandomlyManager();
        }

        if (this.#ai?.update?.shootRandomly?.relativeXDistanceToPlayerRanges) {
            this.#shootRandomlyYManager = new SimpleEnemyShootRandomlyManager();
        }
    }

    initialize() {
        const initialAi = this.#ai?.initialize ?? {};
        const updateAi = this.#ai?.update ?? {};

        const initialXDirection: XDirection = (() => {
            if (initialAi.direction?.x === 'random') {
                return Math.random() < 0.5 ? 'left' : 'right';
            }

            if (initialAi.direction?.x) {
                return initialAi.direction.x;
            }

            if (updateAi.zigzagFromInitialPosition?.x) {
                return Math.random() < 0.5 ? 'left' : 'right';
            }

            return 'neutral';
        })();
        const initialYDirection: YDirection = (() => {
            if (initialAi.direction?.y === 'random') {
                return Math.random() < 0.5 ? 'down' : 'up';
            }

            if (initialAi.direction?.y) {
                return initialAi.direction.y;
            }

            return 'neutral';
        })();

        this.setXDirection(initialXDirection);
        this.setYDirection(initialYDirection);
        this.setShoot(initialAi?.shoot ?? false);
    }

    update(_time: number, delta: number): void {
        const updateAi = this.#ai?.update;

        if (updateAi?.zigzagWithinBounds) {
            this.zigzagWithinBounds();
        } else if (updateAi?.zigzagFromInitialPosition) {
            this.zigzagFromInitialPosition();
        } else if (updateAi?.followPlayerDirections) {
            this.followPlayerDirections();
        }

        if (updateAi?.shootRandomly) {
            this.shootRandomly(delta);
        }
    }

    private followPlayerDirections() {
        const enemy = this.#enemy;
        const player = this.#player;

        if (this.#ai?.update?.followPlayerDirections?.x) {
            const nextXDirection = getXDirectionTowardsPlayer(enemy.x, player.x);
            this.setXDirection(nextXDirection);
        }

        if (this.#ai?.update?.followPlayerDirections?.y) {
            const nextYDirection = getYDirectionTowardsPlayer(enemy.y, player.y);
            this.setYDirection(nextYDirection);
        }
    }

    private zigzagWithinBounds() {
        const enemy = this.#enemy;
        const { body, scene } = enemy;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        if (typeof this.#ai?.update?.zigzagWithinBounds?.x === 'number') {
            const xBoundary = this.#ai.update.zigzagWithinBounds.x;
            const nextXDirection = getXDirectionZigzagWithinBounds(
                enemy.x,
                0 + xBoundary + body.width / 2,
                scene.scale.width - xBoundary - body.width / 2,
                this.xDirection,
            );
            this.setXDirection(nextXDirection);
        }

        if (typeof this.#ai?.update?.zigzagWithinBounds?.y === 'number') {
            const yBoundary = this.#ai.update.zigzagWithinBounds.y;
            const nextYDirection = getYDirectionZigzagWithinBounds(
                enemy.y,
                0 + yBoundary + body.height / 2,
                scene.scale.height - yBoundary - body.height / 2,
                this.yDirection,
            );
            this.setYDirection(nextYDirection);
        }
    }

    private zigzagFromInitialPosition() {
        const enemy = this.#enemy;

        if (this.#ai?.update?.zigzagFromInitialPosition?.x) {
            const nextXDirection = getXDirectionZigzagFromInitialPosition(
                enemy.x,
                this.#initialPosition.x,
                this.#ai.update.zigzagFromInitialPosition.x ?? enemy.x,
                this.xDirection,
            );
            this.setXDirection(nextXDirection);
        }

        if (this.#ai?.update?.zigzagFromInitialPosition?.y) {
            const nextYDirection = getYDirectionZigzagFromInitialPosition(
                enemy.y,
                this.#initialPosition.y,
                this.#ai.update.zigzagFromInitialPosition.y ?? enemy.y,
                this.yDirection,
            );
            this.setYDirection(nextYDirection);
        }
    }

    private shootRandomly(delta: number) {
        const enemy = this.#enemy;
        const player = this.#player;

        let shouldShoot: boolean = this.shoot;

        if (this.#ai?.update?.shootRandomly?.relativeXDistanceToPlayerRanges) {
            shouldShoot = Boolean(
                this.#shootRandomlyXManager?.shouldShoot(
                    delta,
                    enemy.x,
                    player.x,
                    this.#ai?.update?.shootRandomly?.relativeXDistanceToPlayerRanges,
                ),
            );
        }

        if (this.#ai?.update?.shootRandomly?.relativeYDistanceToPlayerRanges) {
            shouldShoot = Boolean(
                this.#shootRandomlyYManager?.shouldShoot(
                    delta,
                    enemy.y,
                    player.y,
                    this.#ai?.update?.shootRandomly?.relativeYDistanceToPlayerRanges,
                ),
            );
        }

        this.setShoot(shouldShoot);
    }
}

const getXDirectionTowardsPlayer = (enemyXPosition: number, playerXPosition: number): XDirection => {
    if (playerXPosition < enemyXPosition) {
        return 'left';
    }

    if (playerXPosition > enemyXPosition) {
        return 'right';
    }

    return 'neutral';
};

const getYDirectionTowardsPlayer = (enemyYPosition: number, playerYPosition: number): YDirection => {
    if (playerYPosition < enemyYPosition) {
        return 'down';
    }

    if (playerYPosition > enemyYPosition) {
        return 'up';
    }

    return 'neutral';
};

const getXDirectionZigzagWithinBounds = (
    currPosition: number,
    minPosition: number,
    maxPosition: number,
    currDirection: XDirection,
): XDirection => {
    if (currPosition <= minPosition) {
        return 'right';
    } else if (currPosition >= maxPosition) {
        return 'left';
    } else {
        return currDirection;
    }
};

const getYDirectionZigzagWithinBounds = (
    currPosition: number,
    minPosition: number,
    maxPosition: number,
    currDirection: YDirection,
): YDirection => {
    if (currPosition <= minPosition) {
        return 'up';
    } else if (currPosition >= maxPosition) {
        return 'down';
    } else {
        return currDirection;
    }
};

const getXDirectionZigzagFromInitialPosition = (
    currPosition: number,
    initPosition: number,
    maxPosition: number,
    currDirection: XDirection,
): XDirection => {
    if (currPosition < initPosition - Math.abs(maxPosition)) {
        return 'right';
    } else if (currPosition > initPosition + Math.abs(maxPosition)) {
        return 'left';
    } else {
        return currDirection;
    }
};

const getYDirectionZigzagFromInitialPosition = (
    currPosition: number,
    initPosition: number,
    maxPosition: number,
    currDirection: YDirection,
): YDirection => {
    if (currPosition < initPosition - Math.abs(maxPosition)) {
        return 'up';
    } else if (currPosition > initPosition + Math.abs(maxPosition)) {
        return 'down';
    } else {
        return currDirection;
    }
};

class SimpleEnemyShootRandomlyManager {
    #shootInterval: number = 0;

    /**
     * @param delta The delta time, in ms, elapsed since the last frame.
     */
    shouldShoot(
        delta: number,
        enemyPosition: number,
        playerPosition: number,
        relativeDistanceToPlayerRanges: RelativeDistanceToPlayerRanges,
    ) {
        this.#shootInterval -= delta;

        if (this.#shootInterval > 0) {
            return false;
        }

        this.#shootInterval = PhaserMath.RND.integerInRange(
            ...getShootRandomlyIntervalRange(enemyPosition, playerPosition, relativeDistanceToPlayerRanges),
        );

        return true;
    }
}

const getShootRandomlyIntervalRange = (
    enemyPosition: number,
    playerPosition: number,
    relativeDistanceToPlayerRanges: RelativeDistanceToPlayerRanges,
) => {
    const posDiffMaxes = Object.keys(relativeDistanceToPlayerRanges)
        .filter((key) => key !== '*')
        .map((key) => Number(key));

    const shootIntervalRange = (() => {
        const posDiff = Math.abs(playerPosition - enemyPosition);

        const rangeBracketKey = posDiffMaxes.find((posDiffMax) => posDiff <= posDiffMax) ?? '*';

        return relativeDistanceToPlayerRanges[rangeBracketKey];
    })();

    return shootIntervalRange;
};
