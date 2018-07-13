import {Grid} from './graphics/Grid';

export {Stage};
export default Stage;

class Stage {
    constructor() {
        this.scenes = [];
    }

    init(app) {
        this.app = app;
        this.resolution = app.resolution;
        this.frame = 0;
        this.grid = new Grid({
            resolution: this.resolution
        });
        this.showGrid = false;
        this.setup();
    }

    prerender(dt) {
        this.scenes.forEach((scene) => {
             scene.update(dt);
        });
    }

    render(dt) {
        this.scenes.forEach((scene) => {
            scene.render(dt);
        });

        if (this.showGrid) {
            this.grid.render(0, 0, this.app.projection);
        }
    }

    postrender(dt) {
        this.frame++;
    }

    addScene(scene) {
        this.scenes.push(scene);
        scene.init(this);
    }

    removeScene(scene) {
        const idx = this.scenes.indexOf(scene);

        if (idx !== -1) {
            this.scenes.splice(idx, 1);
            scene.deinit();
        }
    }
}
