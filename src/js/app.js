import {createProgram} from './shader-util.js';

import * as glMatrix from 'gl-matrix';

class App {
    constructor({el}) {
        if (typeof canvas === 'string') {
            this.canvas = document.getElementById(el);            
        } else {
            this.canvas = el;
        }    
        
        // create rendering context        
        this.gl = this.canvas.getContext('webgl2');
    }
    
    start() {
        console.log('start');

        this.canvas.width = 320;
        this.canvas.height = 240;

        this.run();
    }

    async run() {
        this.gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Load default shader
        let defaultShader = await createProgram(this.gl, 'shaders/default.glsl.vert', 'shaders/default.glsl.frag');
    }
}

export {App};
