import {gl} from '../gl';
import download from 'downloadjs';

/**
 * Class that batches sprite textures together into one large 2d array texture
 */

class SpriteAtlas {
    constructor(width = 1024, height = 1024, layers = 32) {
        this.width = width;
        this.height = height;
        this.depth = layers;
        this.map = new Map();
        this.entries = [];

        this.initTexture();
    }

    initTexture() {
        if (this.texture) {
            gl.deleteTexture(this.texture);
        }

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture);
        gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, this.width, this.height, this.depth);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);

        this.packingParams = {
            x: 0,
            y: 0,
            nextY: 0,
            layer: 0
        }
    }

    fit({width, height}) {
        const roomX = () => {
            return this.packingParams.x + width <= this.width;
        };

        const roomY = () => {
            return this.packingParams.y + height <= this.height;
        };

        if (!roomX()) {
            this.packingParams.x = 0;
            this.packingParams.y = this.packingParams.nextY;
        }

        if (!roomY()) {
            if (this.packingParams.layer + 1 < this.depth) {
                this.packingParams.x = 0;
                this.packingParams.y = 0;
                this.packingParams.nextY = 0;
                this.packingParams.layer++;
            } else {
                throw "Atlas full";
            }
        }

        const out = {width, height, ...this.packingParams};

        this.packingParams.nextY = Math.max(this.packingParams.nextY, this.packingParams.y + height);
        this.packingParams.x += width;

        return out;
    }

    add(img, name, subregion = null) {
        let imageData;
        let srcRect;

        if (!subregion) {
            srcRect = {
                x: 0,
                y: 0,
                width: img.width,
                height: img.height
            };
            imageData = img.data;
        } else {
            srcRect = subregion;
            imageData = img.getImageData(srcRect.x, srcRect.y, srcRect.width, srcRect.height);
        }

        const destRect = this.fit(srcRect);

        gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

        gl.texSubImage3D(
            gl.TEXTURE_2D_ARRAY, // target
            0,                   // mipmap level, always zero
            destRect.x,  // xoffset
            destRect.y, // yoffset
            destRect.layer,                   // zoffset
            destRect.width,      // width
            destRect.height,     // height
            1,                   // depth
            gl.RGBA,             // format, guaranteed by ImageData to be RGBA
            gl.UNSIGNED_BYTE,    // type, guaranteed by ImageData to be Uint8ClampedArray, i.e. UNSIGNED_BYTE
            imageData            // pixel data
        );

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

        this.map.set(name, destRect);
        this.entries.push([name, destRect]);
    }

    readback(limit) {
        // Uint8Array long enough to hold pixel data for one layer
        const buffer = new Uint8Array(this.width * this.height * 4);
        const fb = gl.createFramebuffer();
        const layers = [];

        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fb);

        gl.pixelStorei(gl.PACK_FLIP_Y_WEBGL, 1);


        for (let layer = 0; layer < Math.min(this.depth, limit); layer++) {
            gl.framebufferTextureLayer(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this.texture, 0, layer);
            gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
            layers.push(new ImageData(new Uint8ClampedArray(buffer), this.width, this.height));
        }

        gl.pixelStorei(gl.PACK_FLIP_Y_WEBGL, 0);

        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);

        return layers;
    }

    downloadLayers(prefix, limit = 1) {
        const layers = this.readback(limit);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = this.width;
        canvas.height = this.height;

        layers.forEach((layer, idx) => {
            ctx.putImageData(layer, 0, 0);
            ctx.globalCompositeOperation = 'copy';
            ctx.scale(1, -1);
            ctx.translate(0, -this.height);
            ctx.drawImage(canvas, 0, 0);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
            download(canvas.toDataURL(), `${prefix}_${idx}.png`);
        });
    }

    getAtlasCoordinates(name) {
        const coords = this.map.get(name);

        return {
            rect: [coords.x, coords.y, coords.width, coords.height],
            layer: coords.layer
        }
    }
}

const detectSpriteBounds = (img, flipY = false) => {
    // take top left pixel as background color
    const bg = img.data.slice(0, 4);
    const edges = [];
    let boundsColor = null;

    for (let y = 1; y < img.height - 1; y++) {
        search(y).forEach(rect => {
            edges.push(rect);
        });
    }

    function search(y) {
        const edges = [];
        for (let x = 1; x < img.width - 1; x++) {
            if (isULCorner(x, y)) {
                let bottom_right = findBRCorner(x, y);

                if (bottom_right) {
                    edges.push({
                        x,
                        y,
                        width: bottom_right.x - x,
                        height: bottom_right.y - y
                    });

                    x = bottom_right.x;
                }
            }
        }

        return edges;
    }

    function findBRCorner(x, y) {
        let rx = null;
        let ry = null;
        for (let _x = x + 1; _x < img.width - 1; _x++) {
            if (isRightEdge(_x, y)) {
                rx = _x;
                break;
            }
        }

        if (rx) {
            for (let _y = y + 1; _y < img.height - 1; _y++) {
                if (isBottomEdge(rx, _y)) {
                    ry = _y;
                    break;
                }
            }

            if (rx && ry) {
                return {x: rx, y: ry};
            }
        }

        return null;
    }

    function isULCorner(x, y) {
        const p = pixel(x, y);

        // init boundsColor if necessary
        if (!boundsColor && !pixelsEqual(p, bg)) {
            boundsColor = p;
        }

        if (pixelsEqual(p, boundsColor)) {
            // check pixel to left and above
            // if both are background, return true
            return (pixelsEqual(pixel(x-1, y), bg) && pixelsEqual(pixel(x, y-1), bg));
        }

        return false;
    }

    function isBRCorner(x, y) {
        const p = pixel(x, y);

        // init boundsColor if necessary
        if (!boundsColor && !pixelsEqual(p, bg)) {
            boundsColor = p;
        }

        if (pixelsEqual(p, boundsColor)) {
            // check pixel to right and below
            // if both are background, return true
            return (pixelsEqual(pixel(x+1, y), bg) && pixelsEqual(pixel(x, y+1), bg))
        }

        return false;
    }

    function isRightEdge(x, y) {
        return pixelsEqual(pixel(x, y), boundsColor) && pixelsEqual(pixel(x+1, y), bg);
    }

    function isBottomEdge(x, y) {
        return pixelsEqual(pixel(x, y), boundsColor) && pixelsEqual(pixel(x, y+1), bg);
    }

    function pixel(x, y) {
        return img.data.slice(4 * (x + y * img.width), 4 * (x + y * img.width) + 4);
    }

    function pixelsEqual(p1, p2) {
        return (
            p1 && p2 &&
            p1[0] === p2[0] &&
            p1[1] === p2[1] &&
            p1[2] === p2[2] &&
            p1[3] === p2[3]
        );
    }

    return {
        spriteBounds: edges,
        keyColor: boundsColor
    };
};

export {SpriteAtlas,
    detectSpriteBounds};