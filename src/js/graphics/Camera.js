import {mat3, mat4, vec2, vec3, vec4} from 'gl-matrix';

export {Camera};

class Camera {
    constructor(bounds) {
        this._translation = vec2.create();
        this._bounds = bounds;
    }

    centerAt(x, y) {
        this._translation.set([
            -(x - this._bounds.width / 2),
            -(y - this._bounds.height / 2)
        ]);

        return this;
    }

    translate(x, y) {
        vec2.sub(this._translation, this._translation, [x, y]);

        return this;
    }

    get position() {
        return vec2.clone(this._translation);
    }

    get translation() {
        return this.position;
    }

    get matrix() {
        return mat4.fromTranslation(mat4.create(), vec4.fromValues(...this._translation, 0, 1));
    }
}
