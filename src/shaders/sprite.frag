#version 300 es

precision mediump float;

out vec4 out_color;

in vec2 v_tex_coord;

uniform sampler2D texture;

void main() {
    float line = v_tex_coord.y - floor(v_tex_coord.y);

    vec4 texel = texelFetch(texture, ivec2(v_tex_coord), 0).xyzw;
    out_color = texel; //vec4(texel.xyz * (line >= 0.5 ? 1. : .25), texel.w);
}
