// Initialize canvas with panning capability
const canvas = new fabric.Canvas('canvas', {
    width: window.innerWidth - 40, // Adjust for padding
    height: window.innerHeight - 100, // Adjust for toolbar and padding
    backgroundColor: 'white',
    isDrawingMode: false,
    selection: true
});

// Tool state
let currentMode = 'select';
let isDrawing = false;
let startPoint = null;
let strokeColor = '#333333';
let fillColor = '#ffffff';
let isPanning = false;
let lastPosX;
let lastPosY;

// Configure drawing brush
canvas.freeDrawingBrush.width = 2;
canvas.freeDrawingBrush.color = strokeColor;

// Infinite canvas functionality
canvas.on('mouse:wheel', function(opt) {
    if (!opt.e.ctrlKey) {
        // Pan when not holding ctrl
        const delta = opt.e.deltaY;
        const zoom = canvas.getZoom();
        let newZoom = zoom;
        
        if (zoom > 0.1 || delta < 0) {
            newZoom = zoom * 0.999 ** delta;
            if (newZoom > 20) newZoom = 20;
            if (newZoom < 0.1) newZoom = 0.1;
            
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
        }
        
        opt.e.preventDefault();
        opt.e.stopPropagation();
    } else {
        // Zoom when holding ctrl
        const delta = opt.e.deltaY;
        const zoom = canvas.getZoom();
        let newZoom = zoom;
        
        if (zoom > 0.1 || delta < 0) {
            newZoom = zoom * 0.95 ** (delta / 100);
            if (newZoom > 20) newZoom = 20;
            if (newZoom < 0.1) newZoom = 0.1;
            
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
        }
        
        opt.e.preventDefault();
        opt.e.stopPropagation();
    }
});

// Enable panning when space is held or middle mouse button is pressed
let spacePressed = false;
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        spacePressed = true;
        canvas.defaultCursor = 'grab';
    }
});

document.addEventListener('keyup', function(e) {
    if (e.code === 'Space') {
        spacePressed = false;
        canvas.defaultCursor = 'default';
    }
});

canvas.on('mouse:down', function(opt) {
    if (spacePressed || opt.e.button === 1) { // middle mouse button
        isPanning = true;
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
        canvas.defaultCursor = 'grabbing';
    }
});

canvas.on('mouse:move', function(opt) {
    if (isPanning) {
        const e = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        canvas.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
    }
});

canvas.on('mouse:up', function() {
    isPanning = false;
    canvas.defaultCursor = spacePressed ? 'grab' : 'default';
});

// Make canvas responsive
window.addEventListener('resize', () => {
    canvas.setDimensions({
        width: window.innerWidth - 40,
        height: window.innerHeight - 100
    });
});

// Set initial mode
setMode('select');