import twgl from '../twgl';

import vs from '../../shaders/sprite.vert';
import fs from '../../shaders/sprite.frag';

const SPRITE_RECT_VERTICES = new Float32Array([
    0, 0, // bottom left
    1, 0, // bottom right
    0, 1, // top left
    1, 1  // top right
]);

class SpriteRenderer {
    constructor({game, textureInfo}) {
        this.gl = game.gl;
        this.loader = game.loader;
        this.game = game;

        this.textureInfo = textureInfo;

        this.setup();
    }

    setup() {
        this.programInfo = twgl.createProgramInfo(this.gl, [vs, fs]);

        this._arrays = {
            vertex: {
                data: SPRITE_RECT_VERTICES,
                numComponents: 2,
                divisor: 0,
                drawType: this.gl.STATIC_DRAW
            },
            position: {
                //data: SPRITE_RECT_VERTICES,
                numComponents: 2,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW
            },
            offset: {
                //data: SPRITE_RECT_VERTICES,
                numComponents: 2,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW
            },
            size: {
                //data: SPRITE_RECT_VERTICES,
                numComponents: 2,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW
            },
            texcoord: {
                data: [
                    // 0, 0,
                    // this.textureInfo.width, 0,
                    // 0, this.textureInfo.height,
                    // this.textureInfo.width, this.textureInfo.height
                    0, 0,
                    1, 0,
                    0, 1,
                    1, 1
                ],
                numComponents: 2,
                divisor: 0,
                type: Int16Array
            },
            indices: {
                data: [
                    0,
                    1,
                    2,
                    3
                ]
            }
        };

        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, this._arrays);
        this.vao = twgl.createVertexArrayInfo(this.gl, this.programInfo, this.bufferInfo);
    }

    render(sprites) {
        const positions = new Float32Array(2 * sprites.length);
        const sizes = new Float32Array(2 * sprites.length);
        const offsets = new Float32Array(2 * sprites.length);

        sprites.forEach((sprite, spriteIndex) => {
            sprite.position.forEach((v, compIndex) => {
                positions[spriteIndex * 2 + compIndex] = v;
            });

            sprite.size.forEach((v, compIndex) => {
                sizes[spriteIndex * 2 + compIndex] = v;
            });

            sprite.offset.forEach((v, compIndex) => {
                offsets[spriteIndex * 2 + compIndex] = v;
            });
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

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.offset,
            offsets
        );

        this.gl.useProgram(this.programInfo.program);

        twgl.setUniforms(this.programInfo, {
            projection: this.game.viewMatrix,
            texture: this.textureInfo.texture
        });

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.vao);
        twgl.drawBufferInfo(this.gl, this.vao, this.gl.TRIANGLE_STRIP, undefined, undefined, sprites.length);
    }
}

export {SpriteRenderer};
