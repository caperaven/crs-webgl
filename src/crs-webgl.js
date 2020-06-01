import "./crs-webgl-program.js";

class WebGL extends HTMLElement {
    connectedCallback() {
        this.programs = [];

        this._addProgramHandler = this._addProgram.bind(this);

        this.programElements = this.querySelectorAll("crs-webgl-program");
        this.programElements.forEach(element => element.addEventListener("program-ready", this._addProgramHandler));

        this._initCanvas();
    }

    disconnectedCallback() {
        this.canvas = null;
        this.gl = null;
    }

    _addProgram(event) {
        this.programs.push(event.detail);

        if (this.programs.length == this.programElements.length) {
            this.programElements.forEach(element => {
                element.removeEventListener("program-ready", this._addProgramHandler);
                element.parentElement.removeChild(element)
            });

            delete this.programElements;
            this._draw();
        }
    }

    _initCanvas() {
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.appendChild(this.canvas);

        this.gl = this.canvas.getContext("webgl");
        this._loadVBO();
    }

    _loadVBO() {
        const file = `${this.getAttribute("vbo")}.js`;
        import(file).then(module => {
            this.vbo = module.default(this.gl);
            this.dispatchEvent(new CustomEvent("gl-ready", {detail: this.gl}));
        });
    }

    _draw() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        for (let program of this.programs) {
            this.gl.useProgram(program);

            program.color = this.gl.getUniformLocation(program, "color");
            this.gl.uniform4fv(program.color, [0, 1, 0, 1.0]);

            program.position = this.gl.getAttribLocation(program, "position");
            this.gl.enableVertexAttribArray(program.position);
            this.gl.vertexAttribPointer(program.position, 2, this.gl.FLOAT, false, 0, 0);
        }

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vbo.length)
    }
}

customElements.define("crs-webgl", WebGL);