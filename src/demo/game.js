import {App, initCanvas} from '../js/app.js';
import {Stage} from '../js/Stage';
import {loadImage} from '../js/util';

import '../css/app.css';
import {SpriteAtlas} from "../js/graphics/SpriteAtlas";
import {Scene} from "../js/Scene";
import {BackgroundLayer} from "../js/layers/BackgroundLayer";
import {Keyboard} from "../js/controls";

const run = async () => {
    const app = new App({
        el: initCanvas('content', 'game'),
        debug: false,
        clearColor: [0.0, 1.0, 1.0, 1],
        resolution: {
            width: 480,
            height: 270
        },
        pixelMultiplier: 2
    });

    const atlas = new SpriteAtlas(undefined, undefined, 2);

    {
        const img = await createImageBitmap(await loadImage('img/background0.png'));
        atlas.add(img, 'background0');
    }

    {
        const img = await createImageBitmap(await loadImage('img/background1.png'));
        atlas.add(img, 'background1');
    }

    app.setStage(new class extends Stage {
        setup() {
            let scene = new class extends Scene {
                setup() {
                    this.keyboard = new Keyboard();
                    this.grid.addGrid(16, 16, [0.1, 0.7, 0.9, 0.4], 1);
                    //this.showGrid = true;
                }

                update(_dt) {
                    super.update(_dt);

                    let dt = 0.1 * _dt;

                    if (this.keyboard.isdown("ArrowRight")) {
                        this.graphicsState.camera.translate(dt, 0);
                    }
                    if (this.keyboard.isdown("ArrowLeft")) {
                        this.graphicsState.camera.translate(-dt, 0);
                    }
                    if (this.keyboard.isdown("ArrowUp")) {
                        this.graphicsState.camera.translate(0, dt);
                    }
                    if (this.keyboard.isdown("ArrowDown")) {
                        this.graphicsState.camera.translate(0, -dt);
                    }
                }
            };
            scene.setAtlas(atlas);
            this.addScene(scene);

            scene.addLayer(new BackgroundLayer({
                imageID: 'background0',
                width: 320,
                height: 240,
                fixed: true
            }));

            scene.addLayer(new BackgroundLayer({
                imageID: 'background1',
                width: 320,
                height: 240,
                fixed: false,
                parallax: [0.5, 0.1]
            }));

            scene.addLayer(new BackgroundLayer({
                imageID: 'background1',
                width: 320,
                height: 240,
                fixed: false,
                parallax: [1, 0.2]
            }));
        }
    });

    app.start();
};

run();
