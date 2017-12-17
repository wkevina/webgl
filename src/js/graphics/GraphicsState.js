import {Camera} from './Camera';
import {mat4} from 'gl-matrix';

export {GraphicsState};
export default GraphicsState;

class GraphicsState {
    constructor(resolution) {
        this.resolution = resolution;
        this.camera = new Camera(resolution);
        this.projection = mat4.ortho(mat4.create(), 0, this.resolution.width, 0, this.resolution.height, -1, 1);
    }

    get viewProjectionMatrix() {
        return mat4.mul(mat4.create(), this.projection, this.camera.matrix);
    }
    // get viewRect() {
    //
    // }
}
