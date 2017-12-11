export {Sprite};

class Sprite {
    constructor(options) {
        this.position = options.position || [0, 0];
        this.size = options.size || [8, 8];
        // default angle is 0 radians
        this.angle = 0;
        // default is offset sets the sprite's bottom left corner at position
        this.offset = options.offset || [0, 0];
        // default backgroundColor is transparent black
        this.backgroundColor = options.backgroundColor || [0, 0, 0, 0];
        this.textureName = options.textureName || null;
    }
}