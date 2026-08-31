import { GameObjects, Physics, Scenes } from 'phaser';
import ColliderComponent from '../../components/collider/ColliderComponent';
import type EventBusComponent from '../../components/events/EventBusComponent';
import { CUSTOM_EVENTS } from '../../components/events/EventBusComponent';
import HealthComponent from '../../components/health/HealthComponent';
import SimpleEnemyInputComponent, {
    type SimpleEnemyInputComponentAi,
} from '../../components/input/SimpleEnemyInputComponent';
import MovementComponent from '../../components/movement/MovementComponent';
import type { MovementComponentConfig } from '../../components/movement/movement.types';
import WeaponComponent, { type WeaponConfig } from '../../components/weapon/WeaponComponent';
import assert from '../../utils/assert';
import type Player from '../player/Player';
import type { EnemyImplementable } from './enemies.types';

export type SimpleEnemyConfig = {
    angle?: number;
    dropsPowerup?: boolean;
    health?: number;
    hitSound?: string;
    hitboxHeight?: number;
    hitboxWidth?: number;
    movement?: MovementComponentConfig;
    score?: number;
    shipSpriteAssetKey?: string;
    shipSpriteAssetXScale?: number;
    shipSpriteAssetYScale?: number;
    shipEngineSpriteAssetKey?: string;
    shipEngineSpriteAssetXScale?: number;
    shipEngineSpriteAssetYScale?: number;
    shipDestroyedSpriteAnimationKey?: string;
    shipDestroyedSpriteAnimationXScale?: number;
    shipDestroyedSpriteAnimationYScale?: number;
    shipDestroyedSoundKey?: string;
    weapon?: WeaponConfig;
    ai?: SimpleEnemyInputComponentAi;
};

export default class SimpleEnemy extends GameObjects.Container implements EnemyImplementable {
    #config: SimpleEnemyConfig | null = null;

    #isInitialized = false;
    #eventBusComponent: EventBusComponent;
    #inputComponent: SimpleEnemyInputComponent;
    #movementComponent: MovementComponent;
    #healthComponent: HealthComponent;
    #colliderComponent: ColliderComponent;
    #weaponComponent: WeaponComponent;
    #shipSprite: GameObjects.Sprite | null = null;
    #shipEngineSprite: GameObjects.Sprite | null = null;

    #setupVisualsAndLayout() {
        this.setDepth(2);

        if (this.#config?.shipEngineSpriteAssetKey) {
            this.#shipEngineSprite = this.scene.add
                .sprite(0, 0, this.#config.shipEngineSpriteAssetKey)
                .setScale(this.#config.shipEngineSpriteAssetXScale, this.#config.shipEngineSpriteAssetYScale)
                .setAngle(this.#config.angle);

            this.#shipEngineSprite.play(this.#config.shipEngineSpriteAssetKey);

            this.add(this.#shipEngineSprite);
        }

        if (this.#config?.shipSpriteAssetKey) {
            this.#shipSprite = this.scene.add
                .sprite(0, 0, this.#config.shipSpriteAssetKey)
                .setScale(this.#config.shipSpriteAssetXScale, this.#config.shipSpriteAssetYScale)
                .setAngle(this.#config.angle);

            this.add(this.#shipSprite);
        }
    }

    #setupPhysicsAndCollision() {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        const { body } = this;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        const hitboxHeight = this.#config?.hitboxHeight ?? 0;
        const hitboxWidth = this.#config?.hitboxWidth ?? 0;
        body.setSize(hitboxWidth, hitboxHeight);
        body.setOffset(-hitboxWidth / 2, -hitboxHeight / 2);
        body.setCollideWorldBounds(false);
    }

    #setupEventHandlers() {
        this.scene.events.on(Scenes.Events.UPDATE, this.update, this);

        this.once(
            Scenes.Events.DESTROY,
            () => {
                this.scene.events.off(Scenes.Events.UPDATE, this.update, this);
            },
            this,
        );
    }

    get score(): number | undefined {
        return this.#config?.score;
    }

    get colliderComponent() {
        return this.#colliderComponent;
    }

    get healthComponent() {
        return this.#healthComponent;
    }

    get weaponComponent() {
        return this.#weaponComponent;
    }

    get projectileGroup() {
        return this.weaponComponent.projectileGroup;
    }

    get shipSpriteAssetKey(): string | undefined {
        return this.#config?.shipSpriteAssetKey;
    }

    get shipDestroyedSpriteAnimationKey(): string | undefined {
        return this.#config?.shipDestroyedSpriteAnimationKey;
    }

    get shipDestroyedSpriteAnimationXScale(): number | undefined {
        return this.#config?.shipDestroyedSpriteAnimationXScale;
    }

    get shipDestroyedSpriteAnimationYScale(): number | undefined {
        return this.#config?.shipDestroyedSpriteAnimationYScale;
    }

    get shipDestroyedSoundKey(): string | undefined {
        return this.#config?.shipDestroyedSoundKey;
    }

    get shipAngle(): number {
        return this.#config?.angle ?? 0;
    }

    initialize(eventBusComponent: EventBusComponent, player: Player, config?: SimpleEnemyConfig): void {
        this.#config = config ?? null;

        this.#setupVisualsAndLayout();
        this.#setupPhysicsAndCollision();
        this.#setupEventHandlers();

        const { body } = this;
        assert(body instanceof Physics.Arcade.Body, 'body is not a Physics.Arcade.Body type');

        this.#isInitialized = true;
        this.#eventBusComponent = eventBusComponent;

        this.#inputComponent = new SimpleEnemyInputComponent(this, player, this.#config?.ai);
        this.#inputComponent.initialize();
        this.#movementComponent = new MovementComponent(body, this.#inputComponent, this.#config?.movement);
        this.#weaponComponent = new WeaponComponent(
            this,
            this.#inputComponent,
            this.#eventBusComponent,
            // @ts-expect-error
            this.#config?.weapon,
        );
        this.#healthComponent = new HealthComponent(this.#config?.health ?? 0);
        this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent, {
            hitSound: this.#config?.hitSound,
        });
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
    }

    reset(): void {
        this.setActive(true);
        this.setVisible(true);
        this.#healthComponent.reset();
        this.#movementComponent.reset();
    }

    update(time: number, delta: number): void {
        if (!this.#isInitialized) {
            return;
        }

        if (!this.active) {
            return;
        }

        if (this.#healthComponent.isHealthDepleted) {
            this.#die();
        }

        this.#inputComponent.update(time, delta);
        this.#movementComponent.update(time, delta);
        this.#weaponComponent.update(time, delta);
    }

    #die() {
        this.setActive(false);
        this.setVisible(false);
        this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);

        if (!this.#config?.dropsPowerup) {
            return;
        }

        this.#eventBusComponent.emit(CUSTOM_EVENTS.POWERUP_DESTROYED, this);
    }
}
