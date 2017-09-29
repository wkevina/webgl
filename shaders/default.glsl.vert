#version 300 es

layout(location = 0) in vec4 a_position;
layout(location = 1) in vec4 a_color;

uniform mat4 m_view;
uniform mat4 m_projection;

out vec4 v_color;

void main() { 
    // transform input vertex position
    vec4 transformed_position = m_projection * m_view * a_position;
    
    // Write outputs
    gl_Position = transformed_position;    
    v_color = a_color;
}