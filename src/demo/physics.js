import {mat3, vec3} from 'gl-matrix';
import planck from 'planck-js';

import {App, initCanvas} from '../js/app.js';
import {GridOutline, LineRenderer} from '../js/graphics.js';
import {RenderPolygon} from '../js/components.js';
import {MouseDrawing, CameraPan, CameraBodyTracker} from '../js/controls.js';

import '../css/app.css';
import {SpriteRenderer} from "../js/graphics/SpriteRenderer";
import {Sprite} from "../js/graphics/Sprite";

const app = new App({
    el: initCanvas('content', 'game'),
    debug: false,
    clearColor: [0.1, 0.1, 0.1, 1],
    resolution: {
        width: 1400,
        height: 780
    },
    pixelMultiplier: 1
});


app.load({
    basePath: 'shaders/',
    programs: ['grid', 'sprite', 'lines']
});

const cameraPanControl = new CameraPan(app);

const PIXEL_SCALE = 50;


const shapeFromMouse = (app, engine) => {
    let vertices;

    const drawing = new MouseDrawing({
        game: app,
        connected: true,
        listeners: {
            drawingstart: () => {
                vertices = [];
            },
            vertexadded: (vtx) => {
                vertices.push(vtx);
            },
            drawingend: (evt) => {
                const scaled_vtx = vertices.map(vtx => ({x: vtx.x / PIXEL_SCALE, y: vtx.y / PIXEL_SCALE}));
                const center = Vertices.centre(scaled_vtx);
                const isStatic = evt.key === 'Shift';
                const newbody = Bodies.fromVertices(
                    0, 0,
                    scaled_vtx,
                    true
                );

                if (newbody) {
                    // Body.setStatic(newbody, isStatic);
                    // Body.setPosition(newbody, center);
                    // newbody.restitution = 0.999;
                    // newbody.friction = 0.7;
                    // newbody.frictionStatic = 10;
                    //
                    //
                    // World.add(engine.world, newbody);
                }

                //newbody.collisionFilter.group = 0;
                drawing.clear();
            }
        },
        endKeys: ['Enter', 'Shift']
    });

    return drawing;
};


const buildTheWall = (engine, bounds, thickness) => {
    const center_x = bounds.min.x + (bounds.max.x - bounds.min.x) / 2;
    const center_y = bounds.min.y + (bounds.max.y - bounds.min.y) / 2;
    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;

    // World.add(engine.world, [
    //     Bodies.rectangle(center_x, bounds.min.y - thickness/2, width + thickness * 2, thickness, {isStatic: true}),
    //     Bodies.rectangle(center_x, bounds.max.y + thickness/2, width + thickness * 2, thickness, {isStatic: true}),
    //     Bodies.rectangle(bounds.min.x - thickness/2, center_y, thickness, height + thickness * 2, {isStatic: true}),
    //     Bodies.rectangle(bounds.max.x + thickness/2, center_y, thickness, height + thickness * 2, {isStatic: true})
    // ]);
};


var pl = planck, Vec2 = pl.Vec2;

var world = pl.World(Vec2(0, -10));

var bar = world.createBody();
bar.createFixture(pl.Edge(Vec2(-20, 5), Vec2(20, 5)));
bar.setAngle(0.2);

for (var i = -2; i <= 2; i++) {
    for (var j = -2; j <= 2; j++) {
        var box = world.createBody().setDynamic();
        box.createFixture(pl.Box(0.5, 0.5));
        box.setPosition(Vec2(i * 1, -j * 1 + 20));
        box.setMassData({
            mass: 1,
            center: Vec2(),
            I: 1
        })
    }
}

function renderWorld(world, renderer) {
    for (var b = world.getBodyList(); b; b = b.getNext()) {
        for (var f = b.getFixtureList(); f; f = f.getNext()) {
            var type = f.getType();
            var shape = f.getShape();
            if (type == 'circle') {
                f.ui = viewer.drawCircle(shape, this._options);
            }
            if (type == 'edge') {
                f.ui = viewer.drawEdge(shape, this._options);
            }
            if (type == 'polygon') {
                f.ui = viewer.drawPolygon(shape, this._options);
            }
            if (type == 'chain') {
                f.ui = viewer.drawChain(shape, this._options);
            }
        }
    }
}

async function run() {
    await app.loader.loading;

    // // create an engine
    // const engine = Engine.create();
    //
    // engine.world.gravity.y = -0.5;
    //
    // // create two boxes and a ground
    // const boxA = Bodies.rectangle(100, 500, 100, 20);
    // const boxB = Bodies.rectangle(100, 450, 100, 20);
    // boxA.friction = 0.01;
    // boxB.friction = 0.01;
    // boxA.frictionStatic = 1;
    // boxB.frictionStatic = 1;
    // boxA.restitution = 0.99;
    // boxB.restitution = 0.99;
    // Body.setAngle(boxA, 1);
    // Body.setAngularVelocity(boxA, 0.1);
    // //boxB.restitution = 0.1;
    //
    // // add all of the bodies to the world
    // World.add(engine.world, [boxA, boxB]);
    //
    // buildTheWall(engine, {min: {x: 0, y: 0}, max: {x: app.resolution.width, y: app.resolution.height}}, 50);

    // const render = Render.create({
    //     element: document.getElementById('content'),
    //     engine: engine,
    //     options: {
    //         ...app.resolution
    //     }
    // });
    //
    // render.context.transform(1, 0, 0, -1, 0, app.resolution.height);
    //
    // Render.run(render);

    //const drawing = shapeFromMouse(app, engine, 50);

    const framebufferRenderer = new SpriteRenderer({
        game: app,
        textureInfo: {
            texture: app.framebuffer.texture,
            ...app.resolution
        }
    });

    const grid = new GridOutline(app);
    grid.addGrid(20, 20, [0.4, 0.1, 0.9, 0.4], 1);

    const lineRenderer = new LineRenderer({
        game: app
    });

    requestAnimationFrame(function render() {
        // Engine.update(engine, 1000 / 60);
        // const bodies = Composite.allBodies(engine.world);
        //
        // const polygons = [];
        //
        // bodies.forEach(body => {
        //     const parts = body.parts.length > 1 ? body.parts.slice(1) : body.parts;
        //
        //     parts.forEach(part => {
        //         const vertices = part.vertices.map(vertex => [vertex.x, vertex.y]);
        //
        //         polygons.push(new RenderPolygon({
        //             vertices,
        //             position: [body.position.x, body.position.y],
        //             angle: body.angle
        //         }));
        //     });
        // });

        world.step(1000 / 60);

        app.adjustViewport();
        app.clear();

        app.framebuffer.attach();
        app.clear();

        grid.render();

        renderWorld(world, lineRenderer);

        // lineRenderer.renderPolygons(polygons);

        // if (drawing.available > 0) {
        //     lineRenderer.render(drawing.lineData, [0.5, 0.5, 0.5, 1]);
        // }

        app.framebuffer.detach();
        app.adjustViewport();

        framebufferRenderer.render([
            new Sprite({
                position: [0, 0],
                size: [app.resolution.width, app.resolution.height]
            })
        ]);

        requestAnimationFrame(render);
    });
}

run();
