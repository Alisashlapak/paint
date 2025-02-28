const canvas = document.getElementById('canvas');
const colorPicker = document.getElementById('color-picker');
const modes = document.getElementById('modes');
const [undo, redo] = [document.getElementById('undo'), document.getElementById('redo')];
const fill = document.getElementById('fill')
const strokeSize = document.getElementById('brush-size');
const strokeSizeLabel = document.getElementById('brush-size-label');
const bgColor = document.getElementById('bg');
const fillCheckbox = document.getElementById('fill-checkbox');
const savePic = document.getElementById('save');
const clear = document.getElementById('clear');

canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight * 0.85;

const context = new CanvasContext(canvas);

context.state = context.canvas.toDataURL();

canvas.onmouseenter = () => {
    canvas.onmousedown = (e) => {

        context.isDrawing = true;

        const rect = context.canvas.getBoundingClientRect();
        context.metadata = {
            startX: e.clientX - rect.left,
            startY: e.clientY - rect.top
        }

        if (context.currentMode == "brush" || context.currentMode == "eraser") context.ctx.beginPath();

        const image = new Image();
        image.src = context.state;
        canvas.onmousemove = (e) => {
            image.onload = () => {
                if (context.state) {
                    context.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    context.ctx.drawImage(image, 0, 0)
                }
            }
            context.draw(e)
        }
        if (context.currentMode == "brush" || context.currentMode == "eraser") context.ctx.closePath();
    };
    canvas.onmouseup = () => {
        context.state = context.canvas.toDataURL();
        context.isDrawing = false
    };
}

colorPicker.oninput = ({
    target
}) => {
    context.currentColor = target.value;
}

modes.onchange = () => context.currentMode = modes.value;

const Undo = () => {
    context.undo();
    const image = new Image();
    image.src = context.state;
    image.onload = () => {
        if (context.state) {
            context.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            context.ctx.drawImage(image, 0, 0)
        }
    }
}
const Redo = () => {
    context.redo();
    const image = new Image();
    image.src = context.state;
    image.onload = () => {
        if (context.state) {
            context.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            context.ctx.drawImage(image, 0, 0)
        }
    }
}
const clearAll = () => {
    context.ctx.clearRect(0, 0, canvas.width, canvas.height);
    context.state = canvas.toDataURL(); 
};

const saveToFile = () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL("image/png"); 
    link.download = "drawing.png"; 
    link.click(); 
};


strokeSize.oninput = ({
    target
}) => {
    const value = +target.value
    context.strokeWidth = value;
    strokeSizeLabel.innerText = `${value}`;
}

fillCheckbox.onchange = () => {
    context.fill = fillCheckbox.checked;
    if (context.fill) {
        context.ctx.fillStyle = context.currentColor;
    } else {
        context.ctx.fillStyle = "transparent";
    }
};
bgColor.onclick = () => {
    canvas.style.backgroundColor = context.currentColor;
}

undo.onclick = Undo;
redo.onclick = Redo;
clear.onclick = clearAll;
savePic.onclick = saveToFile;