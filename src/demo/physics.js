import {mat3, vec3} from 'gl-matrix';
import {Matter} from 'matter-js';

import {GridOutline, SpriteRenderer, LineRenderer} from '../js/graphics.js';
import {Sprite} from '../js/components.js';

import '../css/app.css'

import {App, initCanvas} from '../js/app.js';


const app = new App({
    el: initCanvas('content', 'game'),
    debug: false,
    clearColor: [0.1, 0.1, 0.1, 1],
    resolution: {
        width: 320,
        height: 240
    }
});



app.load({
    basePath: 'shaders/',
    programs: ['grid', 'sprite', 'lines']
});


// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine
});

// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);



async function run() {
    await app.loader.loading;

    const framebufferRenderer = new SpriteRenderer({
        game: app,
        textureInfo: {
            texture: app.framebuffer.texture,
            ...app.resolution
        }
    });

    const grid = new GridOutline(app);
    grid.addGrid( 8,  8, [0.4, 0.1, 0.9, 0.4], 1);

    const lineRenderer = new LineRenderer({
        game: app
    });

    requestAnimationFrame(function render() {
        app.adjustViewport();
        app.clear();

        app.framebuffer.attach();
        app.clear();

        grid.render();

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
