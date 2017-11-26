import {GridOutline, SpriteRenderer, LineRenderer} from '../js/graphics.js';
import {MouseListener} from '../js/input.js';
import {Sprite} from '../js/components.js';
import {mat3, vec3} from 'gl-matrix';
import '../css/app.css'

import {App, initCanvas} from '../js/app.js';




const app = new App({
    el: initCanvas('content', 'game'),
    debug: false,
    clearColor: [0.1, 0.1, 0.1, 1],
    resolution: {
        width: 320,
        height: 240
    }
});


app.load({
    basePath: 'shaders/',
    programs: ['grid', 'sprite', 'lines']
});


const parsePathString = (s) => {
    const parseCoord = (p) => {
        return p.split(',').map(parseFloat);
    };

    return s.split(" ").map(parseCoord);
};

const pathToPositions = (path, offset) => {
    const out = [];

    for (let i = 0; i < path.length; i++) {
        out.push(...path[i]);
        if (!(i === 0 || i === path.length - 1)) {
            out.push(...path[i]);
        }
    }

    return out.map((position, index) => {
        if (index % 2 === 0) {
            return position + offset.x;
        } else {
            return position + offset.y;
        }
    });
};

class MouseDrawing {
    constructor(game) {
        this.game = game;

        // this.callbacks = {
        //     lineAddedCallback
        // };

        this._lineData = new Float32Array(2 * 2 * 1024);
        this.currentLineIdx = 0;
        this.available = 0;
        this.isDrawing = false;

        this.game.canvas.addEventListener('mousemove', (evt) => {
            this.update(this.convertMouseCoordinates({ x: evt.offsetX, y: evt.offsetY }));
        });

        this.game.canvas.addEventListener('mousedown', (evt) => {
            if (!this.isDrawing) {
                this.startLine(this.convertMouseCoordinates({ x: evt.offsetX, y: evt.offsetY }));
            } else {
                this.endLine(this.convertMouseCoordinates({ x: evt.offsetX, y: evt.offsetY }));
            }
        });
    }

    convertMouseCoordinates(coord) {
        const mvec = vec3.fromValues(coord.x, coord.y, 1);

        vec3.transformMat3(mvec, mvec, this.game.canvasToWorld);

        return { x: mvec[0], y: mvec[1] };
    }

    inBounds(coord) {
        return true;
    }

    startLine(coord) {
        if (this.inBounds(coord) && !this.isDrawing) {
            this.isDrawing = true;
            this.available++;

            this._lineData[this.lineIndex + 0] = coord.x;
            this._lineData[this.lineIndex + 1] = coord.y;

            this.update(coord);
        }
    }

    get lineIndex() {
        return this.currentLineIdx * 4;
    }

    get lineData() {
        return this._lineData.slice(0, this.available * 4);
    }

    endLine(coord) {
        if (this.isDrawing) {
            this.isDrawing = false;

            this._lineData[this.lineIndex + 2] = coord.x;
            this._lineData[this.lineIndex + 3] = coord.y;

            this.currentLineIdx++;
        }
    }

    update(coord) {
        if (this.isDrawing) {
            this._lineData[this.lineIndex + 2] = coord.x;
            this._lineData[this.lineIndex + 3] = coord.y;
        }
    }
}


const startDrawing = (lineData) => {
    new MouseListener(app.canvas, (({mousePosition}) => {

    }));
};


async function run() {
    await app.loader.loading;

    const framebufferRenderer = new SpriteRenderer({
        game: app,
        textureInfo: {
            texture: app.framebuffer.texture,
            ...app.resolution
        }
    });

    const svgData = "4.8568191,153.96584 97.697976,10.708555 198.82851,9.0231583 314.87993,96.662894 296.64327,192.72952 137.48702,236.54939 4.8568191,153.96584";
    //const svgData = "0,0 160,10 200,100 160,224";
    const lineData = pathToPositions(parsePathString(svgData), {x:0, y:0}); //{ x: 320/2, y: 240/2 });

    const lineDrawer = new MouseDrawing(app);

    //startDrawing(lineData);

    const grid = new GridOutline(app);
    grid.addGrid( 8,  8, [0.4, 0.1, 0.9, 0.4], 1);
    //grid.addGrid(16, 16, [0.1, 0.3, 0.9, 0.4], 1);
    //grid.addGrid(32, 32, [0,   0.5, 0.9, 0.3], 1);

    const lineRenderer = new LineRenderer({
        game: app
    });


    requestAnimationFrame(function render() {
        app.adjustViewport();
        app.clear();

        app.framebuffer.attach();
        app.clear();

        if (lineDrawer.available > 0) {
            lineRenderer.render(lineDrawer.lineData, [1, 1, 1, 1]);
        }

        //grid.render();

        app.framebuffer.detach();
        app.adjustViewport();

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
