class Program extends HTMLElement {
    connectedCallback() {
        this._createProgramHandler = this._createProgram.bind(this);
        this.parentElement.addEventListener("gl-ready", this._createProgramHandler);
    }

    _createProgram(event) {
        const gl = event.detail;
        this.parentElement.removeEventListener("gl-ready", this._createProgramHandler);
        this._createProgramHandler = null;

        const vertAttr = this.getAttribute("vertex-shader");
        const fragAttr = this.getAttribute("fragment-shader");

        let vertShader;
        let fragShader;

        Promise.all([
            getCode(vertAttr).then(src => vertShader = compileShader(gl, src, gl.VERTEX_SHADER)),
            getCode(fragAttr).then(src => fragShader = compileShader(gl, src, gl.FRAGMENT_SHADER))
        ]).then(() => {
            const program = createProgram(gl, vertShader, fragShader);
            this.dispatchEvent(new CustomEvent("program-ready", {detail: program}));
        })
    }
}

function getCode(path) {
    return new Promise(resolve => fetch(path).then(result => result.text()).then(src => resolve(src)));
};

function compileShader(gl, shaderSource, shaderType) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }

    return shader;
};

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

customElements.define("crs-webgl-program", Program);