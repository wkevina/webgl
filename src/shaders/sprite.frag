#version 300 es

precision mediump float;

out vec4 out_color;

in vec2 v_tex_coord;

uniform sampler2D texture;

void main() {
    out_color = texelFetch(texture, ivec2(v_tex_coord), 0);
}
