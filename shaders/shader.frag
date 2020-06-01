#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 u_color;
uniform float u_time;

vec3 colorA = vec3(1.0, 0.0, 0.0);
vec3 colorB = vec3(0.0, 0.0, 1.0);

vec3 mixOverTime(vec3 cl1, vec3 cl2) {
    vec3 color = vec3(0.0);
    float pct = abs(sin(u_time));
    color = mix(cl1, cl2, pct);
    return color;
}

void main() {
    gl_FragColor = vec4(mixOverTime(colorA, colorB), 1.0);
}