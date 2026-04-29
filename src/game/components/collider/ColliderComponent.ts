import type EventBusComponent from '../events/EventBusComponent';
import { CUSTOM_EVENTS } from '../events/EventBusComponent';
import type HealthComponent from '../health/HealthComponent';

type ColliderComponentConfig = {
    hitSound: string;
};

export default class ColliderComponent {
    #healthComponent: HealthComponent;
    #eventBusComponent: EventBusComponent;
    #colliderConfig: ColliderComponentConfig;

    constructor(
        healthComponent: HealthComponent,
        eventBusComponent: EventBusComponent,
        colliderConfig: ColliderComponentConfig,
    ) {
        this.#healthComponent = healthComponent;
        this.#eventBusComponent = eventBusComponent;
        this.#colliderConfig = colliderConfig;
    }

    collideWithEnemyShip() {
        if (this.#healthComponent.isHealthDepleted) {
            return;
        }

        this.#healthComponent.takeDamage('one-hit-kill');
        this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_HIT, this.#colliderConfig.hitSound);
    }

    collideWithEnemyProjectile() {
        if (this.#healthComponent.isHealthDepleted) {
            return;
        }

        this.#healthComponent.takeDamage(1);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_HIT, this.#colliderConfig.hitSound);
    }
}
