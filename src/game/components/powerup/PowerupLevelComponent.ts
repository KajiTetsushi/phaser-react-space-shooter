type PowerupLevelComponentOptions = {
    onLevelChange?: (newLevel: number) => void;
};

export default class PowerupLevelComponent {
    #level: number = 1;
    #onLevelChange?: (newLevel: number) => void;

    constructor({ onLevelChange }: PowerupLevelComponentOptions = {}) {
        this.#onLevelChange = onLevelChange;
    }

    incrementLevel() {
        this.#level += 1;
        this.#onLevelChange?.(this.#level);
    }

    decrementLevel() {
        // Ensure the level does not go below 1.
        this.#level = Math.max(1, this.#level - 1);
        this.#onLevelChange?.(this.#level);
    }

    resetLevel() {
        this.#level = 1;
    }

    get level() {
        return this.#level;
    }
}
