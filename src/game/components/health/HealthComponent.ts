export default class HealthComponent {
    #initial: number;
    #current: number;

    constructor(hitPoints: number) {
        this.#initial = hitPoints;
        this.#current = this.#initial;
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

    takeDamage(amount: number | 'one-hit-kill' | 'full-heal' = 1) {
        if (this.isHealthDepleted) {
            return;
        }

        if (amount === 'one-hit-kill') {
            this.#current = 0;
        } else if (amount === 'full-heal') {
            this.#current = this.#initial;
        } else if (amount > 0) {
            this.#current -= Math.min(amount, this.#current);
        } else if (amount < 0) {
            this.#current += Math.min(amount * -1, this.#initial - this.#current);
        }
    }
}
