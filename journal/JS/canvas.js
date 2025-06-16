const canvases = document.querySelectorAll('canvas');
const toolbar = document.getElementById('toolbar');
const drawingModeButton = document.getElementById('drawing-mode');
const imageUploadInput = document.getElementById('imageUpload');

let activeCanvas = null;
let activeContext = null;
let isPainting = false;
let isErasing = false;
let isDrawingMode = true;

let lineWidth = parseInt(document.getElementById('lineWidth').value, 10) || 2;
let strokeColor = document.getElementById('stroke').value || '#000000';

function setupCanvas(canvas) {
    // Avoid setting up the same canvas twice
    if (canvas.dataset.initialized) return;
    canvas.dataset.initialized = 'true';

    // Set size
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Start drawing
    canvas.addEventListener('mousedown', (e) => {
        console.log('draggedSticker:', draggedSticker?.src);

    // Always select this canvas
    document.querySelectorAll('canvas').forEach(c => c.classList.remove('active-canvas'));
    canvas.classList.add('active-canvas');
    activeCanvas = canvas;
    activeContext = ctx;

    // If we're in drawing mode, start drawing
// Only draw if in draw mode and not dragging something
    if (!isDrawingMode || draggedSticker) return;
        isPainting = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });

    // Draw
    canvas.addEventListener('mousemove', (e) => {
        if (!isPainting || !isDrawingMode) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);

        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : strokeColor;
        ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
        ctx.stroke();
    });

    // Stop drawing
    canvas.addEventListener('mouseup', () => {
        isPainting = false;
        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-over';
    });

    // Sticker drop
    canvas.addEventListener('dragover', (e) => e.preventDefault());
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!draggedSticker) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const img = new Image();
        img.src = draggedSticker.src;
        img.onload = () => {
            ctx.drawImage(img, x - 20, y - 20, 40, 40);
            draggedSticker = null; // prevent accidental reuse
        };

    });

    // Set the first canvas as active by default
    if (!activeCanvas) {
        activeCanvas = canvas;
        activeContext = ctx;
        canvas.classList.add('active-canvas');
    }
}


// Upload image to flipbook canvas (used on load)
imageUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !activeCanvas) return;

    const img = new Image();
    img.onload = () => {
        const ctx = activeCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, activeCanvas.width, activeCanvas.height);
    };
    img.src = URL.createObjectURL(file);
});


document.querySelectorAll('canvas').forEach(setupCanvas);


// Toolbar change handlers
toolbar.addEventListener('change', (e) => {
    if (e.target.id === 'stroke') {
        strokeColor = e.target.value;
    }
    if (e.target.id === 'lineWidth') {
        lineWidth = parseInt(e.target.value, 10);
    }
});

// Toolbar click handlers
toolbar.addEventListener('click', (e) => {
    if (!activeContext) return;

    switch (e.target.id) {
        case 'clear':
            activeContext.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
            break;
        case 'draw':
            isErasing = false;
            break;
        case 'erase':
            isErasing = true;
            break;
      case 'save':
        const confirmSave = confirm("Do you want to save this page as an image?");
        if (!confirmSave) return;

        const dataURL = activeCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'canvas-export.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break; 
    }
});

// Read/write mode toggle
drawingModeButton.addEventListener('click', () => {
    isDrawingMode = !isDrawingMode;
    drawingModeButton.textContent = isDrawingMode ? 'Enter Read Mode' : 'Enter Write Mode';
});
let draggedSticker = null;

document.querySelectorAll('.sticker-thumb').forEach(sticker => {
    sticker.addEventListener('dragstart', (e) => {
        draggedSticker = sticker;
    });
    sticker.addEventListener('dragend', () => {
        draggedSticker = null;
    });
});

document.addEventListener('mouseup', () => {
    draggedSticker = null;
});
