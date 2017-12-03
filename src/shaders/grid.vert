#version 300 es

layout(location = 0) in vec2 vertex;
layout(location = 1) in vec2 position;
layout(location = 2) in vec2 size;

uniform mat4 projection;
uniform vec2 offset;

void main() {
    vec4 transformed_position = projection * vec4(position + size * vertex + offset, 0, 1);
    gl_Position = transformed_position;
}
