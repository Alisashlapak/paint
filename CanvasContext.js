/**
 * @typedef {'brush' | 'circle' | 'triangle' | 'rectangle' | 'diamond'} Mode
 */


class Stack {
  #states = [];
  #stateIndex = -1;
  #MAX_SIZE = 20;

  get size() {
    return this.#states.length;
  }

  set state(state) {
    if (this.#stateIndex + 1 != this.size) this.#states = this.#states.slice(0, this.#stateIndex + 1)
    if (this.size >= this.#MAX_SIZE) this.#states = [...this.#states.slice(1, this.size), state];
    else this.#states = [...this.#states, state];
    ++this.#stateIndex
  }

  get states() {
    return this.#states;
  }

  get state() {
    return this.#states[this.#stateIndex];
  }

  undo() {
    if (this.#stateIndex) --this.#stateIndex
    return this.state
  }

  redo() {
    if (this.#stateIndex < this.size - 1) ++this.#stateIndex
    return this.state
  }
}



class CanvasContext extends Stack {
  /**
   * 
   * @param {HTMLCanvasElement} canvas 
   */
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  #metadata = {
    startX: 0,
    startY: 0
  };

  /**
   * @type {{ [key in Mode]: (event: MouseEvent) => void }}
   */
  #modes = {
    brush: (event) => {
      this.ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
      this.ctx.stroke();

    },

    circle: (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      const startX = this.metadata.startX;
      const startY = this.metadata.startY;

      const width = currentX - startX;
      const height = currentY - startY;

      const image = new Image();
      image.src = this.state;
      image.onload = () => {
        if (context.state) {
          context.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          context.ctx.drawImage(image, 0, 0)
          this.ctx.beginPath();
          this.ctx.ellipse(startX + width / 2, startY + height / 2, Math.abs(width) / 2, Math.abs(height) / 2, 0, 0, 2 * Math.PI);
          this.ctx.closePath();
          this.ctx.stroke();
        }
      }
    },
    rectangle: (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      const startX = this.metadata.startX;
      const startY = this.metadata.startY;

      const width = currentX - startX;
      const height = currentY - startY;
      const image = new Image();
      image.src = this.state;
      image.onload = () => {
        if (context.state) {
          context.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          context.ctx.drawImage(image, 0, 0)
          this.ctx.beginPath();
          this.ctx.rect(startX, startY, width, height);
          this.ctx.closePath();
          this.ctx.stroke();
        }
      }

    },
    diamond: (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      const startX = this.metadata.startX;
      const startY = this.metadata.startY;

      const width = currentX - startX;
      const height = currentY - startY;
      const image = new Image();
      image.src = this.state;
      image.onload = () => {
        if (context.state) {
          context.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          context.ctx.drawImage(image, 0, 0)
          this.ctx.beginPath();
          this.ctx.moveTo(startX + width / 2, startY);
          this.ctx.lineTo(startX, startY + height / 2);
          this.ctx.lineTo(startX + width / 2, startY + height);
          this.ctx.lineTo(startX + width, startY + height / 2);
          this.ctx.closePath();
          this.ctx.stroke();

        }
      }
    },
    triangle: (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      const startX = this.metadata.startX;
      const startY = this.metadata.startY;

      const width = currentX - startX;
      const height = currentY - startY;

      const image = new Image();
      image.src = this.state;
      image.onload = () => {
        if (context.state) {
          context.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          context.ctx.drawImage(image, 0, 0)
        }
        this.ctx.beginPath();
        this.ctx.moveTo(startX + width / 2, startY);
        this.ctx.lineTo(startX, startY + height);
        this.ctx.lineTo(startX + width, startY + height);
        this.ctx.closePath();
        this.ctx.stroke();
      }
    }
  }

  set metadata(data) {
    this.#metadata = data;
  }

  get metadata() {
    return this.#metadata;
  }

  /**
   * @type {Mode}
   */
  #currentMode = "brush";

  /**
   * @type {string}
   */
  #currentColor = "#000000"

  /**
   * @type {number}
   */
  #strokeWidth = 1;

  /**
   * @type {boolean}
   */
  #fill = false;

  /**
   * @type {boolean}
   */
  #isDrawing = false;

  /**
   * @returns {{ [key: Mode]: (event: MouseEvent) => void }[]}
   */
  get modes() {
    return this.#modes;
  }

  /**
   * @returns {string}
   */
  get currentColor() {
    return this.#currentColor;
  }

  /**
   * @param {string} color;
   * @returns {void}
   */
  set currentColor(color) {
    this.#currentColor = color;
  }

  /**
   * @default brush
   * @returns {string}
   */
  get currentMode() {
    return this.#currentMode;
  }

  /**
   * @param {Mode} mode
   * @returns {void}
   */
  set currentMode(mode) {
    this.#currentMode = mode;
  }

  /**
   * @default false
   * @returns {boolean}
   */
  get fill() {
    return this.#fill;
  }

  /**
   * @returns {void}
   */
  set fill(fill) {
    this.#fill = fill;
  }


  /**
   * @returns {number}
   */
  get strokeWidth() {
    return this.#strokeWidth;
  }

  /**
   * @param {number} width
   * @returns {void}
   */
  set strokeWidth(width) {
    this.#strokeWidth = width;
  }

  /**
   * @default false
   * @returns {boolean}
   */
  get isDrawing() {
    return this.#isDrawing;
  }

  /**
   * @param {boolean} bool
   * @returns {void}
   */
  set isDrawing(bool) {
    this.#isDrawing = bool;
  }


  /**
   * for context drawing
   * @param {MouseEvent} event 
   * @returns {void}
   */
  draw(event) {
    if (!this.#isDrawing) return;

    this.ctx.strokeStyle = this.#currentColor;
    this.ctx.lineWidth = this.#strokeWidth;
    this.#modes[this.#currentMode](event)
  }
}