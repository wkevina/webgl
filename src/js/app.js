import {createProgram} from 'shader-util.js';
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
    constructor({el, debug}) {
        if (typeof canvas === 'string') {
            this.canvas = document.getElementById(el);
        } else {
            this.canvas = el;
        }

        // create rendering context
        this.gl = this.canvas.getContext('webgl2');

        if (debug) {
            this.gl = WebGLDebugUtils.makeDebugContext(this.gl, undefined, logGLCall);
        }
    }

    start() {
        console.log('start');

        this.canvas.width = 320;
        this.canvas.height = 240;
    }

    clear() {
        twgl.resizeCanvasToDisplaySize(this.canvas);
        this.gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        this.gl.clearColor(0.3, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
}

export default App;
