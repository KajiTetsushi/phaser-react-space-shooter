import type { Scene } from 'phaser';

export default function PauseGameManager(scene: Scene) {
    const pausedText = scene.add
        .text(scene.scale.width / 2, scene.scale.height / 2, 'PAUSED', {
            fontSize: '24px',
        })
        .setOrigin(0.5)
        .setVisible(false);

    window.addEventListener('keyup', (event) => {
        if (event.key !== 'Enter') {
            return;
        }

        if (!scene.sys.isPaused()) {
            scene.sys.pause();
            pausedText.setVisible(true);
        } else {
            scene.sys.resume();
            pausedText.setVisible(false);
        }
    });
}
