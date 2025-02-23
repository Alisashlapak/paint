const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const brushSize = document.getElementById('brush-size');
const colorPicker = document.getElementById('color-picker');
const clearAll = document.getElementById('clear');
const save = document.getElementById('save');
const undo = document.getElementById('undo');
const redo = document.getElementById('redo');
const circleBtn = document.getElementById('circle');
const triangleBtn = document.getElementById('triangle');
const rectangleBtn = document.getElementById('rectangle');
const diamondBtn = document.getElementById('diamond');
const fill = document.getElementById('fill');
const bgColor = document.getElementById('back');
const modes = ['brush', 'circle', 'triangle', 'rectangle', 'diamond'];

let mode = 'brush';
let isDrawing = false;
let history = [];
let redoStack = [];
let shapes = [];
let isFillEnabled = false;
let fillColor = null;
let brushes = [];

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
}

function draw(e) {
    if (!isDrawing || mode !== 'brush') return;
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = parseInt(brushSize.value, 10);
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
}

function endPosition() {
    if (!isDrawing) return;
    isDrawing = false;
    saveState();
}

// Додаємо слухачі для пензля
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endPosition);

// ✍️ Перемикання інструментів
document.getElementById('pen').onclick = () => {
    mode = 'brush';
    ctx.globalCompositeOperation = 'source-over';
};

document.getElementById('eraser').onclick = () => {
    mode = 'brush';
    ctx.globalCompositeOperation = 'destination-out';
};

circleBtn.onclick = () => mode = 'circle';
triangleBtn.onclick = () => mode = 'triangle';
rectangleBtn.onclick = () => mode = 'rectangle';
diamondBtn.onclick = () => mode = 'diamond';

fill.onclick = () => {
    isFillEnabled = !isFillEnabled;
    fillColor = isFillEnabled ? colorPicker.value : null;
};

bgColor.onclick = () => canvas.style.backgroundColor = colorPicker.value;

// 🔵 Малювання фігур
let startX, startY, currentX, currentY;
let shiftPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') shiftPressed = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') shiftPressed = false;
});

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

    let width = currentX - startX;
    let height = currentY - startY;

    if (shiftPressed) {
        let size = Math.max(Math.abs(width), Math.abs(height));
        width = width < 0 ? -size : size;
        height = height < 0 ? -size : size;
    }

    ctx.beginPath();
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.fillStyle = isFillEnabled ? colorPicker.value : "transparent";

    if (mode === 'circle') {
        ctx.ellipse(startX + width / 2, startY + height / 2, Math.abs(width) / 2, Math.abs(height) / 2, 0, 0, 2 * Math.PI);
    } else if (mode === 'triangle') {
        ctx.moveTo(startX + width / 2, startY);
        ctx.lineTo(startX, startY + height);
        ctx.lineTo(startX + width, startY + height);
        ctx.closePath();
    } else if (mode === 'rectangle') {
        ctx.rect(startX, startY, width, height);
    } else if (mode === 'diamond') {
        ctx.moveTo(startX + width / 2, startY);
        ctx.lineTo(startX, startY + height / 2);
        ctx.lineTo(startX + width / 2, startY + height);
        ctx.lineTo(startX + width, startY + height / 2);
        ctx.closePath();
    }

    if (isFillEnabled) ctx.fill();
    ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
    if (!modes.includes(mode)) return;
    isDrawing = false;
    brushes.push({
        x: startX,
        y: startY,
        width: currentX - startX,
        height: currentY - startY,
        type: mode,
        strokeColor: ctx.strokeStyle,
        lineWidth: ctx.lineWidth
    })
    shapes.push({
        x: startX,
        y: startY,
        width: currentX - startX,
        height: currentY - startY,
        type: mode,
        strokeColor: ctx.strokeStyle,
        lineWidth: ctx.lineWidth,
        fillColor: isFillEnabled ? colorPicker.value : null
    });

    saveState();
});

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Спочатку малюємо всі фігури
    shapes.forEach((shape) => {
        ctx.beginPath();
        ctx.strokeStyle = shape.strokeColor;
        ctx.lineWidth = shape.lineWidth;
        ctx.fillStyle = shape.fillColor || "transparent";

        let { x, y, width, height, type } = shape;

        if (type === 'circle') {
            ctx.ellipse(x + width / 2, y + height / 2, Math.abs(width) / 2, Math.abs(height) / 2, 0, 0, 2 * Math.PI);
        } else if (type === 'triangle') {
            ctx.moveTo(x + width / 2, y);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x + width, y + height);
            ctx.closePath();
        } else if (type === 'rectangle') {
            ctx.rect(x, y, width, height);
        } else if (type === 'diamond') {
            ctx.moveTo(x + width / 2, y);
            ctx.lineTo(x, y + height / 2);
            ctx.lineTo(x + width / 2, y + height);
            ctx.lineTo(x + width, y + height / 2);
            ctx.closePath();
        }

        if (shape.fillColor) ctx.fill();
        ctx.stroke();
    });

    // Тепер малюємо всі пензлі
    brushes.forEach((brush) => {
        if (mode ==='brush'){
        ctx.beginPath();
        ctx.strokeStyle = brush.strokeColor;
        ctx.lineWidth = brush.lineWidth;
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
}});
}
function saveState() {
    history.push(JSON.stringify(shapes));
    redoStack = [];
    history.push(JSON.stringify(brushes));
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
