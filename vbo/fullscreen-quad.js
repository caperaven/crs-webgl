export default function createVBO(gl) {
    const vertices = new Float32Array(
        [
            1.0,  1.0,
            -1.0,  1.0,
            -1.0, -1.0,
            -1.0, -1.0,
            1.0, -1.0,
            1.0,  1.0
        ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    return {
        buffer: buffer,
        length: vertices.length / 2
    };
}