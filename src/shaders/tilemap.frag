#version 300 es

precision mediump float;
precision mediump int;

out vec4 out_color;

in vec2 v_tex_coord;
flat in int v_layer;

uniform highp sampler2DArray texture;

void main() {
    out_color = texelFetch(texture, ivec3(v_tex_coord, v_layer), 0);
}
