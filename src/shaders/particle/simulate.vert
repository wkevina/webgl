#version 300 es

in vec2 position;
in vec2 velocity;
in vec4 color;

out vec2 v_position;
out vec2 v_velocity;
out vec4 v_color;

uniform mediump sampler2D wallForce;

uniform mat4 projection;
uniform vec4 bounds;

float DRAG = 0.01;

void main() {
    vec2 v1, p1;

    v1 = velocity;

    vec2 wall_normal = texelFetch(wallForce, ivec2(position), 0).xy;

    if (length(wall_normal) > 0.8) {
        v1 = reflect(v1, wall_normal);
        p1 += wall_normal;
    } else {
        v1 += wall_normal;
    }

    // drag
    v1 -= DRAG * normalize(v1) * dot(v1, v1);

    p1 += position + v1;

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
    v_color = color;

    gl_Position = projection * vec4(p1, 0, 1);
    gl_PointSize = 4.;
}
