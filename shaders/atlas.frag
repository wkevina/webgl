#version 300 es

precision mediump float;

out vec4 out_color;

in vec3 v_tex_coord;

uniform highp sampler2DArray texture;

void main() {
    vec4 texel = texelFetch(texture, ivec3(v_tex_coord), 0);

    out_color = texel; //vec4(texel.xyz * (line >= 0.5 ? 1. : .25), texel.w);
}
