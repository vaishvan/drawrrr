document.getElementById('stroke-color').addEventListener('input', (e) => {
    strokeColor = e.target.value;
    canvas.freeDrawingBrush.color = strokeColor;
    if (canvas.getActiveObject()) {
        canvas.getActiveObject().set('stroke', strokeColor);
        canvas.renderAll();
    }
});

document.getElementById('fill-color').addEventListener('input', (e) => {
    fillColor = e.target.value;
    if (canvas.getActiveObject()) {
        canvas.getActiveObject().set('fill', fillColor);
        canvas.renderAll();
    }
});

document.getElementById('export').addEventListener('click', () => {
    const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
    });
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'drawing.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

document.getElementById('import').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const fabricImage = new fabric.Image(img);
                
                canvas.clear();
                
                const scale = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height
                );
                
                fabricImage.scale(scale);
                
                fabricImage.set({
                    left: (canvas.width - img.width * scale) / 2,
                    top: (canvas.height - img.height * scale) / 2
                });
                
                canvas.add(fabricImage);
                canvas.renderAll();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('select').addEventListener('click', () => {
    setMode('select');
    canvas.isDrawingMode = false;
    canvas.selection = true;
});

document.getElementById('draw').addEventListener('click', () => {
    setMode('draw');
    canvas.isDrawingMode = true;
    canvas.selection = false;
});

document.getElementById('rectangle').addEventListener('click', () => {
    setMode('rectangle');
    canvas.isDrawingMode = false;
    canvas.selection = false;
});

document.getElementById('circle').addEventListener('click', () => {
    setMode('circle');
    canvas.isDrawingMode = false;
    canvas.selection = false;
});

document.getElementById('arrow').addEventListener('click', () => {
    setMode('arrow');
    canvas.isDrawingMode = false;
    canvas.selection = false;
});

document.getElementById('text').addEventListener('click', () => {
    setMode('text');
    canvas.isDrawingMode = false;
    canvas.selection = false;
    addText();
});

document.getElementById('clear').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
        canvas.clear();
        canvas.setBackgroundColor('white', canvas.renderAll.bind(canvas));
    }
});

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.toolbar button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(mode).classList.add('active');
}

function addText() {
    const text = new fabric.IText('Type here', {
        left: 100,
        top: 100,
        fontFamily: 'sans-serif',
        fontSize: 20,
        fill: strokeColor,
        selectable: true,
        cornerSize: 8,
        transparentCorners: false
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    setMode('select');
}
