import _ from 'underscore';
import {GraphicsState} from './graphics/GraphicsState';
import {SpriteAtlasRenderer} from './graphics/SpriteAtlasRenderer';
import {Grid} from "./graphics/Grid";

export {Scene};
export default Scene;

const compareLayer = layer => {
    return layer.depth || 0;
};

class Scene {
    constructor() {
        this.layers = new Set();
        this.atlasRenderer = new SpriteAtlasRenderer();
        this.atlas = null;
        this.grid = null;
        this.showGrid = false;
    }

    setAtlas(atlas) {
        this.atlas = atlas;
        this.atlasRenderer.setAtlas(atlas);
    }

    addLayer(layer) {
        this.layers.add(layer);
        layer.init(this);
    }

    removeLayer(layer) {
        if (this.layers.has(layer)) {
            this.layers.delete(layer);
            layer.deinit();
        }
    }

    init(stage) {
        this.stage = stage;
        this.graphicsState = new GraphicsState(stage.resolution);
        this.grid = new Grid({
            resolution: stage.resolution
        });
        this.setup();
    }

    deinit() {
        this.stage = null;
        this.layers.entries().forEach(layer => layer.deinit());
        this.layers.clear();
    }

    update(dt) {
        this.layersSorted.forEach(layer => {
           layer.update(dt);
        });
    }

    render(dt) {
        this.layersSorted.forEach(layer => {
            layer.render(dt, this.graphicsState);
        });

        if (this.showGrid) {
            const [x, y] = this.graphicsState.camera.position;
            this.grid.render(x, y, this.graphicsState.projection);
        }
    }

    setup() {

    }

    get layersSorted () {
        return _.sortBy(Array.from(this.layers), compareLayer);
    }
}
