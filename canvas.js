const canvas = document.getElementById('page');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');

const getCanvasOffset = () => canvas.getBoundingClientRect();
const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = 400;
canvas.height = 500;

let isPainting = false;
let lineWidth = 5;
let startX;
let startY;

toolbar.addEventListener('click', e =>{
    if(e.target.id === 'clear'){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

toolbar.addEventListener('change', e =>{
    if(e.target.id === 'stroke') {
        ctx.strokeStyle = e.target.value;
    }

    if(e.target.id === 'lineWidth') {
        lineWidth = e.target.value;
    }

});

const draw = (e) => {
    if (!isPainting) return;

    const { left, top } = getCanvasOffset();

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - left, e.clientY - top);
    ctx.stroke();
};

canvas.addEventListener('mousedown', (e) => {
    isPainting = true;
    const { left, top } = getCanvasOffset();
    startX = e.clientX - left;
    startY = e.clientY - top;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
});

canvas.addEventListener('mouseup', e => {
    isPainting = false;
    ctx.stroke();
    ctx.beginPath();
});

canvas.addEventListener('mousemove', draw);



document.getElementById('imageUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = URL.createObjectURL(file);
});

