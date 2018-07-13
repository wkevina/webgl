import twgl from './twgl';

/**
 * Creates a GLSL program from sources at two URLs
 *
 * @param {!WebGLRenderingContext} gl The WebGL Context.
 * @param {string} vertexShaderPath The path of the vertex shader file.
 * @param {string} fragmentShaderPath The path of the fragment shader file.
 * @return {!WebGLProgram} A program
 */
async function createProgram(gl, vertexShaderPath, fragmentShaderPath) {
    let vs = await fetch(vertexShaderPath);
    let fs = await fetch(fragmentShaderPath);

    const args = [
        await vs.text(),
        await fs.text()
    ];

    return twgl.createProgramInfo(gl, args, null, null, err => { throw err });
}

export {createProgram};
