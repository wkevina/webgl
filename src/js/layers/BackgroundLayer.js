import {vec2, vec3, mat4} from 'gl-matrix';

import {Layer} from './Layer';
import {Sprite} from '../graphics/Sprite';

export {BackgroundLayer};
export default BackgroundLayer;

class BackgroundLayer extends Layer {
    constructor(options) {
        super(options);

        this.fixed = options.fixed === undefined ? true : options.fixed;
        this.parallax = options.parallax || [1, 1];
        this.offset = options.offset || [0, 0];
        this.imageMap = options.imageMap;
        this.atlas = options.atlas;
        this.sprites = this.initSprites(options.imageMap);
    }

    setup() {

        // if (!this.width || !this.height) {
        //     this;
        // }
    }

    initSprites(imageMap) {
        let sprites = [];

        Object.keys(imageMap).forEach(key => {
            const textureName = key;
            const textureRegion = this.atlas.coordinatesForName(textureName);

            if (!textureRegion) {
                throw `Error: invalid texture name '${textureName}'`;
            }

            sprites.push(new Sprite({
                position: [imageMap[key].x, imageMap[key].y],
                textureName,
                textureRegion
            }))
        });

        return sprites;
    }

    render(dt, graphicsState) {
        const atlasRenderer = this.scene.atlasRenderer;

        const position = vec2.copy(vec2.create(), this.offset);

        if (!this.fixed) {
            const parallaxOffset = vec2.mul(vec2.create(), this.parallax, graphicsState.camera.position);

            vec2.add(position, position, parallaxOffset);
        }

        const t = mat4.fromTranslation(mat4.create(), vec3.fromValues(...position, 0));

        atlasRenderer.render(this.sprites, mat4.mul(mat4.create(), graphicsState.projection, t));
    }
}
