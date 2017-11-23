class MouseListener {
    constructor(canvas, updateCallback) {
        this.canvas = canvas;
        this.updateCallback = updateCallback;
        this.mousePosition = {
            x: 0,
            y: 0
        };
        this.canvas.addEventListener('mousemove', evt => this.onMouseMove(evt));
    }

    onMouseMove(evt) {
        const {offsetX: x, offsetY: y} = evt;

        this.mousePosition.x = x;
        this.mousePosition.y = y;

        if (this.updateCallback) {
            this.updateCallback({mousePosition: {x, y}});
        }
    }
}

export {
    MouseListener
};
