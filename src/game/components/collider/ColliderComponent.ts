import type HealthComponent from '../health/HealthComponent';

export default class ColliderComponent {
    #healthComponent: HealthComponent;

    constructor(healthComponent: HealthComponent) {
        this.#healthComponent = healthComponent;
    }

    collideWithEnemyShip() {
        if (this.#healthComponent.isHealthDepleted) {
            return;
        }

        this.#healthComponent.takeDamage('one-hit-kill');
    }

    collideWithEnemyProjectile() {
        if (this.#healthComponent.isHealthDepleted) {
            return;
        }

        this.#healthComponent.takeDamage(1);
    }
}
