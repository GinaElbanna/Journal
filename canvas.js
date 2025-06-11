const canvases = document.querySelectorAll('canvas');
const toolbar = document.getElementById('toolbar');

// ✅ This block goes OUTSIDE the loop
document.getElementById('imageUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        const currentPageNum = $(".flipbook").turn("page");
        const flipbookPages = document.querySelectorAll('.flipbook > div');
        const currentPageDiv = flipbookPages[currentPageNum - 1];
        if (!currentPageDiv) return;

        const canvas = currentPageDiv.querySelector('canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = URL.createObjectURL(file);
});


// 🎨 Drawing logic
canvases.forEach((canvas) => {
    const ctx = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 500;

    let isPainting = false;
    let lineWidth = 5;
    let startX;
    let startY;

    toolbar.addEventListener('click', e => {
        if (e.target.id === 'clear') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    toolbar.addEventListener('change', e => {
        if (e.target.id === 'stroke') {
            ctx.strokeStyle = e.target.value;
        }

        if (e.target.id === 'lineWidth') {
            lineWidth = e.target.value;
        }
    });

    const draw = (e) => {
        if (!isPainting) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    canvas.addEventListener('mousedown', (e) => {
        isPainting = true;
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    });

    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('mouseup', () => {
        isPainting = false;
        ctx.stroke();
        ctx.beginPath();
    });
});
