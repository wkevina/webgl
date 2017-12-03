import {Loader} from 'resource.js';
import {CoordinateConversions, Camera} from 'graphics.js';
import {mat3, mat4} from 'gl-matrix';
import {registerContext, gl} from 'gl.js';
import {attachFramebuffer} from 'util.js';
import 'vendor/webgl-debug.js'

//import * as glMatrix from 'gl-matrix';

function logGLCall(functionName, args) {
    console.log("gl." + functionName + "(" +
        WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}

function throwOnGLError(err, funcName, args) {
    throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
}

const initCanvas = (containerId, canvasClass) => {
    if (!containerId) {
        throw new Error('argument containerId, id of containing element required');
    }
    const mountPoint = document.getElementById(containerId);
    const canvas = document.createElement('canvas');
    if (canvasClass) {
        canvas.classList.add(canvasClass);
    }
    mountPoint.appendChild(canvas);

    return canvas;
};

/**
 * options:
 * el
 * debug - default: false
 * clearColor - default: [0.4, 0.4, 0.4, 1]
 * resolution - default: { width: 352, height: 224 }
 * pixelMultiplier - default: 2
 */
class App {
    constructor(options) {
        this.clearColor = options.clearColor || [0.4, 0.4, 0.4, 1];
        this.resolution = options.resolution || { width: 352, height: 224 };
        this.pixelMultiplier = options.pixelMultiplier || 2;
        this.debug = options.debug;

        if (typeof options.el === 'string') {
            this.canvas = document.getElementById(options.el);
        } else {
            this.canvas = options.el;
        }

        // create rendering context
        this.gl = this.canvas.getContext('webgl2');

        if (this.debug) {
            WebGLDebugUtils.init(this.gl);
            this.gl = WebGLDebugUtils.makeDebugContext(this.gl, undefined, logGLCall);
        }

        registerContext(this.gl);

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        this.framebuffer = attachFramebuffer(gl, this.resolution.width, this.resolution.height);
        this.loader = new Loader();
        this.projection = mat4.ortho(mat4.create(), 0, this.resolution.width, 0, this.resolution.height, -1, 1);
        this.camera = new Camera(this.resolution);
        this.updateCanvasSize();
        this.adjustViewport();
    }

    updateCanvasSize() {
        const width = this.resolution.width * this.pixelMultiplier;
        const height = this.resolution.height * this.pixelMultiplier;

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }

    adjustViewport() {
        const canvas_width = this.canvas.clientWidth;
        const canvas_height = this.canvas.clientHeight;

        this.gl.viewport(0, 0, canvas_width, canvas_height);

        this._canvasToWorld = CoordinateConversions.canvasToWorldMatrix(
            this.camera.matrix,
            { width: canvas_width, height: canvas_height },
            this.resolution
        );
    }

    clear() {
        this.gl.clearColor(...this.clearColor);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    load(paths) {
        return this.loader.load(paths);
    }

    getProgram(key) {
        const ret = this.loader.getProgram(key);

        if (!ret) {
            throw `No program loaded for key '${key}'`;
        }

        return ret;
    }

    get canvasToWorld() {
        return this._canvasToWorld;
    }

    get viewMatrix() {
        return mat4.multiply(mat4.create(), this.projection, this.camera.matrix);
    }
}

export default App;

export {
    App,
    initCanvas
};
