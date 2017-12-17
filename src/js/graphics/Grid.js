import twgl from '../twgl';
import {gl} from '../gl';

import vs from '../../shaders/grid.vert';
import fs from '../../shaders/grid.frag';

export {Grid};

const GRID_VERTICES = new Float32Array([
    0, 0, // bottom left
    1, 0, // bottom right
    0, 1, // top left
    1, 1  // top right
]);

function makeGridVertices({xcells, ycells}, {w, h}, {lineWidth}) {
    const position = new Float32Array(2 * (xcells + ycells));
    const size = new Float32Array(2 * (xcells + ycells));
    const width = w * (xcells + 1);
    const height = h * (ycells + 1);

    for (let row = 0; row < ycells; ++row) {
        position[2 * row] = 0;     // pos x
        position[2 * row + 1] = row * h; // pos y
        size[2 * row] = width;     // line length
        size[2 * row + 1] = lineWidth; // line thickness
    }

    for (let col = 0; col < xcells; ++col) {
        position[2 * ycells + 2 * col] = col * w; // pos x
        position[2 * ycells + 2 * col + 1] = 0;     // pos y
        size[2 * ycells + 2 * col] = lineWidth; // line length
        size[2 * ycells + 2 * col + 1] = height;    // line thickness
    }

    return {
        position,
        size
    }
}

let sharedProgram = null;

class Grid {
    constructor(options) {
        this.resolution = options.resolution;

        if (!sharedProgram) {
            sharedProgram = twgl.createProgramInfo(gl, [vs, fs]);
        }
        this.programInfo = sharedProgram;

        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
            vertex: {
                data: GRID_VERTICES,
                numComponents: 2,
                divisor: 0,
                drawType: gl.STATIC_DRAW
            },
            position: {
                numComponents: 2,
                divisor: 1,
                drawType: gl.DYNAMIC_DRAW
            },
            size: {
                numComponents: 2,
                divisor: 1,
                drawType: gl.DYNAMIC_DRAW
            },
            indices: {
                data: [
                    0,
                    1,
                    2,
                    3
                ]
            }
        });

        this.vao = twgl.createVertexArrayInfo(gl, this.programInfo, this.bufferInfo);

        this.grids = [];
    }

    addGrid(sx = 32, sy = 32, lineColor = [1, 1, 1, 1], lineWidth = 2) {
        const xcells = Math.ceil(this.resolution.width / sx) + 1;
        const ycells = Math.ceil(this.resolution.height / sy) + 1;
        const instanceCount = xcells + ycells;

        const {position, size} = makeGridVertices({xcells, ycells}, {w: sx, h: sy}, {lineWidth: lineWidth});

        this.grids.push({
            position,
            size,
            instanceCount,
            lineColor,
            sx,
            sy
        })
    }

    render(x, y, projection) {
        gl.useProgram(this.programInfo.program);

        twgl.setBuffersAndAttributes(gl, this.programInfo, this.vao);

        const cameraPos = [x, y];

        this.grids.forEach(gridInfo => {
            const {position, size, instanceCount, lineColor, sx, sy} = gridInfo;

            const offset = [cameraPos[0] % sx, cameraPos[1] % sy];
            if (offset[0] > 0) {
                offset[0] = offset[0] - sx;
            }

            if (offset[1] > 0) {
                offset[1] = offset[1] - sy;
            }

            twgl.setAttribInfoBufferFromArray(
                gl,
                this.bufferInfo.attribs.position,
                position
            );

            twgl.setAttribInfoBufferFromArray(
                gl,
                this.bufferInfo.attribs.size,
                size
            );

            twgl.setUniforms(this.programInfo, {
                line_color: lineColor,
                projection: projection,
                offset: offset
            });

            twgl.drawBufferInfo(gl, this.vao, gl.TRIANGLE_STRIP, undefined, undefined, instanceCount);
        });
    }
}