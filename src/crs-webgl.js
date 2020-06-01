class WebGL extends HTMLElement {
    connectedCallback() {
        this._initCanvas();
        this._loadShaders();
    }

    disconnectedCallback() {
        this.canvas = null;
        this.gl = null;
    }

    _initCanvas() {
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.appendChild(this.canvas);

        this.gl = this.canvas.getContext("webgl");
    }

    _loadShaders() {
        const vertAttr = this.getAttribute("vertex-shader");
        const fragAttr = this.getAttribute("fragment-shader");

        let vertShader;
        let fragShader;

        Promise.all([
            getCode(vertAttr).then(src => vertShader = compileShader(this.gl, src, this.gl.VERTEX_SHADER)),
            getCode(fragAttr).then(src => fragShader = compileShader(this.gl, src, this.gl.FRAGMENT_SHADER))
        ]).then(() => {
            this.program = createProgram(this.gl, vertShader, fragShader);
            this._draw();
        })
    }

    _draw() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // TEMP
        const vertices = new Float32Array(
            [
                -0.5, -0.5,
                0.5, -0.5,
                0.0, 0.5
            ]);
        
        https://www.youtube.com/watch?v=XNbtwyWh9HA

        var buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        this.gl.useProgram(this.program);

        this.program.color = this.gl.getUniformLocation(this.program, "color");
        this.gl.uniform4fv(this.program.color, [0, 1, 0, 1.0]);

        this.program.position = this.gl.getAttribLocation(this.program, "position");
        this.gl.enableVertexAttribArray(this.program.position);
        this.gl.vertexAttribPointer(this.program.position, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, vertices.length / 2)
    }
}

function getCode(path) {
    return new Promise(resolve => fetch(path).then(result => result.text()).then(src => resolve(src)));
}

function compileShader(gl, shaderSource, shaderType) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }

    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        throw ("program failed to link:" + gl.getProgramInfoLog (program));
    }

    return program;
};

customElements.define("crs-webgl", WebGL);