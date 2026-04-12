export default class HealthComponent {
    #initial: number;
    #current: number;
    #isDead: boolean = false;

    constructor(points: number) {
        this.#initial = points;
        this.#current = points;
    }

    get health() {
        return this.#current;
    }

    get isDead() {
        return this.#isDead;
    }

    reset() {
        this.#current = this.#initial;
        this.#isDead = false;
    }

    takeDamage() {
        if (this.#isDead) {
            return;
        }

        this.#current--;

        if (this.#current <= 0) {
            this.#isDead = true;
        }
    }

    die() {
        this.#current = 0;
        this.#isDead = true;
    }
}
