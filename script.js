const canvas = document.getElementsByName('canvas');
const ctx = canvas.getContext('2d');

const brushSize = document.getElementById('brush-size');
const colorPicker = document.getElementById('color-picker');
const clearAll = document.getElementById('clear');
 let isDrawing = false;

canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight * 0.85;
ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';

function startPosition(e){
    isDrawing = true;
    draw(e);
}

function endPosition(){
    isDrawing = false;
    ctx.beingPath();
}

function draw(e){
    if (!isDrawing) return;
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineTo(
        e.clientX - canvas.offsetLeft,
        e.clientY - canvas.offsetTop
    );
}