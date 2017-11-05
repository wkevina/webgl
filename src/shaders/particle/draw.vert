#version 300 es

in vec2 position;
in vec2 velocity;

out vec2 v_position;
out vec2 v_velocity;

//uniform sampler2D wallForce;
uniform mat4 projection;

void main() {
    vec2 v1, p1;

    v1 = velocity;
    //v1 += texelFetch(wallForce, ivec2(position));
    p1 = position + v1;

    v_velocity = v1;
    v_position = p1;

    gl_Position = projection * vec4(p1, 0, 1);
}
