#version 300 es

precision mediump float;
precision mediump int;

out vec4 out_color;

in vec2 v_tex_coord;
flat in int v_tile_index;

uniform highp sampler2DArray texture;
uniform lowp ivec2 tile_size;

#define TILE_X_MASK 0x0F
#define TILE_Y_MASK 0xF0
#define TILE_Z_MASK 0xFF00

#define TILE_Y_SHIFT 4
#define TILE_Z_SHIFT 8

#define tile_coord(idx) (ivec3(idx & TILE_X_MASK, (idx & TILE_Y_MASK) >> TILE_Y_SHIFT, (idx & TILE_Z_MASK) >> TILE_Z_SHIFT))

void main() {
    ivec3 tile_coords = tile_coord (v_tile_index);

    out_color = texelFetch(texture, ivec3(tile_coords.xy * tile_size + ivec2(v_tex_coord), tile_coords.z), 0);

    //out_color = vec4(1.);
}
