const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const brushSize = document.getElementById('brush-size');
const colorPicker = document.getElementById('color-picker');
const clearAll = document.getElementById('clear');
const save = document.getElementById('save');
const undo = document.getElementById('undo');
const redo = document.getElementById('redo');
const circleBtn = document.getElementById('circle'); // виправлено ID
const triangleBtn = document.getElementById('triangle');
const rectangleBtn = document.getElementById('rectangle');
const diamondBtn = document.getElementById('diamond');

let mode = 'brush';
let isDrawing = false;
let history = [];
let redoStack = [];
let shapes = [];

canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight * 0.85;
ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';

// 🎨 Функція для малювання пензлем
function startPosition(e) {
    if (mode !== 'brush') return;
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    saveState();
}

function draw(e) {
    if (!isDrawing || mode !== 'brush') return;
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = parseInt(brushSize.value, 10);
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
}

function endPosition() {
    isDrawing = false;
    saveState();
}

// Додаємо слухачі для пензля
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endPosition);

// 🖌 Налаштування пензля
brushSize.addEventListener('input', () => {
    ctx.lineWidth = parseInt(brushSize.value, 10);
    updateBrushSizeLabel(brushSize.value);
});

function updateBrushSizeLabel(size) {
    const brushSizeLabel = document.getElementById('brush-size-label');
    if (brushSizeLabel) {
        brushSizeLabel.textContent = `Thickness: ${size}`;
    }
}

// ✍️ Перемикання інструментів
document.getElementById('pen').onclick = () => {
    mode = 'brush';
    ctx.globalCompositeOperation = 'source-over';
};

document.getElementById('eraser').onclick = () => {
    mode = 'brush';
    ctx.globalCompositeOperation = 'destination-out';
};

circleBtn.onclick = () => {
    mode = 'circle';
};
triangleBtn.onclick = () => {
    mode = 'triangle';
}
rectangleBtn.onclick =() => {
    mode = 'rectangle';
}
diamondBtn.onclick =() =>{
    mode = 'diamond';
}
// 🔵 Малювання кіл та еліпсів
let startX, startY, currentX, currentY;
let shiftPressed = false;

// Відстеження клавіші Shift
document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') shiftPressed = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') shiftPressed = false;
});
const modes = ['circle', 'triangle', 'rectangle', 'diamond'];

canvas.addEventListener('mousedown', (e) => {
    if (!modes.includes(mode)) return;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDrawing = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing || !modes.includes(mode)) return;
    const rect = canvas.getBoundingClientRect();
    currentX = e.clientX - rect.left;
    currentY = e.clientY - rect.top;

    redrawCanvas();

    ctx.beginPath();
    let width = currentX - startX;
    let height = currentY - startY;

    if (shiftPressed) {
        let size = Math.max(Math.abs(width), Math.abs(height));
        width = width < 0 ? -size : size;
        height = height < 0 ? -size : size;
    }

    if (mode === 'circle') {
        ctx.ellipse(
            startX + width / 2,
            startY + height / 2,
            Math.abs(width) / 2,
            Math.abs(height) / 2,
            0,
            0,
            2 * Math.PI
        );
    } else if (mode === 'triangle') {
        ctx.moveTo(startX + width / 2, startY);
        ctx.lineTo(startX, startY + height);
        ctx.lineTo(startX + width, startY + height);
        ctx.closePath();
    } else if (mode === 'rectangle'){
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, startY+height);
        ctx.lineTo(startX+width, startY+height);
        ctx.lineTo(startX+width, startY);
        ctx.closePath();
    } else if (mode === 'diamond'){
        ctx.moveTo(startX + width / 2, startY);
        ctx.lineTo(startX, startY+height / 2);
        ctx.lineTo(startX + width / 2, startY+height);
        ctx.lineTo(startX+width, startY + height / 2)
        ctx.closePath()
    }

    ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
    if (!modes.includes(mode)) return;
    isDrawing = false;
    shapes.push({
        x: startX,
        y: startY,
        width: currentX - startX,
        height: currentY - startY,
        type: mode,
        color: ctx.strokeStyle,
        lineWidth: ctx.lineWidth,
    });
    saveState();
});

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
        ctx.beginPath();
        let { x, y, width, height, type, color, lineWidth } = shape;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        if (type === 'circle') {
            ctx.ellipse(
                x + width / 2,
                y + height / 2,
                Math.abs(width) / 2,
                Math.abs(height) / 2,
                0,
                0,
                2 * Math.PI
            );
        } else if (type === 'triangle') {
            ctx.moveTo(x + width / 2, y);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x + width, y + height);
            ctx.closePath();
        } else if (type === 'rectangle') {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x + width, y);
            ctx.closePath();
        } else if (type === 'diamond') {
            ctx.moveTo(x + width / 2, y);
            ctx.lineTo(x, y + height / 2);
            ctx.lineTo(x + width / 2, y + height);
            ctx.lineTo(x + width, y + height / 2);
            ctx.closePath();
        }

        ctx.stroke();
    });
}


// 🎨 Функція збереження стану
function saveState() {
    history.push(canvas.toDataURL());
    redoStack = [];
}

// 🖼 Збереження зображення
save.onclick = () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'drawing.png';
    link.click();
};

// 🔄 Очистити холст
clearAll.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes = [];
    saveState();
};

// ↩️ Undo
undo.onclick = () => {
    if (history.length > 0) {
        redoStack.push(canvas.toDataURL());
        let previousState = history.pop();
        let img = new Image();
        img.src = previousState;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
};

// ↪️ Redo
redo.onclick = () => {
    if (redoStack.length > 0) {
        let redoState = redoStack.pop();
        history.push(canvas.toDataURL());
        let img = new Image();
        img.src = redoState;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
};
