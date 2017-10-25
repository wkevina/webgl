
class Sprite {
    constructor({position, size, image, offset}) {
        this.position = position;
        this.size = size;
        this.image = image;
        this.offset = offset || [0, 0];
    }
}

export {Sprite};
