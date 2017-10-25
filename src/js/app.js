import {Loader} from 'resource.js';
import {createProgram} from 'shader-util.js';
import {mat4} from 'gl-matrix';
import {registerContext, gl} from 'gl.js';
import twgl from 'twgl.js';
import 'vendor/webgl-debug.js'

//import * as glMatrix from 'gl-matrix';

function logGLCall(functionName, args) {
   console.log("gl." + functionName + "(" +
      WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}

function throwOnGLError(err, funcName, args) {
  throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
};

class App {
    constructor({el, debug, clearColor, resolution}) {
        if (typeof canvas === 'string') {
            this.canvas = document.getElementById(el);
        } else {
            this.canvas = el;
        }

        // create rendering context
        this.gl = this.canvas.getContext('webgl2');
        registerContext(this.gl);

        if (debug) {
            WebGLDebugUtils.init(this.gl);
            this.gl = WebGLDebugUtils.makeDebugContext(this.gl, undefined, logGLCall);
        }

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        this.clearColor = clearColor || [0.4, 0.4, 0.4, 1];
        this.resolution = resolution || {width: 352, height: 224};

        this.loader = new Loader();

        this.projection = mat4.ortho(mat4.create(), 0, this.resolution.width, 0, this.resolution.height, -1, 1);
    }

    start() {
        this.adjustViewport();
    }

    adjustViewport() {
        twgl.resizeCanvasToDisplaySize(this.canvas);

        const canvas_width = this.canvas.clientWidth;
        const canvas_height = this.canvas.clientHeight;

        const desired_aspect_ratio = this.resolution.width / this.resolution.height;
        let screen_width, screen_height;

        if (canvas_width / canvas_height >= desired_aspect_ratio) {
            screen_width = desired_aspect_ratio * canvas_height;
            screen_height = canvas_height;
        } else {
            screen_width = canvas_width;
            screen_height = canvas_width / desired_aspect_ratio;
        }

        const xoff = (canvas_width - screen_width) / 2;
        const yoff = (canvas_height - screen_height) / 2;

        this.gl.viewport(xoff, yoff, screen_width, screen_height);
    }

    clear() {
        this.gl.clearColor(...this.clearColor);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    load(paths) {
        return this.loader.load(paths);
    }
}

export default App;
