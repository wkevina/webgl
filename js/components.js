

class RenderPolygon {
    constructor(options) {
        this.vertices = options.vertices;
        this.closed = options.closed || true;
        this.position = options.position || [0.0, 0.0];
        this.angle = options.angle || 0.0;
        this.scale = options.scale || [1.0, 1.0];
    }
}

export {RenderPolygon};
