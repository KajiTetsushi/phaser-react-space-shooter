import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';

export default class HealthComponent {
    #initial: number;
    #current: number;
    #eventBusComponent: EventBusComponent | undefined;

    constructor(hitPoints: number, eventBusComponent?: EventBusComponent) {
        this.#initial = hitPoints;
        this.#current = this.#initial;
        this.#eventBusComponent = eventBusComponent;
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

    emitHealEvent() {
        if (this.#current < this.#initial) {
            this.#eventBusComponent?.emit(CUSTOM_EVENTS.HEAL);
        }
    }

    emitHurtEvent() {
        if (this.#current > 0) {
            this.#eventBusComponent?.emit(CUSTOM_EVENTS.HURT);
        }
    }

    takeDamage(amount: number | 'one-hit-kill' | 'full-heal' = 1) {
        if (this.isHealthDepleted) {
            return;
        }

        if (amount === 'one-hit-kill') {
            this.#eventBusComponent?.emit(CUSTOM_EVENTS.HURT);
            this.#current = 0;
        } else if (amount === 'full-heal') {
            this.emitHealEvent();
            this.#current = this.#initial;
        } else if (amount > 0) {
            this.#eventBusComponent?.emit(CUSTOM_EVENTS.HURT);
            this.#current -= Math.min(amount, this.#current);
        } else if (amount < 0) {
            this.emitHealEvent();
            this.#current += Math.min(amount * -1, this.#initial - this.#current);
        }
    }
}
