const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let myColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;

socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('requestCanvas');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function draw(x0, y0, x1, y1, color, size) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
});


canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    const currentX = pos.x;
    const currentY = pos.y;
    
    // draw(lastX, lastY, currentX, currentY, myColor, -5);
    
    socket.emit('drawing', {
        x0: lastX,
        y0: lastY,
        x1: currentX,
        y1: currentY,
        color: myColor,
        size: 5
    });
    
    lastX = currentX;
    lastY = currentY;
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseout', () => {
    isDrawing = false;
});

socket.on('canvasState', (lines) => {
    console.log('Received canvas state');
    lines.forEach(line => {
        draw(line.x0, line.y0, line.x1, line.y1, line.color, line.size);
    });
});

socket.on('drawing', (data) => {
    console.log('Received drawing data:', data);
    draw(data.x0, data.y0, data.x1, data.y1, data.color, data.size);
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
