import twgl from '../twgl';
import {gl} from '../gl';

import vs from '../../shaders/atlas.vert';
import fs from '../../shaders/atlas.frag';

let sharedProgram;

class SpriteAtlasRenderer {
    constructor(options = {}) {
        this.gl = gl;
        this.atlas = options.atlas;
        this.setup();
    }

    setup() {
        if (!sharedProgram) {
            sharedProgram = twgl.createProgramInfo(this.gl, [vs, fs]);
        }
        this.programInfo = sharedProgram;


        this._arrays = {
            vertex: {
                data: [
                    0, 0, // bottom left
                    1, 0, // bottom right
                    0, 1, // top left
                    1, 1  // top right
                ],
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
            texture_rect: {
                numComponents: 4,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW
            },
            layer: {
                numComponents: 1,
                divisor: 1,
                drawTpye: this.gl.DYNAMIC_DRAW
            },
            angle: {
                numComponents: 1,
                divisor: 1,
                drawTpye: this.gl.DYNAMIC_DRAW
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

    renderLayer(graphicsState, layer = 0, position = [0, 0], offset = [0, 0], angle = 0) {
        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.position,
            position
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.size,
            [this.atlas.width, this.atlas.height]
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.offset,
            offset
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.texture_rect,
            [0, 0, this.atlas.width, this.atlas.height]
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.layer,
            [layer]
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.angle,
            [angle]
        );

        this.gl.useProgram(this.programInfo.program);

        twgl.setUniforms(this.programInfo, {
            projection: graphicsState.viewProjectionMatrix,
            texture: this.atlas.texture
        });

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.vao);
        twgl.drawBufferInfo(this.gl, this.vao, this.gl.TRIANGLE_STRIP, undefined, undefined, 1);
    }

    render(sprites, projection) {
        const position = new Float32Array(2 * sprites.length);
        const size = new Float32Array(2 * sprites.length);
        const offset = new Float32Array(2 * sprites.length);
        const texture_rect = new Float32Array(4 * sprites.length);
        const layer = new Float32Array(sprites.length);
        const angle = new Float32Array(sprites.length);

        sprites.forEach((sprite, spriteIndex) => {
            const coords = this.atlas.getAtlasCoordinates(sprite.textureName);

            sprite.position.forEach((v, compIndex) => {
                position[spriteIndex * 2 + compIndex] = v;
            });

            (sprite.size || coords.rect.slice(2)).forEach((v, compIndex) => {
                size[spriteIndex * 2 + compIndex] = v;
            });

            sprite.offset.forEach((v, compIndex) => {
                offset[spriteIndex * 2 + compIndex] = v;
            });

            coords.rect.forEach((v, compIndex) => {
                texture_rect[spriteIndex * 4 + compIndex] = v;
            });

            layer[spriteIndex] = coords.layer;

            angle[spriteIndex] = sprite.angle;
        });

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.position,
            position
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.size,
            size
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.offset,
            offset
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.texture_rect,
            texture_rect
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.layer,
            layer
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.angle,
            angle
        );

        this.gl.useProgram(this.programInfo.program);

        twgl.setUniforms(this.programInfo, {
            projection: projection,
            texture: this.atlas.texture
        });

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.vao);
        twgl.drawBufferInfo(this.gl, this.vao, this.gl.TRIANGLE_STRIP, undefined, undefined, sprites.length);
    }

    setAtlas(atlas) {
        this.atlas = atlas;
    }
}

export {SpriteAtlasRenderer};
