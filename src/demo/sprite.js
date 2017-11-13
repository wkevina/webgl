import {SpriteRenderer,
        GridOutline} from 'graphics.js';
import {Sprite} from 'components.js';
import App from 'app.js';
import '../css/app.css';

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

// app.load({
//     basePath: 'shaders/',
//     paths: ['sprite.frag', 'sprite.vert',
//             'grid.frag', 'grid.vert']
// });

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
        }
    }
});

console.log(app.gl.getParameter(app.gl.MAX_ARRAY_TEXTURE_LAYERS));

async function run() {
    await app.loader.loading;

    const renderer = new SpriteRenderer({
        game: app,
        textureInfo: {
            texture: app.loader.getTexture('sonic'),
            ...app.resolution
        }
    });

    const grid = new GridOutline(app);
    grid.addGrid( 8,  8, [0.4, 0.1, 0.9, 0.4], 0.25);
    grid.addGrid(16, 16, [0.1, 0.3, 0.9, 0.4], 0.5);
    grid.addGrid(32, 32, [0,   0.5, 0.9, 0.3], 1);

    const sprites = [];
    // for (let i = 0; (i < app.resolution.width / 32); ++i) {
    //     for (let j = 0; j < (app.resolution.height / 32); ++j) {
    //         sprites.push(new Sprite([i * 32 + 10, j * 32 + 10], [20, 40]));
    //         break;
    //     }
    //     break;
    // }

    sprites.push(
        new Sprite({
            position: [10, 10],
            size: [300, 734]
        })
    );

    requestAnimationFrame(function render() {
        app.adjustViewport();
        app.clear();
        //renderer.render(sprites);
        grid.render();
        requestAnimationFrame(render);
    });
}

run();
