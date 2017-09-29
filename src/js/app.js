import {
    programFromPaths
} from 'shader-util.js';

import * as glMatrix from 'gl-matrix';

function start() {
    console.log('start');
    const mountPoint = document.getElementById('content');
    const canvas = document.createElement('canvas');
    mountPoint.appendChild(canvas);
    
    canvas.width = 320;
    canvas.height = 240;

    // create rendering context
    const gl = canvas.getContext('webgl2');

    run(canvas, gl);
}

async function run(canvas, gl) {
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Load default shader
    let defaultShader = await programFromPaths(
        gl,
        'shaders/default.glsl.vert',
        'shaders/default.glsl.frag'
    );    
}

start();
