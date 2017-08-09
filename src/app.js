import {
    programFromPaths
} from 'shader-util.js';

function start() {
    const canvas = document.getElementById('canvas');
    canvas.width = 320;
    canvas.height = 240;

    // create rendering context
    const gl = canvas.getContext('webgl2');

    run(canvas, gl);
}

async function run(canvas, gl) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let defaultShader = await programFromPaths(
        gl,
        'shaders/default.glsl.vert',
        'shaders/default.glsl.frag'
    );
}

window.start = start;
