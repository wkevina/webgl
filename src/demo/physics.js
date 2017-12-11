import {mat3, vec3, vec2} from 'gl-matrix';
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
        height: 728
    },
    pixelMultiplier: 1
});


app.load({
    basePath: 'shaders/',
    programs: ['grid', 'sprite', 'lines']
});

const cameraPanControl = new CameraPan(app);

const PIXEL_SCALE = 10;


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


const pl = planck, Vec2 = pl.Vec2;

const world = pl.World(Vec2(0, -10));
//world.setGravity({x: 0, y: -5});

const bar = world.createBody();
// bar.createFixture(pl.Edge(Vec2(-15, -7), Vec2(15, -7)));
// bar.createFixture(pl.Edge(Vec2(-15, 7), Vec2(15, 7)));
//
// bar.createFixture(pl.Edge(Vec2(-15, -7), Vec2(-15, 7)));
// bar.createFixture(pl.Edge(Vec2(15, -7), Vec2(15, 7)));

// bar.createFixture(pl.Chain([
//     Vec2(-15, -7),
//     Vec2(15, -7),
//     Vec2(15, 7),
//     Vec2(-15, 7)
// ], true));


bar.createFixture(pl.Chain([
    Vec2(-1000, -500),
    Vec2(100, -500),
    Vec2(150, -300),
    Vec2(1000, -100)
]), {friction: 1});


// for (var i = -2; i <= 2; i++) {
//     for (var j = -2; j <= 2; j++) {
//         var box = world.createBody().setDynamic();
//         box.createFixture(pl.Box(0.5, 0.5));
//         box.setPosition(Vec2(i, -j));
//         box.setMassData({
//             mass: 1,
//             center: Vec2(),
//             I: 1
//         })
//     }
// }

let box = world.createBody().setDynamic();
box.createFixture(pl.Box(0.5, 0.5));
box.setPosition(Vec2(2, 10));
box.setAngle(10);
box.setAngularVelocity(1);
box.setMassData({
    mass: 1,
    center: Vec2(),
    I: 1
});

box = world.createBody().setDynamic();
box.createFixture(pl.Box(1, 1));
box.setPosition(Vec2(0, -5));
box.setAngularVelocity(-500);
box.setMassData({
    mass: 1,
    center: Vec2(),
    I: 1
});

box = world.createBody().setDynamic();
box.createFixture(pl.Box(1, 1));
box.setPosition(Vec2(8, 10));
box.setAngularVelocity(2);
box.setMassData({
    mass: 1,
    center: Vec2(),
    I: 1
});

let ball = world.createBody().setDynamic();
ball.createFixture(pl.Circle(3), {friction: 1});
ball.setPosition(Vec2(-200, 0));
ball.setAngularVelocity(0);
ball.setLinearVelocity(Vec2(0, 0));
ball.setMassData({
    mass: 1,
    center: Vec2(),
    I: 5
});


function transformVertices(vertices, transform) {
    return vertices.map(vertex => {
        const out = vec2.fromValues(vertex.x, vertex.y);
        vec2.transformMat3(out, out, transform);
        return {x: out[0], y: out[1]};
    });
}

function circle(shape, transform, segments = 10) {
    const radius = shape.m_radius;
    const vertices = [];

    vertices.push(Vec2(0, 0));

    vertices.push(Vec2(radius, 0));

    for (let i = 1; i < segments; i++) {
        const x = radius * Math.cos(2 * Math.PI / segments * i);
        const y = radius * Math.sin(2 * Math.PI / segments * i);
        vertices.push(Vec2(x, y));
    }

    const scaledVertices = transformVertices(vertices, transform);
    vertices.length = 0;

    scaledVertices.forEach((vertex, index) => {
        vertices.push(vertex.x, vertex.y);

        if (index > 0) {
            vertices.push(vertex.x, vertex.y);
        }
    });

    const firstVertex = scaledVertices[1];

    vertices.push(firstVertex.x, firstVertex.y);

    return vertices;
}

function edge(shape, transform) {
    const vertices = [];

    const scaledVertices = transformVertices([shape.m_vertex1, shape.m_vertex2], transform);

    scaledVertices.forEach((vertex, index) => {
        vertices.push(vertex.x, vertex.y);

        if (index > 0 && index < scaledVertices.length - 1) {
            vertices.push(vertex.x, vertex.y);
        }
    });

    return vertices;
}

function polygon(shape, transform) {
    const vertices = [];

    const scaledVertices = transformVertices(shape.m_vertices, transform);

    scaledVertices.forEach((vertex, index) => {
        vertices.push(vertex.x, vertex.y);

       if (index > 0) {
           vertices.push(vertex.x, vertex.y);
       }
    });

    const firstVertex = scaledVertices[0];

    vertices.push(firstVertex.x, firstVertex.y);

    return vertices;
}

function chain(shape, transform) {
    const vertices = [];

    const scaledVertices = transformVertices(shape.m_vertices, transform);

    scaledVertices.forEach((vertex, index) => {
        vertices.push(vertex.x, vertex.y);

        if (index > 0 && index < scaledVertices.length - 1) {
            vertices.push(vertex.x, vertex.y);
        }
    });

    return vertices;
}

function renderWorld(world, renderer) {
    const lines = [];
    for (let b = world.getBodyList(); b; b = b.getNext()) {
        const p = b.getPosition();
        const angle = b.getAngle();

        const modelTransform = mat3.fromScaling(mat3.create(), [PIXEL_SCALE, PIXEL_SCALE]);
        mat3.translate(modelTransform, modelTransform, [p.x, p.y]);
        mat3.rotate(modelTransform, modelTransform, angle);



        for (let f = b.getFixtureList(); f; f = f.getNext()) {
            const type = f.getType();
            const shape = f.getShape();
            if (type === 'circle') {
                lines.push(...circle(shape, modelTransform));
            }
            if (type === 'edge') {
                lines.push(...edge(shape, modelTransform));
            }
            if (type === 'polygon') {
                lines.push(...polygon(shape, modelTransform));
            }
            if (type == 'chain') {
                lines.push(...chain(shape, modelTransform));
            }
        }
    }

    renderer.render(lines);
}

function bodyChain(endpointA, endpointB, segmentLength = 2, thickness = 0.25) {
    const chainLength = Math.sqrt((endpointA.x - endpointB.x)**2 + (endpointA.y - endpointB.y)**2);
    const seg_count = Math.ceil(chainLength / segmentLength);
    const chainDirection = endpointB.clone().sub(endpointA);
    chainDirection.normalize();
    const angle = Math.atan(chainDirection.y / chainDirection.x);

    const segments = [];
    const joints = [];


    for (let i = 0; i < seg_count; i++) {
        const box = world.createBody().setDynamic();
        box.createFixture(pl.Box(segmentLength/4, thickness));
        box.setMassData({
            mass: 1,
            center: Vec2(),
            I: 1
        });

        box.setPosition(Vec2.add(endpointA, chainDirection.clone().mul(i * segmentLength).add(Vec2.mul(chainDirection, segmentLength / 4))));

        segments.push(box);
    }

    const ropeDef = {collideConnected: false};
    ropeDef.maxLength = segmentLength / 4;
    ropeDef.localAnchorA = Vec2(segmentLength / 4, 0);
    ropeDef.localAnchorB = Vec2(-segmentLength / 4, 0);

    for (let i = 1; i < segments.length; i++) {
        const segA = segments[i - 1];
        const segB = segments[i];

        joints.push(world.createJoint(pl.RopeJoint(ropeDef, segA, segB)));
    }

    return {
        segments,
        joints
    };
}

const c = bodyChain(Vec2(-200, 0), Vec2(0, 0));

world.createJoint(pl.RevoluteJoint({collideConnected: false, localAnchorA: Vec2(3, 0), localAnchorB: Vec2(-1/2, 0)}, ball, c.segments[0]));

world.createJoint(pl.RevoluteJoint({collideConnected: false, localAnchorA: Vec2(1/4, 0), localAnchorB: Vec2(0, 0)}, c.segments[c.segments.length - 1], bar));

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
    grid.addGrid(100, 100, [0.4, 0.1, 0.9, 0.4], 1);

    const lineRenderer = new LineRenderer({
        game: app
    });

    app.camera.centerAt(0, 0);

    requestAnimationFrame(function render() {
        world.step(1/60);


        const p = ball.getPosition();
        app.camera.centerAt(p.x * PIXEL_SCALE, p.y * PIXEL_SCALE);

        app.adjustViewport();
        app.clear();

        app.framebuffer.attach();
        app.clear();

        app.enableCamera();

        grid.render();

        renderWorld(world, lineRenderer);

        // lineRenderer.renderPolygons(polygons);

        // if (drawing.available > 0) {
        //     lineRenderer.render(drawing.lineData, [0.5, 0.5, 0.5, 1]);
        // }

        app.framebuffer.detach();
        app.disableCamera();
        app.adjustViewport();

        framebufferRenderer.render([
            new Sprite({
                position: [0, 0],
                size: [app.resolution.width, app.resolution.height]
            })
        ],
            app.projection);

        requestAnimationFrame(render);
    });
}

run();
