import {TilemapTextureBuilder, GridOutline} from '../js/graphics.js';
import {Sprite} from '../js/components.js';
import {loadImage} from '../js/util.js';
import '../css/app.css'

import App from 'app.js';
import {TilemapRenderer} from "../js/graphics/TilemapRenderer";
import {SpriteRenderer} from "../js/graphics/SpriteRenderer";


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

    const framebufferRenderer = new SpriteRenderer({
        game: app,
        textureInfo: {
            texture: app.framebuffer.texture,
            ...app.resolution
        }
    });

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

        app.framebuffer.attach();
        app.clear();

        renderer.draw({
            x: 0,
            y: 224,
            width: 320,
            height: 224
        });

        grid.render();

        app.framebuffer.detach();
        app.adjustViewport();

        framebufferRenderer.render([
            new Sprite({
                position: [0, 0],
                size: [app.resolution.width, app.resolution.height]
            })
        ]);

        if (!app.debug) {
            requestAnimationFrame(render);
        }
    });
}

run();
