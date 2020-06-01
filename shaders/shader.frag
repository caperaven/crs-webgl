#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 u_color;
uniform float u_time;
uniform float u_delta;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

vec3 mixOverTime(vec3 cl1, vec3 cl2, float delta) {
    vec3 color = vec3(0.0);
    float pct = abs(sin(delta));
    color = mix(cl1, cl2, pct);
    return color;
}

vec3 colorA = vec3(1.0, 0.5, 0.0);
vec3 colorB = vec3(0.0, 0.5, 1.0);

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec3 color = mixOverTime(colorA, colorB, u_time);
    color.x = cos(st.x);
    color.y = sin(st.y);

    gl_FragColor = vec4(color, 1.0);
}