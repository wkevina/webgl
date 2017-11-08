import {_} from 'underscore';

import {TilemapRenderer,SpriteRenderer,
        GridOutline} from 'graphics.js';
import {Sprite} from 'components.js';
import App from 'app.js';
import '../css/app.css'

const mountPoint = document.getElementById('content');
const canvas = document.createElement('canvas');
canvas.classList.add('game')
mountPoint.appendChild(canvas);

const app = new App({
    el: canvas,
    resolution: {
        width: 256,
        height: 224
    },
    debug: false,
    clearColor: [0.1, 0.1, 0.1, 1]
});

app.start();

app.load({
    basePath: 'shaders/',
    programs: ['sprite', 'grid', 'tilemap']
});

app.load({
    basePath: 'img/',
    textures: {
        sonic: {
            src: 'img/Sonic1.gif',
            mag: app.gl.NEAREST,
            min: app.gl.LINEAR,
            flipY: true
        },
        // mario: {
        //     target: app.gl.TEXTURE_2D_ARRAY,
        //     src: _.range(20).map(i => `img/mario.png.tileset/${i}.png`),
        //     mag: app.gl.NEAREST,
        //     min: app.gl.LINEAR,
        //     flipY: true
        // }
    }
});

console.log(app.gl.getParameter(app.gl.MAX_ARRAY_TEXTURE_LAYERS));

async function run() {
    await app.loader.loading;

    const framebufferRenderer = new SpriteRenderer({
        game: app,
        textureInfo: {
            texture: app.framebuffer.texture,
            ...app.resolution
        }
    });

    const renderer = new SpriteRenderer({
        game: app,
        textureInfo: {
            texture: app.loader.getTexture('sonic'),
            ...app.resolution
        }
    });

    //const renderer = new TilemapRenderer({game: app, tilemap: {}});

    const grid = new GridOutline(app);
    grid.addGrid( 8,  8, [1, 1, 1, 1], 0.5);
    grid.addGrid(16, 16, [1, 1, 1, 0.5], 1);
    grid.addGrid(32, 32, [1, 1, 1, 0.5], 1);

    requestAnimationFrame(function render() {
        app.framebuffer.attach();
        app.clear();

        renderer.render([
            new Sprite({
                position: [10, 10],
                size: [300, 734]
            })
        ]);

        grid.render();

        app.framebuffer.detach();
        app.adjustViewport();

        app.clear();

        framebufferRenderer.render([
            new Sprite({
                position: [0, 0],
                size: [app.resolution.width, app.resolution.height]
            })
        ]);



        requestAnimationFrame(render);
    });
}

run();
