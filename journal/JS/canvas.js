const canvases = document.querySelectorAll('canvas');
const toolbar = document.getElementById('left-toolbar');
const drawingModeButton = document.getElementById('drawing-mode');
const imageUploadInput = document.getElementById('imageUpload');

let activeCanvas = null;
let activeContext = null;
let isPainting = false;
let isErasing = false;
let isDrawingMode = false;

let lineWidth = parseInt(document.getElementById('lineWidth').value, 10) || 2;
let strokeColor = document.getElementById('stroke').value || '#000000';

// image manipulation stuff
let uploadedImage = null;
let imageX = 100;
let imageY = 100;
let imageScale = 1;
let imageAngle = 0;

let isDraggingImage = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

//undo related stuff ig
let restore_array = [];
let index = -1;

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

        if ( event.type != 'mouseout' )  {
            restore_array.push(ctx.getImageData(0, 0, activeCanvas.width, activeCanvas.height));
            index += 1;
        }
            console.log(restore_array);
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
    // Image drag handling
    canvas.addEventListener('mousedown', (e) => {
        if (!uploadedImage || draggedSticker) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const imgW = uploadedImage.width * imageScale;
        const imgH = uploadedImage.height * imageScale;

        if (
            x >= imageX && x <= imageX + imgW &&
            y >= imageY && y <= imageY + imgH
        ) {
            isDraggingImage = true;
            dragOffsetX = x - imageX;
            dragOffsetY = y - imageY;
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDraggingImage || !uploadedImage) return;

        const rect = canvas.getBoundingClientRect();
        imageX = e.clientX - rect.left - dragOffsetX;
        imageY = e.clientY - rect.top - dragOffsetY;
        drawCanvasWithImage(activeContext);
    });

    canvas.addEventListener('mouseup', () => {
        isDraggingImage = false;
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

function drawCanvasWithImage(ctx) {
    ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);

    if (uploadedImage) {
        const centerX = imageX + (uploadedImage.width * imageScale) / 2;
        const centerY = imageY + (uploadedImage.height * imageScale) / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(imageAngle * Math.PI / 180);
        ctx.drawImage(
            uploadedImage,
            -uploadedImage.width * imageScale / 2,
            -uploadedImage.height * imageScale / 2,
            uploadedImage.width * imageScale,
            uploadedImage.height * imageScale
        );
        ctx.restore();
    }
}



// Image upload
imageUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !activeCanvas) return;

    const img = new Image();
    img.onload = () => {
        uploadedImage = img;
        imageX = 100;
        imageY = 100;
        imageScale = 1;
        imageAngle = 0;
        drawCanvasWithImage(activeContext);
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
            restore_array = [];
            index = -1;
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



//undo
document.getElementById('undo').addEventListener('click', () => {
    if ( index <= 0 ) {
       //activate clear case or otherwise call clear function if it existed
    }else {
        index -= 1;
        restore_array.pop();
        activeContext.putImageData(restore_array[index], 0, 0);
    }
});



// Drawing mode toggle
drawingModeButton.addEventListener('click', () => {
    isDrawingMode = !isDrawingMode;
    drawingModeButton.textContent = isDrawingMode ? 'Enter Read Mode' : 'Enter Write Mode';

    const $flipbook = $(".flipbook");
    if (isDrawingMode) {
        $flipbook.turn("disable", true);
        $flipbook.addClass("turnjs-disabled");
    } else {
        $flipbook.turn("disable", false);
        $flipbook.removeClass("turnjs-disabled");
    }
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

    $flipbook.turn(); // <-- MOVE THIS HERE, so it's before you bind the event

    $flipbook.on("turning", function (e) {
        if (isDrawingMode) {
            e.preventDefault();
            alert("You must exit Drawing Mode before turning the page.");
        }
    });

    $flipbook.on("turned", function () {
        document.querySelectorAll('canvas').forEach(setupCanvas);
    });



    // Initialize canvases on load
    document.querySelectorAll('canvas').forEach(setupCanvas);
});

document.getElementById('scaleSlider').addEventListener('input', (e) => {
    imageScale = parseFloat(e.target.value);
    drawCanvasWithImage(activeContext);
});

document.getElementById('rotateSlider').addEventListener('input', (e) => {
    imageAngle = parseFloat(e.target.value);
    drawCanvasWithImage(activeContext);
});
