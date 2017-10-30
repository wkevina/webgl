import {_} from 'underscore'

import {TilemapRenderer,
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
        width: 640,
        height: 480
    },
    debug: false,
    clearColor: [0.1, 0.1, 0.1, 1]
});

app.start();

app.load({
    basePath: 'shaders/',
    programs: ['sprite', 'grid', 'tilemap']
})

app.load({
    basePath: 'img/',
    textures: {
        sonic: {
            src: 'img/Sonic1.gif',
            mag: app.gl.NEAREST,
            min: app.gl.LINEAR,
            flipY: true
        },
        mario: {
            target: app.gl.TEXTURE_2D_ARRAY,
            src: _.range(20).map(i => `img/mario.png.tileset/${i}.png`),
            mag: app.gl.NEAREST,
            min: app.gl.LINEAR,
            flipY: true
        }
    }
});

console.log(app.gl.getParameter(app.gl.MAX_ARRAY_TEXTURE_LAYERS));

async function run() {
    await app.loader.loading;

    const renderer = new TilemapRenderer({game: app, tilemap: {}});
    const grid = new GridOutline(app);

    requestAnimationFrame(function render() {
        app.adjustViewport();
        app.clear();
        grid.render( 8,  8, [0.4, 0.1, 0.9, 0.4], 0.25);
        grid.render(16, 16, [0.1, 0.3, 0.9, 0.4], 0.5);
        grid.render(32, 32, [0,   0.5, 0.9, 0.3], 1);

        requestAnimationFrame(render);
    });
}

run();
