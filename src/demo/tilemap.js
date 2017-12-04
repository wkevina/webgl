import {TilemapTextureBuilder, GridOutline} from '../js/graphics.js';
import {Sprite} from '../js/components.js';
import {loadImage} from '../js/util.js';
import '../css/app.css'

import App from 'app.js';
import {TilemapRenderer} from "../js/graphics/TilemapRenderer";
import {SpriteRenderer} from "../js/graphics/SpriteRenderer";
import {CameraPan} from '../js/controls';


const mountPoint = document.getElementById('content');
const canvas = document.createElement('canvas');
canvas.classList.add('game');
mountPoint.appendChild(canvas);


const app = new App({
    el: canvas,
    clearColor: [0.1, 0.1, 0.1, 1],
    resolution: {
        width: 320,
        height: 224
    },
    pixelMultiplier: 3
});

const cameraControl = new CameraPan(app);


app.load({
    basePath: 'shaders/',
    programs: ['tilemap', 'grid', 'sprite']
});


// app.load({
//     basePath: 'img/',
//     textures: {
//         sonic: {
//             src: 'img/Sonic1.gif',
//             mag: app.gl.NEAREST,
//             min: app.gl.LINEAR,
//             flipY: true
//         }
//     }
// });

class RenderToTexture {
    constructor(resolution) {
        this.offscreenFramebuffer = offscreenFramebufferAttachment(gl, resolution.width, resolution.height);

        this.blitter = new SpriteRenderer({
            game: app,
            textureInfo: {
                texture: this.offscreenFramebuffer.texture,
                ...resolution
            }
        });

        this.sprite = new Sprite({
            position: [0, 0],
            size: [resolution.width, resolution.height]
        });
    }

    capture() {
        this.offscreenFramebuffer.attach();
    }

    stopCapture() {
        this.offscreenFramebuffer.detach();
    }

    render() {
        framebufferRenderer.render([this.sprite]);
    }
}


const tilemapTex = new TilemapTextureBuilder({
    tileWidth: 16,
    tileHeight: 16,
    width: 16,
    height: 16,
    layers: 4
});

async function run() {
    await app.loader.loading;

    tilemapTex.addTiles(await loadImage('img/mario.png'));

    const offscreenTexture = new RenderToTexture(app.resolution);

    const renderer = new TilemapRenderer({
        game: app,
        textureArray: tilemapTex.texture,
        tilemap: {
            tileWidth: 16,
            tileHeight: 16,
            width: 33,
            height: 28,
            getTile(x, y) {
                const w = 33;
                const h = 28;

                x = x % w;
                y = y % h;

                return x + (h - y - 1) * w;
            }
        }
    });

    const grid = new GridOutline(app);
    grid.addGrid(16, 16, [1, 1, 1, 0.5], 1);

    requestAnimationFrame(function render() {
        app.adjustViewport();
        app.clear();

        offscreenTexture.capture();
        app.clear();

        app.enableCamera();

        renderer.draw({
            x: 0,
            y: 224,
            width: 320,
            height: 224
        });

        grid.render();

        offscreenTexture.stopCapture();

        app.disableCamera();
        app.adjustViewport();

        offscreenTexture.render();

        if (!app.debug) {
            requestAnimationFrame(render);
        }
    });
}

run();
