import twgl from '../twgl';
import {gl} from '../gl';
import {arraySetter} from '../util';
import _vs from '../../shaders/tilemap.vert';
import _fs from '../../shaders/tilemap.frag';

const vs = _vs;
const fs = _fs;

class TilemapRenderer {
    /*
    tilemap = {
        width: width in tiles
        height: height in tiles
        tileWidth: tile width in pixels
        tileHeight: tile height in pixels
        tiles
    }
    */
    constructor(opts) {
        const {
            tilemap,
            game,
            textureArray
        } = opts;

        this.tilemap = tilemap;
        this.game = game;
        this.gl = game.gl;
        this.textureArray = textureArray;

        this.tileWidth = this.tilemap.tileWidth;
        this.tileHeight = this.tilemap.tileHeight;


        //this.programInfo = this.game.getProgram('tilemap');
        this.programInfo = twgl.createProgramInfo(gl, [vs, fs]);

        this.setup();
    }

    setup() {
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
            /* Per-vertex attributes common to each instance. */
            vertex: {
                data: new Float32Array([
                    0, 0, // bottom left
                    this.tileWidth, 0, // bottom right
                    0, this.tileHeight, // top left
                    this.tileWidth, this.tileHeight  // top right
                ]),
                numComponents: 2,
                divisor: 0,
                drawType: gl.STATIC_DRAW
            },

            position: {
                numComponents: 3,
                divisor: 1,
                drawType: gl.DYNAMIC_DRAW
            },

            texcoord: {
                data: [
                    0, 0,
                    this.tileWidth, 0,
                    0, this.tileHeight,
                    this.tileWidth, this.tileHeight
                ],
                numComponents: 2,
                divisor: 0,
                drawType: gl.STATIC_DRAW
            },

            tile_index: {
                numComponents: 1,
                divisor: 1,
                drawType: gl.DYNAMIC_DRAW,
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
        });

        this.arrays = {
            position: new Float32Array(3 * this.maxCells()),
            tile_index: new Int16Array(this.maxCells())
        };

        this.vao = twgl.createVertexArrayInfo(gl, this.programInfo, this.bufferInfo);
    }

    /* Returns maximum number of cells that could be rendered. If the display
    is tw and th tiles wide and high, respectively, the value returned is
    (tw + 1) * (th + 1) */
    maxCells() {
        return this.maxWidthInCells * this.maxHeightInCells;
    }

    get maxWidthInCells() {
        return Math.floor(this.game.resolution.width / this.tileWidth) + 1;
    }

    get maxHeightInCells() {
        return Math.floor(this.game.resolution.height / this.tileHeight) + 1;
    }

    draw({x, y, width, height}) {
        const tileCount = {
            x: Math.floor(width / this.tileWidth) + 1,
            y: Math.floor(height / this.tileHeight) + 1
        };

        const startIndex = {
            x: Math.floor(x / this.tileWidth),
            y: Math.floor(y / this.tileHeight)
        };

        tileCount.x = Math.min(tileCount.x, this.tilemap.width - startIndex.x, this.maxWidthInCells);
        tileCount.y = Math.min(tileCount.y, this.tilemap.height - startIndex.y, this.maxHeightInCells);

        const offset = {x, y};

        if (x > 0) {
            offset.x = -(x % this.tileWidth);
        }

        if (y > 0) {
            offset.y = -(y % this.tileHeight);
        }

        const addPosition = arraySetter(this.arrays.position);
        const addTileIndex = arraySetter(this.arrays.tile_index);

        for (let row = 0; row < tileCount.y; row++) {
            const yCoord = row * this.tileHeight + offset.y;
            for (let col = 0; col < tileCount.x; col++) {
                const xCoord = col * this.tileWidth + offset.x;

                const tile_index = this.tilemap.getTile(col + startIndex.x, row + startIndex.y);

                addPosition([xCoord, yCoord, 0]);
                addTileIndex(tile_index);
            }
        }

        twgl.setAttribInfoBufferFromArray(
            gl,
            this.bufferInfo.attribs.position,
            this.arrays.position
        );

        twgl.setAttribInfoBufferFromArray(
            gl,
            this.bufferInfo.attribs.tile_index,
            this.arrays.tile_index
        );

        gl.useProgram(this.programInfo.program);

        twgl.setUniforms(this.programInfo, {
            projection: this.game.projection,
            texture: this.textureArray,
            tile_size: [this.tileWidth, this.tileHeight]
        });

        twgl.setBuffersAndAttributes(gl, this.programInfo, this.vao);
        twgl.drawBufferInfo(gl, this.vao, gl.TRIANGLE_STRIP, undefined, undefined, tileCount.x * tileCount.y);
    }
}

export {TilemapRenderer};