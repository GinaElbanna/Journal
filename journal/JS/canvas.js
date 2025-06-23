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
    if (canvas.dataset.initialized) return;
    canvas.dataset.initialized = 'true';

    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Activate and draw on mousedown (desktop)
    canvas.addEventListener('mousedown', (e) => {
        if (!isDrawingMode || draggedSticker) return;

        document.querySelectorAll('canvas').forEach(c => c.classList.remove('active-canvas'));
        canvas.classList.add('active-canvas');
        activeCanvas = canvas;
        activeContext = ctx;

        isPainting = true;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isPainting || !isDrawingMode || activeCanvas !== canvas) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : strokeColor;
        ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
        ctx.stroke();
    });

    canvas.addEventListener('mouseup', () => {
        isPainting = false;
        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-over';
    });

    // Activate and draw on touchstart (mobile/tablet)
    canvas.addEventListener('touchstart', (e) => {
        if (!isDrawingMode || draggedSticker) return;

        document.querySelectorAll('canvas').forEach(c => c.classList.remove('active-canvas'));
        canvas.classList.add('active-canvas');
        activeCanvas = canvas;
        activeContext = canvas.getContext('2d');

        isPainting = true;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        activeContext.beginPath();
        activeContext.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
        e.preventDefault();
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!isPainting || !isDrawingMode || activeCanvas !== canvas) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        activeContext.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        activeContext.lineWidth = lineWidth;
        activeContext.lineCap = 'round';
        activeContext.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : strokeColor;
        activeContext.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
        activeContext.stroke();
        e.preventDefault();
    });

    canvas.addEventListener('touchend', (e) => {
        isPainting = false;
        if (activeContext) {
            activeContext.beginPath();
            activeContext.globalCompositeOperation = 'source-over';
        }
        e.preventDefault();
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
            draggedSticker = null;
        };
    });

    if (!activeCanvas) {
        activeCanvas = canvas;
        activeContext = ctx;
        canvas.classList.add('active-canvas');
    }
}

// Image upload
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

// Toolbar controls
toolbar.addEventListener('change', (e) => {
    if (e.target.id === 'stroke') strokeColor = e.target.value;
    if (e.target.id === 'lineWidth') lineWidth = parseInt(e.target.value, 10);
});

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
            if (!confirm("Do you want to save this page as an image?")) return;
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

// Drawing mode toggle
drawingModeButton.addEventListener('click', () => {
    isDrawingMode = !isDrawingMode;
    drawingModeButton.textContent = isDrawingMode ? 'Enter Read Mode' : 'Enter Write Mode';
});

// Sticker drag tracking
let draggedSticker = null;
document.querySelectorAll('.sticker-thumb').forEach(sticker => {
    sticker.addEventListener('dragstart', () => draggedSticker = sticker);
    sticker.addEventListener('dragend', () => draggedSticker = null);
});
document.addEventListener('mouseup', () => {
    draggedSticker = null;
});

// Flipbook page setup
document.addEventListener('DOMContentLoaded', () => {
    const $flipbook = $(".flipbook");

    function bindFlipbookTurnEvent() {
        if (!$flipbook.data('turn')) {
            return setTimeout(bindFlipbookTurnEvent, 50);
        }

        $flipbook.bind("turned", function () {
            setTimeout(() => {
                document.querySelectorAll('canvas').forEach(setupCanvas);
            }, 100); // Give the flipbook time to render new pages
        });
    }

    bindFlipbookTurnEvent();

    // Initialize canvases on load
    document.querySelectorAll('canvas').forEach(setupCanvas);
});
