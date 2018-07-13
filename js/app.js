import {Loader} from 'resource.js';
import {CoordinateConversions} from 'graphics.js';
import {mat3, mat4} from 'gl-matrix';
import {registerContext, gl} from 'gl.js';
import {attachFramebuffer} from 'util.js';
import 'vendor/webgl-debug.js'
import {Sprite} from './graphics/Sprite';
import {SpriteRenderer} from './graphics/SpriteRenderer'
import {Camera} from "./graphics/Camera";

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
        this.resolution = options.resolution || {width: 352, height: 224};
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
        this.framebufferRenderer = new SpriteRenderer({
            game: this,
            textureInfo: {
                texture: this.framebuffer.texture,
                ...this.resolution
            }
        });
        this.loader = new Loader();
        this.projection = mat4.ortho(mat4.create(), 0, this.resolution.width, 0, this.resolution.height, -1, 1);
        this.camera = new Camera(this.resolution);
        this.cameraEnabled = true;
        this.updateCanvasSize();
        this.adjustViewport();
    }

    updateCanvasSize() {
        const width = this.resolution.width * this.pixelMultiplier;
        const height = this.resolution.height * this.pixelMultiplier;

        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.canvas.width = width * (window.devicePixelRatio || 1);
        this.canvas.height = height * (window.devicePixelRatio || 1);
    }

    adjustViewport() {
        // Use device pixels rather than CSS pixels to set viewport
        // This will handle devicePixelRatios different than 1
        const canvas_width = this.canvas.width;
        const canvas_height = this.canvas.height;

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        this._canvasToWorld = CoordinateConversions.canvasToWorldMatrix(
            this.camera.matrix,
            {width: canvas_width, height: canvas_height},
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

    enableCamera() {
        this.cameraEnabled = true;
    }

    disableCamera() {
        this.cameraEnabled = false;
    }

    get canvasToWorld() {
        return this._canvasToWorld;
    }

    get viewMatrix() {
        let camera = mat4.create();
        if (this.cameraEnabled) {
            camera = this.camera.matrix;
        }
        return mat4.multiply(mat4.create(), this.projection, camera);
    }

    beginRenderToTexture() {
        this.framebuffer.attach();
        this.clear();
    }

    endRenderToTexture() {
        this.framebuffer.detach();
        this.adjustViewport();
    }

    start() {
        let timestamp;

        const update = time => {
            if (!timestamp) {
                timestamp = time;
            }

            let dt = time - timestamp;
            timestamp = time;
            //this.framebuffer.attach();

            if (this.stage) {
                this.stage.prerender(dt);

                this.beginRenderToTexture();

                this.stage.render(dt);

                this.stage.postrender(dt);

                this.endRenderToTexture();

                this.clear();

                this.framebufferRenderer.render(
                    [new Sprite({
                        position: [0, 0],
                        size: [this.resolution.width, this.resolution.height]
                    })],
                    this.projection
                );

                // possible post fullscreen render hook here
            }

            if (this.running) {
                requestAnimationFrame(update);
            }
        };

        if (!this.running) {
            requestAnimationFrame(update);
            this.running = true;
        }
    }

    setStage(stage) {
        this.stage = stage;
        stage.app = this;
        stage.init(this);
    }
}

export default App;

export {
    App,
    initCanvas
};
