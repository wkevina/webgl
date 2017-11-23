import * as twgl from 'twgl-js';
import {mat4, mat3} from 'gl-matrix';
import {gl} from 'gl.js';

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
    constructor({game, textureInfo}) {
        this.gl = game.gl;
        this.loader = game.loader;
        this.game = game;

        this.textureInfo = textureInfo;

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
        }

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
            projection: this.game.projection,
            texture: this.textureInfo.texture
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

        this.grids = [];
    }

    addGrid(sx = 32, sy = 32, lineColor = [1, 1, 1, 1], lineWidth = 2) {
        const xcells = Math.floor(this.game.resolution.width / sx);
        const ycells = Math.floor(this.game.resolution.height / sy);
        const instanceCount = xcells + ycells;

        const {position, size} = makeGridVertices({xcells, ycells}, {w: sx, h: sy}, {lineWidth: lineWidth});

        this.grids.push({
            position,
            size,
            instanceCount,
            lineColor
        })
    }

    render() {
        this.gl.useProgram(this.programInfo.program);

        twgl.setUniforms(this.programInfo, {
            projection: this.game.projection
        });

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.vao);

        this.grids.forEach(gridInfo => {
            const {position, size, instanceCount, lineColor} = gridInfo;

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

            twgl.setUniforms(this.programInfo, {
                line_color: lineColor
            });

            twgl.drawBufferInfo(this.gl, this.vao, this.gl.TRIANGLE_STRIP, undefined, undefined, instanceCount);
        });
    }
}

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

        this.programInfo = this.game.getProgram('tilemap');

        this.setup();
    }

    setup() {
        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
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
                drawType: this.gl.STATIC_DRAW
            },

            position: {
                numComponents: 3,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW
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
                drawType: this.gl.STATIC_DRAW
            },

            tile_index: {
                numComponents: 1,
                divisor: 1,
                drawType: this.gl.DYNAMIC_DRAW,
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

        this.vao = twgl.createVertexArrayInfo(this.gl, this.programInfo, this.bufferInfo);
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

        this.gl.useProgram(this.programInfo.program);

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.position,
            this.arrays.position
        );

        twgl.setAttribInfoBufferFromArray(
            this.gl,
            this.bufferInfo.attribs.tile_index,
            this.arrays.tile_index
        );

        twgl.setUniforms(this.programInfo, {
            projection: this.game.projection,
            texture: this.textureArray,
            tile_size: [this.tileWidth, this.tileHeight]
        });

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.vao);
        twgl.drawBufferInfo(this.gl, this.vao, this.gl.TRIANGLE_STRIP, undefined, undefined, tileCount.x * tileCount.y);
    }
}


class TilemapTextureBuilder {
    constructor(opts) {
        Object.assign(this, {
            tileWidth: 8,
            tileHeight: 8,
            width: 256,
            height: 1,
            layers: 2,
            ...opts
        });

        this.copyIndex = 0;

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture);
        gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, this.width * this.tileWidth, this.height * this.tileHeight, this.layers);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);

    }

    tileCoordinates() {
        return {
            x: this.copyIndex % this.width,
            y: Math.floor(this.copyIndex / (this.width)) % this.height,
            z: Math.floor(this.copyIndex / (this.width * this.height)) % this.layers
        }
    }

    addTiles(src) {
        const tileWide = this.detectWidthInTiles(src);
        const tileHigh = this.detectHeightInTiles(src);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = src.width;
        canvas.height = src.height;

        ctx.drawImage(src, 0, 0);

        /**
         *  Copies pixels in src from the tile starting at (tileX, tileY) to the current
         * tile and advances the copy index
         */
        const copyTile = (tileX, tileY) => {
            const imageData = ctx.getImageData(
                tileX * this.tileWidth,
                tileY * this.tileHeight,
                this.tileWidth,
                this.tileHeight
            );

            const {x, y, z} = this.tileCoordinates();

            gl.texSubImage3D(
                gl.TEXTURE_2D_ARRAY, // target
                0,                   // mipmap level, always zero
                x * this.tileWidth,  // xoffset
                y * this.tileHeight, // yoffset
                z,                   // zoffset
                this.tileWidth,      // width
                this.tileHeight,     // height
                1,                   // depth
                gl.RGBA,             // format, guaranteed by ImageData to be RGBA
                gl.UNSIGNED_BYTE,    // type, guaranteed by ImageData to be Uint8ClampedArray, i.e. UNSIGNED_BYTE
                imageData            // pixel data
            );

            this.copyIndex++;
        };

        gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

        for (let y = 0; y < tileHigh; y++) {
            for (let x = 0; x < tileWide; x++) {
                if (this.isFull()) {
                    break;
                }
                copyTile(x, y);
            }
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

        gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    }

    detectWidthInTiles(src) {
        return Math.floor(src.width / this.tileWidth);
    }

    detectHeightInTiles(src) {
        return Math.floor(src.height / this.tileHeight);
    }

    get layerWidth() {
        return this.tileWidth * this.width;
    }

    get layerHeight() {
        return this.tileHeight * this.height;
    }

    get maxIndex() {
        return this.width * this.height * this.layers;
    }

    isFull() {
        return this.copyIndex >= this.maxIndex;
    }

    /**
     * Reads texture from GL memory returns it as Array of ImageData
     */
    readback() {
        // Uint8Array long enough to hold pixel data for one layer
        const buffer = new Uint8Array(this.layerWidth * this.layerHeight * 4);
        const fb = gl.createFramebuffer();
        const layers = [];

        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fb);

        for (let layer = 0; layer < this.layers; layer++) {
            gl.framebufferTextureLayer(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this.texture, 0, layer);
            gl.readPixels(0, 0, this.layerWidth, this.layerHeight, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
            layers.push(new ImageData(new Uint8ClampedArray(buffer), this.layerWidth, this.layerHeight));
        }

        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);

        return layers;
    }
}


class LineRenderer {

    constructor(opts) {

        const {game, maxLines} = {
            maxLines: 256,
            ...opts
        };

        this.game = game;
        this.maxLines = maxLines;

        this.programInfo = this.game.getProgram('lines');

        this.setup();
    }

    setup() {
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
            position: {
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

    render(lines, color) {
        // copy data from lines to this.arrays.position
        this.arrays.position.set(lines);

        //gl.enable(gl.LINES);

        gl.useProgram(this.programInfo.program);

        twgl.setUniforms(this.programInfo, {
            projection: this.game.projection,
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
}


const CoordinateConversions = {
    canvasToWorldMatrix(displayRect, virtualSize) {
        const acc = mat3.create();
        const temp = mat3.create();

        // (scale to virtualSize) * (project viewport) * (subtract offset) * point

        // offset
        mat3.fromTranslation(acc, [-displayRect.x, -displayRect.y]);

        // project
        mat3.multiply(acc, mat3.fromScaling(temp, [1 / displayRect.width, 1 / displayRect.height, 1]), acc);

        // scale to virtual size
        mat3.multiply(acc, mat3.fromScaling(temp, [virtualSize.width, virtualSize.height, 1]), acc);

        // flip y
        mat3.multiply(
            acc,
            mat3.fromValues(
                1, 0, 0,
                0, -1, 0,
                0, virtualSize.height, 1
            ),
            acc
        );

        return acc;
    }
};


function arraySetter(buffer) {
    let count = 0;
    return function (newElements) {
        if (!newElements.length) {
            newElements = [newElements];
        }
        buffer.set(newElements, count);
        count += newElements.length;
    }
}

export {
    SpriteRenderer,
    TilemapRenderer,
    TilemapTextureBuilder,
    GridOutline,
    LineRenderer,
    CoordinateConversions
};
