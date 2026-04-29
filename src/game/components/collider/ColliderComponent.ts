import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';
import type HealthComponent from '../health/HealthComponent';

export default class ColliderComponent {
    #healthComponent: HealthComponent;
    #eventBusComponent: EventBusComponent;

    constructor(healthComponent: HealthComponent, eventBusComponent: EventBusComponent) {
        this.#healthComponent = healthComponent;
        this.#eventBusComponent = eventBusComponent;
    }

    collideWithEnemyShip() {
        if (this.#healthComponent.isHealthDepleted) {
            return;
        }

        this.#healthComponent.takeDamage('one-hit-kill');
        this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_HIT);
    }

    collideWithEnemyProjectile() {
        if (this.#healthComponent.isHealthDepleted) {
            return;
        }

        this.#healthComponent.takeDamage(1);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_HIT);
    }
}
