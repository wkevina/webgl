
class Sprite {
    constructor({position, size, image, offset}) {
        this.position = position;
        this.size = size;
        this.image = image;
        this.offset = offset || [0, 0];
    }
}

class Polygon {
    constructor(options) {
        this.vertices = options.vertices;
        this.closed = options.closed || true;
        this.position = options.position || [0.0, 0.0];
        this.angle = options.angle || 0.0;
        this.scale = options.scale || [1.0, 1.0];
    }
}

export {Sprite, Polygon};
