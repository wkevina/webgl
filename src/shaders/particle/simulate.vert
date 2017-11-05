#version 300 es

in vec2 position;
in vec2 velocity;

out vec2 v_position;
out vec2 v_velocity;

//uniform sampler2D wallForce;
uniform mat4 projection;
uniform vec4 bounds;

void main() {
    vec2 v1, p1;

    v1 = velocity;
    //v1 += texelFetch(wallForce, ivec2(position));
    p1 = position + v1;

    vec2 v1_abs = abs(v1);

    if (p1.x < bounds.x) {
        v1.x = v1_abs.x;
    }

    if (p1.x >= bounds.z) {
        v1.x = -v1_abs.x;
    }

    if (p1.y < bounds.y) {
        v1.y = v1_abs.y;
    }

    if (p1.y >= bounds.w) {
        v1.y = -v1_abs.y;
    }

    v_velocity = v1;

    p1 = max(bounds.xy, p1);
    p1 = min(bounds.zw, p1);

    v_position = p1;

    gl_Position = projection * vec4(p1, 0, 1);
    gl_PointSize = 6.;
}
