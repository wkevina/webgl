import {vec3, vec4} from 'gl-matrix';

const MouseDrawingEvents = [
    'vertexadded',
    'lineadded',
    'drawingstart',
    'drawingend'
];

class MouseDrawing {

    constructor(options) {
        this.game = options.game;
        this.connected = options.connected || true;
        this.endKeys = options.endKeys || ['Shift'];

        if (!this.endKeys.length) {
            this.endKeys = [this.endKeys];
        }

        this.listeners = MouseDrawingEvents.reduce((acc, evt) => {
            acc[evt] = [];
            return acc;
        }, {});

        if (options.listeners) {
            Object.keys(options.listeners).forEach(key => this.addListener(key, options.listeners[key]));
        }

        this._lineData = new Float32Array(2 * 2 * 1024);
        this.currentLineIdx = 0;
        this.available = 0;
        this.isDrawing = false;

        this.game.canvas.addEventListener('mousemove', (evt) => {
            this.update(this.convertMouseCoordinates({x: evt.offsetX, y: evt.offsetY}));
        });

        this.game.canvas.addEventListener('mousedown', (evt) => {
            if (!this.isDrawing) {
                this.startLine(this.convertMouseCoordinates({x: evt.offsetX, y: evt.offsetY}));
            } else {
                this.endLine(this.convertMouseCoordinates({x: evt.offsetX, y: evt.offsetY}));
            }
        });

        window.addEventListener('keydown', (evt) => {
            if (this.endKeys.includes(evt.key) && this.isDrawing) {
                this.endDrawing(evt);
            }
        });
    }

    addListener(evt, listener) {
        if (!this.listeners[evt]) {
            this.listeners[evt] = [];
        }
        this.listeners[evt].push(listener);
    }

    notifyListeners(evt, ...args) {
        this.listeners[evt].forEach(listener => listener(...args));
    }

    convertMouseCoordinates(coord) {
        const mvec = vec4.fromValues(coord.x, coord.y, 0, 1);

        vec4.transformMat4(mvec, mvec, this.game.canvasToWorld);

        return {x: mvec[0], y: mvec[1]};
    }

    inBounds(coord) {
        return true;
    }

    startLine(coord) {
        if (this.inBounds(coord) && !this.isDrawing) {
            this.isDrawing = true;
            this.available++;

            this._lineData[this.lineIndex + 0] = coord.x;
            this._lineData[this.lineIndex + 1] = coord.y;

            this.update(coord);

            this.notifyListeners('drawingstart', {});
            this.notifyListeners('vertexadded', this.currentLineStart);
        }
    }

    get lineIndex() {
        return this.currentLineIdx * 4;
    }

    get lineData() {
        return this._lineData.slice(0, this.available * 4);
    }

    get currentLine() {
        return {
            start: this.currentLineStart,
            end: this.currentLineEnd
        }
    }

    get currentLineStart() {
        return {
            x: this._lineData[this.lineIndex],
            y: this._lineData[this.lineIndex + 1]
        };
    }

    get currentLineEnd() {
        return {
            x: this._lineData[this.lineIndex + 2],
            y: this._lineData[this.lineIndex + 3]
        }
    }

    endLine(coord) {
        if (this.isDrawing) {
            this._lineData[this.lineIndex + 2] = coord.x;
            this._lineData[this.lineIndex + 3] = coord.y;

            this.notifyListeners('lineadded', this.currentLine);
            this.notifyListeners('vertexadded', this.currentLineEnd);

            this.currentLineIdx++;

            if (!this.connected) {
                this.isDrawing = false;
            } else {
                this.available++;

                this._lineData[this.lineIndex + 0] = coord.x;
                this._lineData[this.lineIndex + 1] = coord.y;

                this.update(coord);
            }
        }
    }

    endDrawing(evt) {
        this.isDrawing = false;

        this.notifyListeners('drawingend', evt);
    }

    update(coord) {
        if (this.isDrawing) {
            this._lineData[this.lineIndex + 2] = coord.x;
            this._lineData[this.lineIndex + 3] = coord.y;
        }
    }

    clear() {
        this.available = 0;
        this.currentLineIdx = 0;
        this._lineData.fill(0);
    }
}

class Keyboard {
    constructor(options) {
        this.keys = new Map();
        document.addEventListener('keydown', this.keydown.bind(this));
        document.addEventListener('keyup', this.keyup.bind(this))
    }

    keydown(evt) {
        this.keys.set(evt.key, true);

        if (evt.key.startsWith('Arrow')) {
            evt.preventDefault();
        }
    }

    keyup(evt) {
        this.keys.delete(evt.key);
    }

    isdown(key) {
        return this.keys.get(key);
    }
}

class CameraPan {
    constructor(app) {
        this.pandir = [0, 0];
        this.speed = 200;
        this.keyboard = new Keyboard();

        let loopStartTime = null;

        const loop = now => {
            if (!loopStartTime) {
                loopStartTime = now;
            }
            let delta = (now - loopStartTime) / 1000;
            loopStartTime = now;

            this.pandir = [
                this.keyboard.isdown('ArrowLeft') ? -1 : this.keyboard.isdown('ArrowRight') ? 1 : 0,
                this.keyboard.isdown('ArrowDown') ? -1 : this.keyboard.isdown('ArrowUp') ? 1 : 0,
            ];

            if (this.keyboard.isdown('+')) {
                this.speed += 10;
            } else if (this.keyboard.isdown('-')) {
                this.speed -= 10;
                this.speed = Math.max(200, this.speed);
            }

            if (this.pandir[0] !== 0 || this.pandir[1] !== 0) {
                app.camera.translate(this.speed * delta * this.pandir[0], this.speed * delta * this.pandir[1])
            }

            this.loopId = requestAnimationFrame(loop);
        };

        this.loopId = requestAnimationFrame(loop);
    }
}

class CameraBodyTracker {
    constructor(game, body) {
        this.body = body;
        this.game = game;
        this.loopId = null;
    }

    start() {
        if (!this.loopId) {
            this.loopId = requestAnimationFrame(this.loop.bind(this));
        }
    }

    stop() {
        cancelAnimationFrame(this.loopId);
        this.loopId = null;
    }

    loop() {
        if (this.body) {
            this.game.camera.centerAt(this.body.position.x, this.body.position.y);
        }

        this.loopId = requestAnimationFrame(this.loop.bind(this));
    }
}

export {
    CameraPan,
    CameraBodyTracker,
    MouseDrawing,
    Keyboard
};
