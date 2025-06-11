const canvases = document.querySelectorAll('canvas');
const fabricCanvases = [];
let activeFabricCanvas = null;
const toolbar = document.getElementById('toolbar');

// Set up Fabric.js on all canvases
canvases.forEach((canvas) => {
    const fabricCanvas = new fabric.Canvas(canvas);
    fabricCanvas.setWidth(400);
    fabricCanvas.setHeight(500);
    fabricCanvas.isDrawingMode = true;
    fabricCanvas.freeDrawingBrush.width = 5;
    fabricCanvas.freeDrawingBrush.color = '#000000';

    // Add click listener to track active canvas
    fabricCanvas.on('mouse:down', () => {
        setActiveCanvas(fabricCanvas, canvas);
    });

    fabricCanvases.push(fabricCanvas);
});

// Set the active canvas and update visuals
function setActiveCanvas(fabricCanvas, domCanvas) {
    activeFabricCanvas = fabricCanvas;

    // Remove active border from all canvases
    canvases.forEach(c => c.classList.remove('active-canvas'));

    // Add border to selected one
    domCanvas.classList.add('active-canvas');
}

// Change brush color or size
toolbar.addEventListener('change', (e) => {
    if (!activeFabricCanvas) return;

    if (e.target.id === 'stroke') {
        activeFabricCanvas.freeDrawingBrush.color = e.target.value;
    }

    if (e.target.id === 'lineWidth') {
        activeFabricCanvas.freeDrawingBrush.width = parseInt(e.target.value, 10);
    }
});

// Clear button: only clear the active canvas
toolbar.addEventListener('click', (e) => {
    if (e.target.id === 'clear') {
        if (activeFabricCanvas) {
            activeFabricCanvas.clear();
            activeFabricCanvas.isDrawingMode = true;
        }
    }
});

// Upload image to the active canvas
document.getElementById('imageUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !activeFabricCanvas) return;

    const reader = new FileReader();

    reader.onload = function (f) {
        const dataUrl = f.target.result;

        fabric.Image.fromURL(dataUrl, function (img) {
            img.set({
                left: 100,
                top: 100,
                scaleX: 0.5,
                scaleY: 0.5,
                selectable: true
            });

            activeFabricCanvas.add(img);
            activeFabricCanvas.setActiveObject(img);
            activeFabricCanvas.renderAll();
        });
    };

    reader.readAsDataURL(file);
});
