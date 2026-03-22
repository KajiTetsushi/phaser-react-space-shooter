import { GameObjects, type Scene } from 'phaser';

export default class Player extends GameObjects.Container {
    #shipSprite: GameObjects.Sprite;
    #shipEngineSprite: GameObjects.Sprite;
    #shipEngineThrusterSprite: GameObjects.Sprite;

    constructor(scene: Scene, _x: number, _y: number) {
        super(scene, scene.scale.width / 2, scene.scale.height - 32, []);

        this.#shipSprite = scene.add.sprite(0, 0, 'ship');
        this.#shipEngineSprite = scene.add.sprite(0, 0, 'ship_engine');
        this.#shipEngineThrusterSprite = scene.add.sprite(0, 0, 'ship_engine_thruster');
        this.#shipEngineThrusterSprite.play('ship_engine_thruster');
        this.add([
            // Ship is on top, so it's added last.
            this.#shipEngineThrusterSprite,
            this.#shipEngineSprite,
            this.#shipSprite,
        ]);

        scene.add.existing(this);
    }
}
