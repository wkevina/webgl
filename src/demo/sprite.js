import {SpriteRenderer,
        GridOutline} from 'graphics.js';
import {Sprite} from 'components.js';
import App from 'app.js';
import '../css/app.css'

const mountPoint = document.getElementById('content');
const canvas = document.createElement('canvas');
canvas.classList.add('game')
mountPoint.appendChild(canvas);
const app = new App({el: canvas, debug: false, clearColor: [0.1, 0.1, 0.1, 1]});
app.start();

app.load({
    basePath: 'shaders/',
    paths: ['sprite.frag', 'sprite.vert',
            'grid.frag', 'grid.vert']
});

app.load({
    basePath: 'img/',
    textures: {
        sonic: {
            src: 'img/Sonic1.gif',
            mag: app.gl.NEAREST,
            min: app.gl.LINEAR,
            flipY: true
        }
    }
});

async function run() {
    await app.loader.loading;

    const renderer = new SpriteRenderer(app);
    const grid = new GridOutline(app);

    const sprites = [];
    // for (let i = 0; (i < app.resolution.width / 32); ++i) {
    //     for (let j = 0; j < (app.resolution.height / 32); ++j) {
    //         sprites.push(new Sprite([i * 32 + 10, j * 32 + 10], [20, 40]));
    //         break;
    //     }
    //     break;
    // }

    sprites.push(
        new Sprite([20, 40], [40, 80])
    );

    requestAnimationFrame(function render() {
        app.adjustViewport();
        app.clear();
        renderer.render(sprites);
        grid.render( 8,  8, [0.0,0.1,0.4,0.2], 0.25);
        grid.render(16, 16, [0,0.5,0,0.2], 0.25);
        grid.render(32, 32, [1,0,0,0.2], 0.25);
        requestAnimationFrame(render);
    });
}

run();
