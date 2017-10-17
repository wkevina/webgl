import {createProgram} from 'shader-util.js';
import twgl from 'twgl.js';

const POSITION_STRIDE = 2;
const SIZE_STRIDE = 2;

class SpriteRenderer {
    constructor(_gl, loader) {
        this.gl = _gl;
        this._vertices = new Float32Array([
            -0.5,
            -0.5,
            0.5,
            -0.5,
            0.5,
            0.5,
            -0.5,
            0.5
        ]);
        this.programInfo = twgl.createProgramInfo(this.gl, [loader.get('shaders/sprite.vert'), loader.get('shaders/sprite.frag')]);
        this.setup();
    }

    setup() {
        this._arrays = {
            vertex: {
                data: this._vertices,
                numComponents: 2,
                divisor: 0
            },
            position: {
                data: this._vertices,
                numComponents: POSITION_STRIDE,
                divisor: 1
            },
            size: {
                data: this._vertices,
                numComponents: SIZE_STRIDE,
                divisor: 1
            },
            indices: {
                data: [
                    0,
                    1,
                    2,
                    2,
                    3,
                    0
                ]
            }
        }

        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, this._arrays);
        this.vao = twgl.createVertexArrayInfo(this.gl, this.programInfo, this.bufferInfo);
        this.vao;
    }

    render(sprites) {
        const positions = new Float32Array(POSITION_STRIDE * sprites.length);
        const sizes = new Float32Array(SIZE_STRIDE * sprites.length);

        sprites.forEach((sprite, spriteIndex) => {
            sprite.position.forEach((v, compIndex) => {
                positions[spriteIndex * POSITION_STRIDE + compIndex] = v;
            });

            sprite.size.forEach((v, compIndex) => {
                sizes[spriteIndex * SIZE_STRIDE + compIndex] = v;
            })
        });

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.position,
            positions
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.size,
            sizes
        );

        this.gl.useProgram(this.programInfo.program);

        twgl.setUniforms(this.programInfo,
            {
                u_world: twgl.m4.identity()
            }
        );

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.vao);

        twgl.drawBufferInfo(this.gl, this.vao);

        twgl;
    }
}

export {SpriteRenderer};
