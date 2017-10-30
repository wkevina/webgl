#version 300 es

layout(location = 0) in vec2 vertex;
layout(location = 1) in vec3 position;
layout(location = 2) in ivec2 texcoord;
layout(location = 3) in int image;

out vec2 v_tex_coord;
flat out int v_layer;

uniform mat4 projection;

/*

Convert coordinates from world space to clip space

 1. Scale [0, dim] -> [-1, 1] where dim is screen width or height
    dim pixels = 2 clip
    clip / pixels = 2 / dim
    x' = 2 * x / width - 1
    y' = 2 * y / height - 1

    2/w  0   0   -1
     0  2/h  0   -1
     0   0   1    0
     0   0   0    1
*/

void main() {
    vec4 transformed_position = projection * vec4(position + vec3(vertex, 0), 1);
    gl_Position = transformed_position;
    v_tex_coord = vec2(texcoord);
    v_layer = image;
}
