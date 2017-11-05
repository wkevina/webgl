#version 300 es

layout(location = 0) in vec2 vertex;
layout(location = 1) in vec3 position;
layout(location = 2) in vec2 texcoord;
layout(location = 3) in int layer;

out vec2 v_tex_coord;
flat out int v_layer;

uniform mat4 projection;

void main() {
    vec4 transformed_position = projection * vec4(position + vec3(vertex, 0), 1);
    gl_Position = transformed_position;
    v_tex_coord = texcoord;
    v_layer = layer;
}
