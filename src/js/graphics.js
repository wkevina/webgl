import {mat3, mat4, vec2, vec3, vec4} from 'gl-matrix';

import {gl} from 'gl.js';

const POSITION_COMPONENTS = 2;
const SIZE_COMPONENTS = 2;

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


const CoordinateConversions = {
    canvasToWorldMatrix(viewMatrix, displaySize, virtualSize) {
        const acc = mat4.create();
        const temp = mat4.create();

        // (scale to virtualSize) * (project viewport) * (subtract offset) * point

        // (inverse viewMatrix) * (scale virtualSize / displaySize) * (flip y) * point

        // flip y
        mat4.multiply(
            acc,
            mat4.fromValues(
                1,  0, 0, 0,
                0, -1, 0, 0,
                0,  0, 1, 0,
                0, displaySize.height, 1, 1
            ),
            acc
        );

        // scale
        mat4.fromScaling(
            temp,
            [virtualSize.width / displaySize.width, virtualSize.height / displaySize.height, 1]
        );
        mat4.multiply(acc, temp, acc);

        // invert view
        mat4.invert(temp, viewMatrix);
        mat4.multiply(acc, temp, acc);

        return acc;
    }
};


export {
    TilemapTextureBuilder,
    CoordinateConversions};
