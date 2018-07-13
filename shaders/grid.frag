#version 300 es

precision mediump float;

uniform vec4 line_color;

out vec4 out_color;

void main() {
    out_color = line_color;
}
