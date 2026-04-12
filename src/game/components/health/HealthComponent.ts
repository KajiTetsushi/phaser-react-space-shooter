export default class HealthComponent {
    #initial: number;
    #current: number;

    constructor(points: number) {
        this.#initial = points;
        this.#current = points;
    }

    get health() {
        return this.#current;
    }

    get isHealthDepleted() {
        return this.#current <= 0;
    }

    reset() {
        this.#current = this.#initial;
    }

    takeDamage(amount: number | 'one-hit-kill' = 1) {
        if (this.isHealthDepleted) {
            return;
        }

        if (amount === 'one-hit-kill') {
            this.#current = 0;
        } else {
            this.#current -= amount;
        }
    }
}
