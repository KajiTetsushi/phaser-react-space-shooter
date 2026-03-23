import { GameObjects, Physics, type Scene, Scenes } from 'phaser';
import FighterInputComponent from '../../components/input/bots/FighterInputComponent';
import type InputComponent from '../../components/input/InputComponent';
import HorizontalMovementComponent from '../../components/movement/HorizontalMovementComponent';
import VerticalMovementComponent from '../../components/movement/VerticalMovementComponent';
import WeaponComponent from '../../components/weapon/WeaponComponent';
import { ENEMY_CONFIG } from '../../config';

export default class FighterEnemy extends GameObjects.Container {
    #inputComponent: InputComponent;
    #horizontalMovementComponent: HorizontalMovementComponent;
    #verticalMovementComponent: VerticalMovementComponent;
    #weaponComponent: WeaponComponent;
    #shipSprite: GameObjects.Sprite;
    #shipEngineSprite: GameObjects.Sprite;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, []);

        this.#shipSprite = scene.add.sprite(0, 0, 'fighter');
        this.#shipEngineSprite = scene.add.sprite(0, 0, 'fighter_engine').setFlipY(true);
        this.#shipEngineSprite.play('fighter_engine');
        this.add([
            // Ship is on top, so it's added last.
            this.#shipEngineSprite,
            this.#shipSprite,
        ]);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        if (this.body instanceof Physics.Arcade.Body) {
            this.body.setSize(24, 24);
            this.body.setOffset(-12, -12);
            this.body.setCollideWorldBounds(false);
        }
        this.setDepth(2);

        this.#inputComponent = new FighterInputComponent(
            this,
            // The direction of the fighter's horizontal movement
            // will rely on its current position.
            this.x,
            ENEMY_CONFIG.FIGHTER.HORIZONTAL.DRIFT_MAX,
        );
        this.#horizontalMovementComponent = new HorizontalMovementComponent(
            this,
            this.#inputComponent,
            ENEMY_CONFIG.FIGHTER.HORIZONTAL.VELOCITY,
            ENEMY_CONFIG.FIGHTER.HORIZONTAL.VELOCITY_MAX,
            ENEMY_CONFIG.FIGHTER.HORIZONTAL.DRAG,
        );
        this.#verticalMovementComponent = new VerticalMovementComponent(
            this,
            this.#inputComponent,
            ENEMY_CONFIG.FIGHTER.VERTICAL.VELOCITY,
            ENEMY_CONFIG.FIGHTER.VERTICAL.VELOCITY_MAX,
            ENEMY_CONFIG.FIGHTER.VERTICAL.DRAG,
        );
        this.#weaponComponent = new WeaponComponent(this, this.#inputComponent, {
            speed: ENEMY_CONFIG.FIGHTER.WEAPON.SPEED,
            interval: ENEMY_CONFIG.FIGHTER.WEAPON.INTERVAL,
            lifespan: ENEMY_CONFIG.FIGHTER.WEAPON.LIFESPAN,
            maxCount: ENEMY_CONFIG.FIGHTER.WEAPON.ROUNDS_RENDER_MAX,
            flipY: true,
            yOffset: 10,
        });

        this.scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.once(
            Scenes.Events.DESTROY,
            () => {
                this.scene.events.off(Scenes.Events.UPDATE, this.update, this);
            },
            this,
        );
    }

    update(_timestamp: number, delta: number) {
        this.#inputComponent.update();
        this.#horizontalMovementComponent.update();
        this.#verticalMovementComponent.update();
        this.#weaponComponent.update(delta);
    }
}
