const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const brushSize = document.getElementById('brush-size');
const colorPicker = document.getElementById('color-picker');
const clearAll = document.getElementById('clear');
const save = document.getElementById('save');
 let isDrawing = false;

canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight * 0.85;
ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';

function startPosition(e){
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }


function endPosition(){
    isDrawing = false;
   } 

function draw(e){
    if (!isDrawing) return;
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = parseInt(brushSize.value, 10);
    ctx.lineTo(
        e.clientX - canvas.offsetLeft,
        e.clientY - canvas.offsetTop
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
        e.clientX - canvas.offsetLeft,
        e.clientY - canvas.offsetTop
    );
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);
clearAll.onclick=()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};
brushSize.addEventListener('input', () => {
    ctx.lineWidth = parseInt(brushSize.value, 10);
    updateBrushSizeLabel(brushSize.value);
});

function updateBrushSizeLabel (size){
    const brushSizeLabel = document.getElementById('brush-size-label');
    if (brushSizeLabel){
        brushSizeLabel.textContent = `Brush Size: ${size}`;
    }
}
const pen = document.getElementById('pen');
const eraser = document.getElementById('eraser');

function activatePen(){
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = colorPicker.value;
}

function activateEraser(){
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,0)';
}
pen.onclick = activatePen;

eraser.onclick = activateEraser;

save.onclick = () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL(); 
    link.download = 'drawing.png';
    link.click();
};