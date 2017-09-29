#version 300 es

precision mediump float;

out vec4 out_color;

in vec4 v_color;

void main() {
    out_color = v_color;
}