#version 300 es

precision mediump float;

out vec4 out_color;

flat in ivec2 tex_coord;

uniform sampler2D texture;

void main() {
    out_color = texelFetch(texture, tex_coord, 0);
}
