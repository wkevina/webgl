import {vec2} from 'gl-matrix';

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
        this.imageID = options.imageID;
        this.width = options.width;
        this.height = options.height;
    }

    render(dt, graphicsState) {
        const atlasRenderer = this.scene.atlasRenderer;

        let position = vec2.copy(vec2.create(), this.offset);

        if (!this.fixed) {
            const parallaxOffset = vec2.mul(vec2.create(), this.parallax, graphicsState.camera.position);

            vec2.add(position, position, parallaxOffset);
        }

        atlasRenderer.render(
            [new Sprite({
                position: position,
                textureName: this.imageID,
                size: [this.width, this.height]
            })],
            graphicsState.projection
        );
    }
}
