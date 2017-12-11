import _ from 'underscore';

import {GridOutline} from '../js/graphics';
import {SpriteRenderer} from '../js/graphics/SpriteRenderer';
import {SpriteAtlas, detectSpriteBounds} from '../js/graphics/SpriteAtlas';
import {SpriteAtlasRenderer} from '../js/graphics/SpriteAtlasRenderer';
import {Sprite} from '../js/graphics/Sprite';
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

        const {spriteBounds, keyColor} = detectSpriteBounds(data, true);

        for (let i = 0; i < data.data.length / 4; ++i) {
            const pixel = data.data.slice(i*4, i*4 + 4);

            if (pixel[0] === keyColor[0] &&
                pixel[1] === keyColor[1] &&
                pixel[2] === keyColor[2] &&
                pixel[3] === keyColor[3]
            ) {
                data.data.set([0, 0, 0, 0], i*4);
            }
        }

        ctx.putImageData(data, 0, 0);

        spriteBounds.forEach((rect, idx) => {
            atlas.add(ctx, `pk_${idx}`, rect);
        });
    })((await loadImage('img/plague_knight.png')));

    //atlas.downloadLayers('plague_knight', 2);

    await app.loader.loading;

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

    // _.range(10).forEach(() => {
    //    const sprite = new Sprite({
    //        position: [Math.random() * app.resolution.width, Math.random() * app.resolution.height],
    //        textureName: `pk_${Math.floor(Math.random() * 10)}`,
    //        angle: Math.random() * Math.PI
    //    });
    //
    //     sprites.push(sprite);
    // });

    const plague_knight = new Sprite({
        position: [160, 112],
        offset: [0.5, 0.5],
        textureName: 'pk_0'
    });

    let frame = 0, index = 0;

    requestAnimationFrame(function render() {
        app.framebuffer.attach();
        app.clear();
        app.enableCamera();

        plague_knight.textureName = atlas.entries[index][0];

        if (frame % 4 === 0) {
            index++;
        }

        if (index >= atlas.entries.length) {
            index = 0;
        }

        //atlasRenderer.renderLayer(0, [160, 224/2], [0.5, 0.5], angle);
        atlasRenderer.render([plague_knight]);
        atlasRenderer.render(sprites);

        app.framebuffer.detach();
        app.adjustViewport();

        framebufferRenderer.render(
            [new Sprite({
                position: [0, 0],
                size: [app.resolution.width, app.resolution.height]
            })],
            app.projection
        );

        //plague_knight.angle += 0.001;
        requestAnimationFrame(render);
        frame++;
    });
}

run();
