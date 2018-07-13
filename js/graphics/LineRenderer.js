import twgl from "../twgl";
import {gl} from "../gl";
import {arraySetter} from "../util";
import vs from '../../shaders/lines.vert';
import fs from '../../shaders/lines.frag';

export {LineRenderer};

let sharedProgram = null;

class LineRenderer {

    constructor(opts) {

        const {game, maxLines} = {
            maxLines: 32768,
            ...opts
        };

        this.game = game;
        this.maxLines = maxLines;

        // Share program between renderer instances
        if (!sharedProgram) {
            sharedProgram = twgl.createProgramInfo(gl, [vs, fs]);
        }

        this.programInfo = sharedProgram;

        this.setup();
    }

    setup() {
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
            position: {
                numComponents: 2,
                drawType: gl.DYNAMIC_DRAW
            },
            translation: {
                numComponents: 2,
                drawType: gl.DYNAMIC_DRAW
            }
        });

        this.arrays = {
            position: new Float32Array(2 * 2 * this.maxLines)
        };

        this.vao = twgl.createVertexArrayInfo(gl, this.programInfo, this.bufferInfo);
        twgl.setBuffersAndAttributes(gl, this.programInfo, this.vao);
    }

    render(lines, color = [1, 1, 1, 1]) {
        // copy data from lines to this.arrays.position
        this.arrays.position.set(lines);

        //gl.enable(gl.LINES);

        gl.useProgram(this.programInfo.program);

        twgl.setUniforms(this.programInfo, {
            projection: this.game.viewMatrix,
            color: color
        });

        twgl.setAttribInfoBufferFromArray(
            gl,
            this.bufferInfo.attribs.position,
            this.arrays.position
        );

        twgl.setBuffersAndAttributes(gl, this.programInfo, this.vao);
        twgl.drawBufferInfo(gl, this.vao, gl.LINES, lines.length / 2);
    }

    renderPolygons(polygons, color = [1, 1, 1, 1]) {
        const setter = arraySetter(this.arrays.position);

        let lineCount = 0;
        polygons.forEach(polygon => {
            setter(polygon.vertices[0]);
            polygon.vertices.slice(1).forEach(vtx => setter(vtx.concat(vtx)));
            setter(polygon.vertices[0]);
            lineCount += polygon.vertices.length;
        });

        twgl.setAttribInfoBufferFromArray(
            gl,
            this.bufferInfo.attribs.position,
            this.arrays.position
        );

        gl.useProgram(this.programInfo.program);

        twgl.setUniforms(this.programInfo, {
            projection: this.game.viewMatrix,
            color: color
        });

        twgl.setBuffersAndAttributes(gl, this.programInfo, this.vao);
        twgl.drawBufferInfo(gl, this.vao, gl.LINES, lineCount * 2);
    }
}