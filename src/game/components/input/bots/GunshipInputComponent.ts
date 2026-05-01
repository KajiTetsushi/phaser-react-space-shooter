import { type GameObjects, Math as MathUtils } from 'phaser';
import type {
    GameObjectImplementable,
    GameObjectPosition,
    GetGameObjectPosition,
} from '../../../objects/objects.types';
import InputComponent from '../InputComponent';

type MinAndMax = readonly [number, number];

export type GunshipInputComponentOptions = {
    ai: {
        relativeXDistanceToPlayerRanges: Record<number, MinAndMax> & Record<'*', MinAndMax>;
    };
};

export default class GunshipInputComponent extends InputComponent {
    #gameObject: GameObjects.Container & GameObjectImplementable;
    #getPlayerPosition: GetGameObjectPosition;
    #fireInterval: number = 0;
    #options: GunshipInputComponentOptions;

    constructor(
        gameObject: GameObjects.Container & GameObjectImplementable,
        getPlayerPosition: GetGameObjectPosition,
        options: GunshipInputComponentOptions,
    ) {
        super();

        this.#gameObject = gameObject;
        this.#getPlayerPosition = getPlayerPosition;
        this.#options = options;
    }

    update(delta: number) {
        this.#followPlayer();
        this.#fireRandomly(delta);
    }

    #followPlayer() {
        const gunshipPosition: GameObjectPosition = this.#gameObject.getPosition();
        const playerPosition: GameObjectPosition = this.#getPlayerPosition();

        if (playerPosition.x < gunshipPosition.x) {
            this.setXDirection('left');
        } else if (playerPosition.x > gunshipPosition.x) {
            this.setXDirection('right');
        } else {
            this.setXDirection('neutral');
        }
    }

    #fireRandomly(delta: number) {
        this.#fireInterval -= delta;

        if (this.#fireInterval > 0) {
            this.shoot = false;
            return;
        }

        this.shoot = true;

        this.#fireInterval = MathUtils.RND.integerInRange(...this.getFireIntervalRange());
    }

    private getFireIntervalRange() {
        const gunshipPosition: GameObjectPosition = this.#gameObject.getPosition();
        const playerPosition: GameObjectPosition = this.#getPlayerPosition();

        const { ai } = this.#options;
        const { relativeXDistanceToPlayerRanges } = ai;
        const maxXDiffs = Object.keys(relativeXDistanceToPlayerRanges)
            .filter((key) => key !== '*')
            .map((key) => Number(key));

        const fireIntervalRange = (() => {
            const xDiff = Math.abs(playerPosition.x - gunshipPosition.x);

            const bracket = maxXDiffs.find((maxXDiff) => xDiff <= maxXDiff) ?? '*';

            return relativeXDistanceToPlayerRanges[bracket];
        })();

        return fireIntervalRange;
    }
}
