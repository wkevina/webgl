import {mat3, vec3} from 'gl-matrix';

import '../js/shim/poly-decomp-shim.js'

import {Engine, Render, World, Body, Bodies, Composite, Vertices} from 'matter-js';

import {App, initCanvas} from '../js/app.js';
import {GridOutline, SpriteRenderer, LineRenderer} from '../js/graphics.js';
import {Sprite, RenderPolygon} from '../js/components.js';
import {MouseDrawing, CameraPan, CameraBodyTracker} from '../js/controls.js';

import '../css/app.css'

const app = new App({
    el: initCanvas('content', 'game'),
    debug: false,
    clearColor: [0.1, 0.1, 0.1, 1],
    resolution: {
        width: 1000,
        height: 800
    },
    pixelMultiplier: 1
});


app.load({
    basePath: 'shaders/',
    programs: ['grid', 'sprite', 'lines']
});

const cameraPanControl = new CameraPan(app);


async function run() {
    await app.loader.loading;

    // create an engine
    const engine = Engine.create();
    engine.world.gravity.y = -1;

    // create two boxes and a ground
    const boxA = Bodies.rectangle(100, 50, 16, 16);
    const boxB = Bodies.rectangle(30, 50, 80, 80);
    const ground = Bodies.rectangle(639 / 2 + 1, 8 / 2 + 1, 639, 8, {isStatic: true});
    ground.collisionFilter.group = 1;

    // add all of the bodies to the world
    World.add(engine.world, [boxA, ground]);
    World.add(engine.world, boxB);

    var render = Render.create({
        element: document.getElementById('content'),
        engine: engine,
        options: {
            ...app.resolution
        }
    });

    render.context.transform(1, 0, 0, -1, 0, app.resolution.height);

    Render.run(render);

    let vertices;
    const tracker = new CameraBodyTracker(app, null);

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
                const center = Vertices.centre(vertices);
                const isStatic = evt.key === 'Shift';
                const newbody = Bodies.fromVertices(
                    center.x, center.y,
                    vertices,
                    true
                );

                if (newbody) {
                    Body.setStatic(newbody, isStatic);
                    Body.setPosition(newbody, center);
                    World.add(engine.world, newbody);
                    tracker.body = newbody;
                    tracker.start();
                }

                //newbody.collisionFilter.group = 0;
                drawing.clear();
            }
        },
        endKeys: ['Enter', 'Shift']
    });

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
        Engine.update(engine, 1000 / 60);
        const bodies = Composite.allBodies(engine.world);

        const polygons = [];

        bodies.forEach(body => {
            const parts = body.parts.length > 1 ? body.parts.slice(1) : body.parts;

            parts.forEach(part => {
                const vertices = part.vertices.map(vertex => [vertex.x, vertex.y]);

                polygons.push(new RenderPolygon({
                    vertices,
                    position: [body.position.x, body.position.y],
                    angle: body.angle
                }));
            });
        });

        app.adjustViewport();
        app.clear();

        app.framebuffer.attach();
        app.clear();

        grid.render();

        lineRenderer.renderPolygons(polygons);

        if (drawing.available > 0) {
            lineRenderer.render(drawing.lineData, [0.5, 0.5, 0.5, 1]);
        }

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
