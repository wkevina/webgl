import {createProgram} from 'shader-util.js';
import twgl from 'twgl.js';
import {mat4} from 'gl-matrix';

const POSITION_COMPONENTS = 2;
const SIZE_COMPONENTS = 2;

const SPRITE_RECT_VERTICES = new Float32Array([
    0, 0, // bottom left
    1, 0, // bottom right
    0, 1, // top left
    1, 1  // top right
]);

const GRID_VERTICES = new Float32Array([
     0, 0, // bottom left
     1, 0, // bottom right
     0, 1, // top left
     1, 1  // top right
]);

class SpriteRenderer {
    constructor(game) {
        this.gl = game.gl;
        this.loader = game.loader;
        this.game = game;
        this.setup();
    }

    setup() {
        this.programInfo = this.game.getProgram('sprite');

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
                //data: [0, 734-80, 40, 734-80, 0, 734, 40, 734],
                //data: [0, 0, 40, 0, 0, 80, 40, 80],
                data: [
                    0, 0,
                    300, 0,
                    0, 734,
                    300, 734
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
        }

        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, this._arrays);
        this.vao = twgl.createVertexArrayInfo(this.gl, this.programInfo, this.bufferInfo);

        this.texture = this.loader.getTexture('sonic');
    }

    render(sprites) {
        const positions = new Float32Array(2 * sprites.length);
        const sizes = new Float32Array(2 * sprites.length);
        const offsets = new Float32Array(2 * sprites.length);

        sprites.forEach((sprite, spriteIndex) => {
            sprite.position.forEach((v, compIndex) => {
                positions[spriteIndex*2 + compIndex] = v;
            });

            sprite.size.forEach((v, compIndex) => {
                sizes[spriteIndex*2 + compIndex] = v;
            });

            sprite.offset.forEach((v, compIndex) => {
                offsets[spriteIndex*2 + compIndex] = v;
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
            projection: this.game.projection,
            texture: this.texture
        });

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.vao);
        twgl.drawBufferInfo(this.gl, this.vao, this.gl.TRIANGLE_STRIP, undefined, undefined, sprites.length);
    }
}

function makeGridVertices({xcells, ycells}, {w, h}, {lineWidth}) {
    const position = new Float32Array(2 * (xcells + ycells));
    const size = new Float32Array(2 * (xcells + ycells));
    const width = w * (xcells + 1);
    const height = h * (ycells + 1);

    for (let row = 0; row < ycells; ++row) {
        position[2*row]     = 0;     // pos x
        position[2*row + 1] = row*h; // pos y
        size[2*row]     = width;     // line length
        size[2*row + 1] = lineWidth; // line thickness
    }

    for (let col = 0; col < xcells; ++col) {
        position[2*ycells + 2*col]     = col*w; // pos x
        position[2*ycells + 2*col + 1] = 0;     // pos y
        size[2*ycells + 2*col]     = lineWidth; // line length
        size[2*ycells + 2*col + 1] = height;    // line thickness
    }

    return {
        position,
        size
    }
}

class GridOutline {
    constructor(game) {
        this.game = game;
        this.gl = game.gl;

        this.programInfo = this.game.getProgram('grid');

        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
            vertex: {
                data: GRID_VERTICES,
                numComponents: 2,
                divisor: 0,
                drawType: this.gl.STATIC_DRAW
            },
            position: {
                numComponents: 2,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW
            },
            size: {
                numComponents: 2,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW
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

        this.vao = twgl.createVertexArrayInfo(this.gl, this.programInfo, this.bufferInfo);
    }

    render(sx = 32, sy = 32, lineColor = [1,1,1,1], lineWidth = 2) {
        this.gl.useProgram(this.programInfo.program);

        twgl.setUniforms(this.programInfo, {
            projection: this.game.projection,
            line_color: lineColor
        });

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.vao);

        const xcells = Math.floor(this.game.resolution.width / sx);
        const ycells = Math.floor(this.game.resolution.height / sy);
        const instanceCount = xcells + ycells;

        const {position, size} = makeGridVertices({xcells, ycells}, {w: sx, h: sy}, {lineWidth: lineWidth});

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

        twgl.drawBufferInfo(this.gl, this.vao, this.gl.TRIANGLE_STRIP, undefined, undefined, instanceCount);
    }
}

class TilemapRenderer {
    constructor({
        /*
        tilemap {
            width: width in tiles
            height: height in tiles
            tileWidth: tile width in pixels
            tileHeight: tile height in pixels
            tileset {
                texture_array: webgl texture handle
            }
        }
        */
        tilemap,
        game
    }) {
        this.tilemap = tilemap;
        this.game = game;

        this.tileWidth = this.tilemap.tileWidth;
        this.tileHeight = this.tilemap.tileHeight;

        this.programInfo = this.game.getProgram('tilemap');
    }

    draw({x, y, width, height}) {
        const tileCount = {
            x: Math.floor(width / this.tileWidth) + 1,
            y: Math.floor(height / this.tileHeight) + 1
        }

        const startIndex = {
            x: Math.floor(x / this.tileWidth),
            y: Math.floor(y / this.tileHeight)
        }

        const offset = { x, y };

        if (x > 0) {
            offset.x = -(x % this.tileWidth);
        }

        if (y > 0) {
            offset.y = -(y % this.tileHeight);
        }
    }
}

export {SpriteRenderer, TilemapRenderer, GridOutline};
