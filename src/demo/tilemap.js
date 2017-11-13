import {TilemapTextureBuilder, TilemapRenderer, GridOutline, SpriteRenderer} from 'graphics.js';
import {Sprite} from 'components.js';
import {loadImage} from 'util.js';
import '../css/app.css'

import App from 'app.js';


const mountPoint = document.getElementById('content');
const canvas = document.createElement('canvas');
canvas.classList.add('game');
mountPoint.appendChild(canvas);


const app = new App({
    el: canvas,
    debug: false,
    clearColor: [0.1, 0.1, 0.1, 1],
    resolution: {
        width: 320,
        height: 224
    }
});


app.load({
    basePath: 'shaders/',
    programs: ['grid', 'tilemap', 'sprite']
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
    //grid.addGrid( 8,  8, [0.4, 0.1, 0.9, 0.4], 1);
    //grid.addGrid(16, 16, [0.1, 0.3, 0.9, 0.4], 1);
    //grid.addGrid(32, 32, [0,   0.5, 0.9, 0.3], 1);


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
                size: [app.resolution.width - 1, app.resolution.height - 1]
            })
        ]);

        requestAnimationFrame(render);
    });
}

run();
