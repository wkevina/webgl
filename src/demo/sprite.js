import {Loader} from 'resource.js';
import {SpriteRenderer} from 'graphics.js';
import {Sprite} from 'components.js';
import App from 'app.js';
import '../css/app.css'

const mountPoint = document.getElementById('content');
const canvas = document.createElement('canvas');
mountPoint.appendChild(canvas);
const app = new App({el: canvas, debug: false});
app.start();

const gl = app.gl;

const loader = new Loader({
    basePath: 'shaders/',
    paths: ['sprite.frag', 'sprite.vert']
})

async function run() {
    await loader.loading;

    const renderer = new SpriteRenderer(gl, loader);

    app.clear();

    const sprites = [new Sprite([0, 0], [32, 32])];

    renderer.render(sprites);
}

run();
