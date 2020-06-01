import "./crs-webgl-program.js";

class WebGL extends HTMLElement {
    connectedCallback() {
        this.programs = [];
        this.pixelRatio = window.devicePixelRatio || 1;
        this.mouse = {x: 0, y: 0};

        this._drawHandler = this._draw.bind(this);
        this._addProgramHandler = this._addProgram.bind(this);
        this._mouseMoveHander = this._mouseMove.bind(this);
        this._resizeHandler = this._resize.bind(this);

        window.addEventListener('resize', this._resizeHandler);

        this.programElements = this.querySelectorAll("crs-webgl-program");
        this.programElements.forEach(element => element.addEventListener("program-ready", this._addProgramHandler));

        this._initCanvas();
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this._resizeHandler);
        this.canvas.removeEventListener("mousemove", this._mouseMoveHander);

        this._drawHandler = null;
        this._addProgramHandler = null;
        this._mouseMoveHander = null;
        this._resizeHandler = null;
        this.canvas = null;
        this.gl = null;
    }

    _resize() {
        this.bounds = this.canvas.getBoundingClientRect();
    }

    _mouseMove(event) {
        this.mouse.x = (event.clientX - this.bounds.left) * this.pixelRatio;
        this.mouse.y = this.canvas.height - (event.clientY - this.bounds.top) * this.pixelRatio;
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

        requestAnimationFrame(() => {
            this._resize();
            this.canvas.addEventListener("mousemove", this._mouseMoveHander);
            this.gl = this.canvas.getContext("webgl");
            this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
            this._loadVBO();
        });
    }

    _loadVBO() {
        const file = `${this.getAttribute("vbo")}.js`;
        import(file).then(module => {
            this.vbo = module.default(this.gl);
            this.dispatchEvent(new CustomEvent("gl-ready", {detail: this.gl}));
        });
    }

    _draw(now) {
        requestAnimationFrame(this._drawHandler);

        now *= 0.001;
        const delta = now - this._lastTime;
        this._lastTime = now;

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        for (let program of this.programs) {
            this.gl.useProgram(program);

            program.u_color = this.gl.getUniformLocation(program, "u_color");
            this.gl.uniform4fv(program.u_color, [0, 1, 0, 1.0]);

            program.u_mouse = this.gl.getUniformLocation(program, "u_mouse");
            this.gl.uniform2fv(program.u_mouse, [this.mouse.x, this.mouse.y]);

            program.u_time = this.gl.getUniformLocation(program, "u_time");
            this.gl.uniform1f(program.u_time, now);

            program.u_delta = this.gl.getUniformLocation(program, "u_delta");
            this.gl.uniform1f(program.u_delta, delta);

            program.u_resolution = this.gl.getUniformLocation(program, "u_resolution");
            this.gl.uniform2fv(program.u_resolution, [this.canvas.width, this.canvas.height]);

            program.position = this.gl.getAttribLocation(program, "position");
            this.gl.enableVertexAttribArray(program.position);
            this.gl.vertexAttribPointer(program.position, 2, this.gl.FLOAT, false, 0, 0);
        }

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vbo.length)
    }
}

customElements.define("crs-webgl", WebGL);