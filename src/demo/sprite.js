import {GridOutline} from '../js/graphics';
import {SpriteRenderer} from '../js/graphics/SpriteRenderer';
import {SpriteAtlas, detectSpriteBounds} from '../js/graphics/SpriteAtlas';
import {SpriteAtlasRenderer} from '../js/graphics/SpriteAtlasRenderer';
import {Sprite} from '../js/components';
import {loadImage} from '../js/util';
import App from '../js/app';
import '../css/app.css';

const mountPoint = document.getElementById('content');
const canvas = document.createElement('canvas');
canvas.classList.add('game');
mountPoint.appendChild(canvas);

const app = new App({
    el: canvas,
    resolution: {
        width: 320,
        height: 224
    },
    pixelMultiplier: 2,
    debug: false,
    clearColor: [0.1, 0.1, 0.1, 1]
});

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

async function run() {
    const atlas = new SpriteAtlas(512, 512, 2);
    const atlasRenderer = new SpriteAtlasRenderer({
        game: app,
        atlas
    });

    (img => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, img.width, img.height);

        const spriteBounds = detectSpriteBounds(data, true);

        spriteBounds.forEach((rect, idx) => {
            atlas.add(ctx, `pk_${idx}`, rect);
        });
    })((await loadImage('img/plague_knight.png')));

    //atlas.downloadLayers('plague_knight', 2);

    await app.loader.loading;

    const renderer = new SpriteRenderer({
        game: app,
        textureInfo: {
            texture: app.loader.getTexture('sonic'),
            ...app.resolution
        }
    });

    const framebufferRenderer = new SpriteRenderer({
        game: app,
        textureInfo: {
            texture: app.framebuffer.texture,
            ...app.resolution
        }
    });

    const grid = new GridOutline(app);
    // grid.addGrid( 8,  8, [0.4, 0.1, 0.9, 0.4], 0.25);
    // grid.addGrid(16, 16, [0.1, 0.3, 0.9, 0.4], 0.5);
    //grid.addGrid(32, 32, [1, 1, 1, 1], 0.5);

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

    let angle = 0;

    requestAnimationFrame(function render() {
        app.framebuffer.attach();
        app.clear();
        app.enableCamera();

        atlasRenderer.renderLayer(0, [160, 224/2], [0.5, 0.5], angle);

        app.framebuffer.detach();
        app.adjustViewport();

        framebufferRenderer.render([
            new Sprite({
                position: [0, 0],
                size: [app.resolution.width, app.resolution.height]
            })
        ]);

        angle += 0.001;
        requestAnimationFrame(render);
    });
}

run();
