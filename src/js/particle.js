import {gl} from './gl.js';
import {arraySetter, hsl2rgb} from './util';
import twgl from './twgl';

function randomColor() {
    return [
        ...hsl2rgb(Math.random()*360, Math.random() * 50 + 50, Math.random() * 50 + 20),
        (Math.random() * 0.6 + 0.4) * 255
    ];
}

class ParticleSystem {
    constructor(opts) {
        let {game, maxParticles} = opts;
        this.game = game;
        this.maxParticles = maxParticles;
        this.frameCount = 0;
        this.setup();
    }

    setup() {
        /*
        Create buffers for particle rendering and simulation

        Simulation requires buffers for
          - position in
          - velocity in
          - position out
          - velocity out
        */

        this.bufferInfo = {
            simulate: twgl.createBufferInfoFromArrays(gl, {
                position: {
                    numComponents: 2,
                    drawType: gl.DYNAMIC_DRAW
                },
                velocity: {
                    numComponents: 2,
                    drawType: gl.DYNAMIC_DRAW
                },
                color: {
                    type: Uint8Array,
                    data: this.maxParticles * 4,
                    numComponents: 4,
                    normalized: true,
                    drawType: gl.DYNAMIC_DRAW
                },
                positionFeedback: {
                    numComponents: 2,
                    drawType: gl.DYNAMIC_COPY,
                    data: this.maxParticles * 2
                },
                velocityFeedback: {
                    numComponents: 2,
                    drawType: gl.DYNAMIC_COPY,
                    data: this.maxParticles * 2
                }
            })
        };

        this.programs = {
            simulate: this.game.getProgram('particle.simulate')
        };

        const {position, velocity, color} = this.initParticles();
        this.color = color;

        twgl.setAttribInfoBufferFromArray(
            gl,
            this.bufferInfo.simulate.attribs.position,
            position
        );

        twgl.setAttribInfoBufferFromArray(
            gl,
            this.bufferInfo.simulate.attribs.velocity,
            velocity
        );

        twgl.setAttribInfoBufferFromArray(
            gl,
            this.bufferInfo.simulate.attribs.color,
            color
        );

        this.transformFeedback = gl.createTransformFeedback();
    }

    initParticles() {
        const max_particles = this.maxParticles;
        const bounds = {
            x0: 0,
            y0: this.game.resolution.height,
            x1: this.game.resolution.width,
            y1: this.game.resolution.height
        };
        const max_speed = 1;

        const position = new Float32Array(max_particles * 2);
        const velocity = new Float32Array(max_particles * 2);
        const color = new Uint8Array(max_particles * 4);

        const setPosition = arraySetter(position);
        const setVelocity = arraySetter(velocity);
        const setColor = arraySetter(color);

        for (let i = 0; i < max_particles; i++) {
            const angle = Math.PI * Math.random();
            const speed = Math.random() * max_speed;
            const randColor = randomColor();

            setVelocity([Math.cos(angle) * speed + 0.01, Math.sin(angle) * speed + 0.01]);
            setPosition([
                bounds.x0 + Math.random() * (bounds.x1 - bounds.x0),
                bounds.y0 + Math.random() * (bounds.y1 - bounds.y0)
            ]);
            setColor(randColor);
        }

        return {position, velocity, color};
    }

    setColors() {
        const max_particles = this.maxParticles;

        for (let i = 0; i < max_particles / 10; i++) {
            this.color.set(randomColor(), Math.floor(Math.random() * max_particles) * 4);
        }

        twgl.setAttribInfoBufferFromArray(
            gl,
            this.bufferInfo.simulate.attribs.color,
            this.color
        );
    }

    draw() {
        gl.useProgram(this.programs.simulate.program);

        gl.bindVertexArray(null);

        twgl.setUniforms(this.programs.simulate, {
            projection: this.game.projection,
            _bounds: [0, 0, this.game.resolution.width, this.game.resolution.height],
            wallForce: this.game.loader.getTexture('wallForce')
        });

        if (this.frameCount % 50 === 0) {
            this.setColors();
        }


        twgl.setBuffersAndAttributes(gl, this.programs.simulate, this.bufferInfo.simulate);

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedback);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.bufferInfo.simulate.attribs.positionFeedback.buffer);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.bufferInfo.simulate.attribs.velocityFeedback.buffer);
        // gl.enable(gl.RASTERIZER_DISCARD);
        gl.beginTransformFeedback(gl.POINTS);

        twgl.drawBufferInfo(gl, this.bufferInfo.simulate, gl.POINTS, this.maxParticles);

        gl.endTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);


        /* Copy positionFeedback buffer to position buffer */
        gl.bindBuffer(gl.COPY_READ_BUFFER, this.bufferInfo.simulate.attribs.positionFeedback.buffer);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, this.bufferInfo.simulate.attribs.position.buffer);

        gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, this.maxParticles * 2 * 4);

        /* Copy velocityFeedback buffer to velocity buffer */
        gl.bindBuffer(gl.COPY_READ_BUFFER, this.bufferInfo.simulate.attribs.velocityFeedback.buffer);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, this.bufferInfo.simulate.attribs.velocity.buffer);

        gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, this.maxParticles * 2 * 4);

        gl.bindBuffer(gl.COPY_READ_BUFFER, null);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);

        this.frameCount++;
    }
}

export {ParticleSystem};
