import {createProgram} from 'shader-util.js';
import {gl} from 'gl.js';
import {arraySetter} from 'util.js';
import twgl from 'twgl.js';

class ParticleSystem {
    constructor(game, opts) {
        this.game = game;
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
                positionFeedback: {
                    numComponents: 2,
                    drawType: gl.DYNAMIC_COPY
                },
                velocityFeedback: {
                    numComponents: 2,
                    drawType: gl.DYNAMIC_COPY
                }
            })
        };

        this.programs = {
            simulate: this.game.getProgram('particle.simulate')
        }

        const {position, velocity} = this.initParticles();

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

        this.transformFeedback = gl.createTransformFeedback();

    }

    initParticles() {
        const max_particles = 1000;
        const bounds = {
            x0: 0,
            y0: 0,
            x1: this.game.resolution.width,
            y1: this.game.resolution.height
        };
        const max_speed = 1;

        const position = new Float32Array(max_particles * 2);
        const velocity = new Float32Array(max_particles * 2);

        const setPosition = arraySetter(position);
        const setVelocity = arraySetter(velocity);

        for (let i = 0; i < max_particles; i++) {
            const angle = Math.PI * Math.random();
            const speed = Math.random() * max_speed;
            setVelocity([Math.cos(angle) * speed + 0.01, Math.sin(angle) * speed + 0.01]);
            setPosition([bounds.x0 + Math.random() * (bounds.x1 - bounds.x0), bounds.y0 + Math.random() * (bounds.y1 - bounds.y0)]);
        }

        return {position, velocity};
    }

    draw() {
        // var GPGPU2 = function ( renderer ) {
        //   var gl = renderer.context;
        //   var transformFeedback = gl.createTransformFeedback();
        //
        //   this.pass = function ( shader, source, target ) {
        //     var sourceAttrib = source.attributes['position'];
        //
        //     if (target.attributes['position'].buffer && sourceAttrib.buffer) {
        //       shader.bind();
        //       gl.enableVertexAttribArray( shader.attributes.position );
        //       gl.bindBuffer(gl.ARRAY_BUFFER, sourceAttrib.buffer);
        //       gl.vertexAttribPointer( shader.attributes.position, 4, gl.FLOAT, false, 16, 0 );
        //
        //       gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
        //       gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, target.attributes['position'].buffer);
        //       gl.enable(gl.RASTERIZER_DISCARD);
        //       gl.beginTransformFeedback(gl.POINTS);
        //
        //       gl.drawArrays(gl.POINTS, 0, sourceAttrib.length / sourceAttrib.itemSize);
        //
        //       gl.endTransformFeedback();
        //       gl.disable(gl.RASTERIZER_DISCARD);
        //
        //       // Unbind the transform feedback buffer so subsequent attempts
        //       // to bind it to ARRAY_BUFFER work.
        //       gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
        //
        //       //gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, 0);
        //     }
        //   };
        // };

        gl.useProgram(this.programs.simulate.program);

        twgl.setUniforms(this.programs.simulate, {
            projection: this.game.projection,
            bounds: [0, 0, this.game.resolution.width, this.game.resolution.height]
        });

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.simulate.attribs.positionFeedback.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, 4 * 1000 * 2, gl.DYNAMIC_COPY);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.simulate.attribs.velocityFeedback.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, 4 * 1000 * 2, gl.DYNAMIC_COPY);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        twgl.setBuffersAndAttributes(gl, this.programs.simulate, this.bufferInfo.simulate);

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedback);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.bufferInfo.simulate.attribs.positionFeedback.buffer);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.bufferInfo.simulate.attribs.velocityFeedback.buffer);
        // gl.enable(gl.RASTERIZER_DISCARD);
        gl.beginTransformFeedback(gl.POINTS);

        twgl.drawBufferInfo(gl, this.bufferInfo.simulate, gl.POINTS, 1000);

        gl.endTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);


        /* Copy positionFeedback buffer to position buffer */
        gl.bindBuffer(gl.COPY_READ_BUFFER, this.bufferInfo.simulate.attribs.positionFeedback.buffer);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, this.bufferInfo.simulate.attribs.position.buffer);

        gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, 1000 * 2 * 4);

        /* Copy velocityFeedback buffer to velocity buffer */
        gl.bindBuffer(gl.COPY_READ_BUFFER, this.bufferInfo.simulate.attribs.velocityFeedback.buffer);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, this.bufferInfo.simulate.attribs.velocity.buffer);

        gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, 1000 * 2 * 4);

        gl.bindBuffer(gl.COPY_READ_BUFFER, null);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
    }
}

class PixelBufferWrapper {
    constructor(opts) {
        let {buffer, width, height, components} = opts;
        this.buffer = buffer;
        this.width = width;
        this.height = height;
        this.components = components;
    }

    setPixel(x, y, value) {
        this.buffer.set(value, (y*this.width + x)*components);
    }
}

export {ParticleSystem, PixelBufferWrapper};
