#version 300 es

layout(location = 0) in vec2 position;

uniform mat4 projection;

void main() {
    vec4 transformed_position = projection * vec4(position, 0, 1);
    gl_Position = transformed_position;
}
