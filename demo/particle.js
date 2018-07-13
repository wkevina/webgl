import {Sprite} from '../js/graphics/Sprite';
import {Grid} from '../js/graphics/Grid';
import {ParticleSystem} from '../js/particle';
import App from '../js/app';
import '../css/app.css';
import {SpriteRenderer} from "../js/graphics/SpriteRenderer";

const mountPoint = document.getElementById('content');
const canvas = document.createElement('canvas');
canvas.classList.add('game');
mountPoint.appendChild(canvas);

const app = new App({
    el: canvas,
    resolution: {
        width: 320,
        height: 240
    },
    debug: false,
    clearColor: [0,0,0,1]//[0.2, 0.2, 0.2, 1]
});


app.load({
    basePath: 'shaders/',
    programs: [
        {
            name: 'particle.simulate',
            opts: {
                transformFeedbackVaryings: ['v_position', 'v_velocity']
            }
        },
         'particle.draw',
         'grid',
         'sprite'
     ]
});

class PixelBufferWrapper {
    constructor(opts) {
        let {buffer, width, height, components} = opts;
        this.buffer = buffer;
        this.width = width;
        this.height = height;
        this.components = components;
    }

    setPixel(x, y, value) {
        const index = (y*this.width + x)*this.components;
        if (index >= 0 && index < this.buffer.length) {
            this.buffer.set(value, index);
        }
    }
}

class BarrierTextureBuilder {
    constructor(opts) {
        let {width, height} = opts;

        this.buffer = new Float32Array(2 * width * height);

        let angle = 0;
        let length = 0;
        for (let i = 0; i < width * height; i++) {
            length += Math.random() * 0.5;
            if (length > 5) length = 5;
            if (length < -5) length = -5;
            angle += Math.random() * Math.PI;
            this.buffer[i * 2] = Math.cos(angle) * length * 0.01;
            this.buffer[i * 2 + 1] = Math.sin(angle) * length * 0.01;
        }

        this.pixelBuffer = new PixelBufferWrapper({buffer: this.buffer, width, height, components: 2});

        this.width = width;
        this.height = height;
    }

    line(start, end, thickness) {
        let normal = [ - (end[1] - start[1]), end[0] - start[0] ];
        let inv_mag = 1 / Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1]);
        normal = [normal[0] * inv_mag, normal[1] * inv_mag];

        bresenham(start[0], start[1], end[0], end[1], (x, y) => {
            this.pixelBuffer.setPixel(x, y, normal);
        });
    }

    rect(origin, size) {
        this.line([origin[0], origin[1] + size[1]], [origin[0] + size[0], origin[1] + size[1]]);
        this.line([origin[0] + size[0], origin[1] + size[1]], [origin[0] + size[0], origin[1]]);

        this.line([origin[0] + size[0], origin[1]], [origin[0], origin[1]]);
        this.line([origin[0], origin[1]], [origin[0], origin[1] + size[1]]);
    }

}

function bresenham(x0, y0, x1, y1, cb){
    var dx = Math.abs(x1-x0);
    var dy = Math.abs(y1-y0);
    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;
    var err = dx-dy;

    while(true){
        cb(x0,y0);

        if ((x0===x1) && (y0===y1)) break;
        var e2 = 2*err;
        if (e2 >-dy){ err -= dy; x0  += sx; }
        if (e2 < dx){ err += dx; y0  += sy; }
    }
}

const wallBuilder = new BarrierTextureBuilder({width: 320, height: 240});

wallBuilder.rect([160, 60], [60, 60])

wallBuilder.line([0, 150], [106, 20]);
wallBuilder.line([0, 150-1], [106, 20-1]);

wallBuilder.line([106, 20], [214, 20]);
wallBuilder.line([106, 20-1], [214, 20-1]);

wallBuilder.line([214, 20], [320, 150]);
wallBuilder.line([214, 20-1], [320, 150-1]);

//
// for (let i = 0; i < 20; i++) {
//     wallBuilder.line([0, 0 + i], [319, 239 + i]);
// }
// for (let i = 0; i < 20; i++) {
//     wallBuilder.line([319 + i, 238], [1 + i, 0]);
// }
//
// for (let i = 0; i < 20; i++) {
//     wallBuilder.line([0, 239 + i], [319, 0 + i]);
// }
// for (let i = 0; i < 20; i++) {
//     wallBuilder.line([319, 0 - i], [0, 239 - i]);
// }


const MAX_PARTICLES = 10000;


app.load({
    textures: {
        wallForce: {
            internalFormat: app.gl.RG32F,
            format: app.gl.RG,
            type: app.gl.FLOAT,
            src: wallBuilder.buffer,
            width: wallBuilder.width,
            height: wallBuilder.height,
            magMag: app.gl.NEAREST
        }
    }
});

async function run() {
    await app.loader.loading;

    const particles = new ParticleSystem({game: app, maxParticles: MAX_PARTICLES});

    const framebufferRenderer = new SpriteRenderer({
        game: app,
        textureInfo: {
            texture: app.framebuffer.texture,
            ...app.resolution
        }
    });

    requestAnimationFrame(function render() {
        app.adjustViewport();
        app.clear();

        app.framebuffer.attach();
        app.clear();

        particles.draw();

        app.framebuffer.detach();

        app.adjustViewport();

        framebufferRenderer.render(
            [
                new Sprite({
                    position: [0, 0],
                    size: [app.resolution.width, app.resolution.height]
                })
            ],
            app.projection
        );

        if (!app.debug) {
            requestAnimationFrame(render);
        }
    });
}

run();
