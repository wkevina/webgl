import {mat3, vec3, vec2} from 'gl-matrix';
import pl, {Vec2} from 'planck-js';

import {App, initCanvas} from '../js/app.js';
import {Grid} from '../js/graphics/Grid.js';
import {MouseDrawing, CameraPan} from '../js/controls.js';

import {SpriteRenderer} from "../js/graphics/SpriteRenderer";
import {Sprite} from "../js/graphics/Sprite";
import {WorldRenderer} from "../js/graphics/WorldRenderer";

import '../css/app.css';


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
//
//
// app.load({
//     basePath: 'shaders/',
//     programs: ['grid', 'sprite', 'lines']
// });

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


function bodyChain(options) {
    const endpointA = options.endpointA;
    const endpointB = options.endpointB;
    const segmentLength = options.segmentLength || 5;
    const thickness = options.thickness || 0.25;
    const chainLength = options.chainLength || Vec2.distance(endpointA, endpointB);
    const seg_count = Math.ceil(chainLength / segmentLength);
    const chainDirection = endpointB.clone().sub(endpointA);
    chainDirection.normalize();
    const angle = Math.atan(chainDirection.y / chainDirection.x);

    const segments = [];
    const joints = [];

    const alignChain = Vec2.distance(endpointA, endpointB) > 0;

    for (let i = 0; i < seg_count; i++) {
        const box = world.createBody().setDynamic();
        box.createFixture(pl.Box(segmentLength/2, thickness/2), {density: 1});
        // box.setMassData({
        //     mass: 1,
        //     center: Vec2(),
        //     I: 1
        // });
        box.resetMassData();

        if (alignChain) {
            box.setPosition(Vec2.add(endpointA, chainDirection.clone().mul(i * segmentLength).add(Vec2.mul(chainDirection, segmentLength / 2))));
        } else {
            box.setPosition(endpointA);
        }

        segments.push(box);
    }

    const jointDef = {
        localAnchorA: Vec2(segmentLength * 3 / 8, 0),
        localAnchorB: Vec2(-segmentLength * 3 / 8, 0),
        frequency: 0,
        dampingRatio: 0,
        maxLength: segmentLength/4
    };

    for (let i = 1; i < segments.length; i++) {
        const segA = segments[i - 1];
        const segB = segments[i];

        joints.push(world.createJoint(pl.RopeJoint(jointDef, segA, segB)));
    }

    return {
        segments,
        joints
    };
}

const world = pl.World(Vec2(0, -10));
//world.setGravity({x: 0, y: -5});

const ground = world.createBody();
ground.createFixture(pl.Chain([
    Vec2(-50, -50),
    Vec2(50, -50),
    Vec2(50, 50),
    Vec2(-50, 50)
], true));

(() => {
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
    ball.createFixture(pl.Circle(3), {friction: 1, density: 0.5, linearVelocityDampingRatio: 0.5});
    ball.setPosition(Vec2(0, -5));
//ball.setAngularVelocity(10);
//ball.setLinearVelocity(Vec2(0, 0));
    ball.setMassData({
        mass: 10,
        center: Vec2(),
        I: 1
    });

    const c = bodyChain({endpointA: Vec2(0, 0), endpointB: Vec2(0, 0), chainLength: 20, segmentLength: 1});

    world.createJoint(pl.RevoluteJoint({collideConnected: false, localAnchorA: Vec2(3, 0), localAnchorB: Vec2(-0.5, 0)}, ball, c.segments[0]));
    world.createJoint(pl.RevoluteJoint({collideConnected: false, localAnchorA: Vec2(0.5, 0), localAnchorB: Vec2(0, 0)}, c.segments[c.segments.length - 1], ground));
})();

/*

on mouse down {
  if mouse is over body
    create mouse joint to control body
    on mouse up {
      destroy mouse join
    }
  else {
    pan camera in sync with cursor
  }
}

 */

async function run() {
    await app.loader.loading;

    const spriteRenderer = new SpriteRenderer({
        game: app,
        textureInfo: {
            texture: app.framebuffer.texture,
            ...app.resolution
        }
    });

    // const grid = new GridOutline(app);
    // grid.addGrid(100, 100, [0.4, 0.1, 0.9, 0.4], 1);

    const worldRenderer = new WorldRenderer({
        game: app,
        pixelScale: PIXEL_SCALE
    });

    app.camera.centerAt(0, 0);

    requestAnimationFrame(function render() {
        world.step(1/60, undefined, 20);

        // const p = ball.getPosition();
        // app.camera.centerAt(p.x * PIXEL_SCALE, p.y * PIXEL_SCALE);

        app.adjustViewport();
        app.clear();

        app.framebuffer.attach();
        app.clear();

        app.enableCamera();

        // grid.render();

        worldRenderer.render(world, app.viewMatrix);

        app.framebuffer.detach();
        app.disableCamera();
        app.adjustViewport();

        spriteRenderer.render([
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
