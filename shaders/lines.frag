#version 300 es

precision mediump float;
precision mediump int;

out vec4 out_color;

uniform highp vec4 color;

void main() {
    out_color = color;
}
