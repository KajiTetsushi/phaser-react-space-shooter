import { Scene } from 'phaser';

export default class PreloadScene extends Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.pack('asset_pack', 'assets/data/assets.json');
    }

    create() {
        this.#createAnimations();
        this.scene.start('GameScene');
    }

    #createAnimations() {
        (
            this.cache.json.get('animations_json') as typeof import('../../../public/assets/data/animations.json')
        ).forEach((animation) => {
            const frames = animation.frames
                ? this.anims.generateFrameNumbers(animation.assetKey, { frames: animation.frames })
                : this.anims.generateFrameNumbers(animation.assetKey);
            this.anims.create({
                key: animation.key,
                frames: frames,
                frameRate: animation.frameRate,
                repeat: animation.repeat,
            });
        });
    }
}
