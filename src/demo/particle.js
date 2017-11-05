import {_} from 'underscore'

import {GridOutline} from 'graphics.js';
import {ParticleSystem} from 'particle.js';
import App from 'app.js';
import '../css/app.css'

const mountPoint = document.getElementById('content');
const canvas = document.createElement('canvas');
canvas.classList.add('game')
mountPoint.appendChild(canvas);

const app = new App({
    el: canvas,
    resolution: {
        width: 320,
        height: 240
    },
    debug: false,
    clearColor: [0.1, 0.1, 0.1, 1]
});

app.start();

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
         'grid'
     ]
})

console.log(app.gl.getParameter(app.gl.MAX_ARRAY_TEXTURE_LAYERS));

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
        this.pixelBuffer = new PixelBufferWrapper({buffer: this.buffer, width, height, components: 2});

        this.width = width;
        this.height = height;
    }

    line(start, end, thickness) {
        let normal = [ end[1] - start[1], end[0] - start[0] ];
        let inv_mag = 1 / Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1]);
        normal = [normal[0] * inv_mag, normal[1] * inv_mag];

        bresenham(start[0], start[1], end[0], end[1], (x, y) => {
            this.pixelBuffer.setPixel(x, y, normal);
        });
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

        if ((x0==x1) && (y0==y1)) break;
        var e2 = 2*err;
        if (e2 >-dy){ err -= dy; x0  += sx; }
        if (e2 < dx){ err += dx; y0  += sy; }
    }
}

const wallBuilder = new BarrierTextureBuilder({width: 320, height: 240});
wallBuilder.line([0,0], [319, 239]);

async function run() {
    await app.loader.loading;

    const grid = new GridOutline(app);

    const particles = new ParticleSystem(app);

    requestAnimationFrame(function render() {
        app.adjustViewport();
        app.clear();
        grid.render( 8,  8, [0.4, 0.1, 0.9, 0.4], 0.25);
        //grid.render(16, 16, [0.1, 0.3, 0.9, 0.4], 0.5);
        particles.draw();
        //grid.render(32, 32, [0,   0.5, 0.9, 0.3], 1);

        requestAnimationFrame(render);
    });
}

run();
