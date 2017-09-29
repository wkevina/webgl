/**
 * Creates and compiles a shader.
 *
 * @param {!WebGLRenderingContext} gl The WebGL Context.
 * @param {string} shaderSource The GLSL source code for the shader.
 * @param {number} shaderType The type of shader, VERTEX_SHADER or
 *     FRAGMENT_SHADER.
 * @return {!WebGLShader} The shader.
 */
function compileShader(gl, shaderSource, shaderType) {
    // Create the shader object
    var shader = gl.createShader(shaderType);

    // Set the shader source code.
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check if it compiled
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        // Something went wrong during compilation; get the error
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }

    return shader;
}

/**
 * Creates and compiles a shader.
 *
 * @param {!WebGLRenderingContext} gl The WebGL Context.
 * @param {string} shaderSourcePath The path of GLSL source file
 * @param {number} shaderType The type of shader, VERTEX_SHADER or
 *     FRAGMENT_SHADER.
 * @return {!WebGLShader} The shader.
 */
async function shaderFromPath(gl, shaderSourcePath, shaderType) {
    let resource = await fetch(shaderSourcePath);

    if (!resource.ok) {
        throw "unable to fetch shader resource at " + shaderSourcePath +
            "\nfailed with status " + resource.status + ": " + resource.statusText;
    }

    let source = await resource.text();

    console.log(source);

    return compileShader(gl, source, shaderType);
}

/**
 * Creates a program from 2 shaders.
 *
 * @param {!WebGLRenderingContext) gl The WebGL context.
 * @param {!WebGLShader} vertexShader A vertex shader.
 * @param {!WebGLShader} fragmentShader A fragment shader.
 * @return {!WebGLProgram} A program.
 */
function createProgram(gl, vertexShader, fragmentShader) {
    // create a program.
    var program = gl.createProgram();

    // attach the shaders.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // link the program.
    gl.linkProgram(program);

    // Check if it linked.
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        // something went wrong with the link
        throw ("program filed to link:" + gl.getProgramInfoLog(program));
    }

    return program;
};

/**
 * Creates a GLSL program from sources at two URLs
 *
 * @param {!WebGLRenderingContext} gl The WebGL Context.
 * @param {string} vertexShaderPath The path of the vertex shader file.
 * @param {string} fragmentShaderPath The path of the fragment shader file.
 * @return {!WebGLProgram} A program
 */
async function programFromPaths(
    gl, vertexShaderPath, fragmentShaderPath) {
    let vertexShader = await shaderFromPath(gl, vertexShaderPath, gl.VERTEX_SHADER);
    let fragmentShader = await shaderFromPath(gl, fragmentShaderPath, gl.FRAGMENT_SHADER);

    if (!vertexShader) {
        throw "failed to compile vertex shader from " + vertexShaderPath;
    }

    if (!fragmentShader) {
        throw "failed to compile fragment shader from " + fragmentShaderPath;
    }

    return createProgram(gl, vertexShader, fragmentShader);
}

export {
    compileShader,
    shaderFromPath,
    createProgram,
    programFromPaths
};