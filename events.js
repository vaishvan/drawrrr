canvas.on('mouse:down', (options) => {
    if (currentMode === 'select' || isPanning || spacePressed) return;
    
    isDrawing = true;
    const pointer = canvas.getPointer(options.e);
    startPoint = pointer;

    if (currentMode === 'text') {
        addText();
    }
});

canvas.on('mouse:move', (options) => {
    if (!isDrawing) return;

    const pointer = canvas.getPointer(options.e);

    if (currentMode === 'rectangle') {
        canvas.getObjects().forEach(obj => {
            if (obj.tempShape) canvas.remove(obj);
        });

        const rect = new fabric.Rect({
            left: Math.min(startPoint.x, pointer.x),
            top: Math.min(startPoint.y, pointer.y),
            width: Math.abs(pointer.x - startPoint.x),
            height: Math.abs(pointer.y - startPoint.y),
            stroke: strokeColor,
            strokeWidth: 2,
            fill: fillColor,
            cornerSize: 8,
            transparentCorners: false,
            tempShape: true
        });
        canvas.add(rect);
    }

    if (currentMode === 'circle') {
        canvas.getObjects().forEach(obj => {
            if (obj.tempShape) canvas.remove(obj);
        });

        const radius = Math.sqrt(
            Math.pow(pointer.x - startPoint.x, 2) + 
            Math.pow(pointer.y - startPoint.y, 2)
        );
        const circle = new fabric.Circle({
            left: startPoint.x - radius,
            top: startPoint.y - radius,
            radius: radius,
            stroke: strokeColor,
            strokeWidth: 2,
            fill: fillColor,
            cornerSize: 8,
            transparentCorners: false,
            tempShape: true
        });
        canvas.add(circle);
    }

    if (currentMode === 'arrow') {
        canvas.getObjects().forEach(obj => {
            if (obj.tempShape) canvas.remove(obj);
        });

        const angle = Math.atan2(pointer.y - startPoint.y, pointer.x - startPoint.x);
        const headLength = 20;

        const line = new fabric.Line([
            startPoint.x,
            startPoint.y,
            pointer.x,
            pointer.y
        ], {
            stroke: strokeColor,
            strokeWidth: 2,
            tempShape: true
        });

        const head1 = new fabric.Line([
            pointer.x,
            pointer.y,
            pointer.x - headLength * Math.cos(angle - Math.PI/6),
            pointer.y - headLength * Math.sin(angle - Math.PI/6)
        ], {
            stroke: strokeColor,
            strokeWidth: 2,
            tempShape: true
        });

        const head2 = new fabric.Line([
            pointer.x,
            pointer.y,
            pointer.x - headLength * Math.cos(angle + Math.PI/6),
            pointer.y - headLength * Math.sin(angle + Math.PI/6)
        ], {
            stroke: strokeColor,
            strokeWidth: 2,
            tempShape: true
        });

        canvas.add(line, head1, head2);
    }

    canvas.renderAll();
});

canvas.on('mouse:up', (options) => {
    if (!isDrawing) return;
    isDrawing = false;

    if (currentMode === 'rectangle') {
        const objects = canvas.getObjects();
        const lastObj = objects.find(obj => obj.tempShape === true);
        
        if (lastObj) {
            const rect = new fabric.Rect({
                left: lastObj.left,
                top: lastObj.top,
                width: lastObj.width,
                height: lastObj.height,
                stroke: strokeColor,
                strokeWidth: 2,
                fill: fillColor,
                cornerSize: 8,
                transparentCorners: false,
                selectable: true
            });
            canvas.remove(lastObj);
            canvas.add(rect);
            canvas.setActiveObject(rect);
        }
    } else if (currentMode === 'circle') {
        const objects = canvas.getObjects();
        const lastObj = objects.find(obj => obj.tempShape === true);
        
        if (lastObj) {
            const circle = new fabric.Circle({
                left: lastObj.left,
                top: lastObj.top,
                radius: lastObj.radius,
                stroke: strokeColor,
                strokeWidth: 2,
                fill: fillColor,
                cornerSize: 8,
                transparentCorners: false,
                selectable: true
            });
            canvas.remove(lastObj);
            canvas.add(circle);
            canvas.setActiveObject(circle);
        }
    } else if (currentMode === 'arrow') {
        const tempObjects = canvas.getObjects().filter(obj => obj.tempShape === true);
        
        if (tempObjects.length === 3) {
            const [line, head1, head2] = tempObjects;
            
            const arrowPoints = {
                startX: line.x1,
                startY: line.y1,
                endX: line.x2,
                endY: line.y2
            };
            
            tempObjects.forEach(obj => canvas.remove(obj));
            
            const arrowPath = createArrowPath(
                arrowPoints.startX, 
                arrowPoints.startY, 
                arrowPoints.endX, 
                arrowPoints.endY
            );
            
            canvas.add(arrowPath);
            canvas.setActiveObject(arrowPath);
        }
    }
    
    if (currentMode !== 'select' && currentMode !== 'draw') {
        setMode('select');
        canvas.isDrawingMode = false;
    }
    
    canvas.renderAll();
});

function createArrowPath(fromX, fromY, toX, toY) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const headLength = 20;
    const head1X = toX - headLength * Math.cos(angle - Math.PI/6);
    const head1Y = toY - headLength * Math.sin(angle - Math.PI/6);
    const head2X = toX - headLength * Math.cos(angle + Math.PI/6);
    const head2Y = toY - headLength * Math.sin(angle + Math.PI/6);
    
    const pathData = [
        'M', fromX, fromY,
        'L', toX, toY,
        'M', toX, toY,
        'L', head1X, head1Y,
        'M', toX, toY,
        'L', head2X, head2Y
    ];
    
    return new fabric.Path(pathData.join(' '), {
        stroke: strokeColor,
        strokeWidth: 2,
        fill: '',
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        cornerSize: 8,
        transparentCorners: false,
        objectType: 'arrow'  
    });
}

canvas.on('object:moving', (options) => {
    canvas.renderAll();
});

canvas.on('object:scaling', (options) => {
    canvas.renderAll();
});

canvas.on('object:rotating', (options) => {
    canvas.renderAll();
});

canvas.on('selection:created', (options) => {
    if (currentMode === 'select') {
        options.target.set({
            selectable: true,
            hasControls: true,
            hasBorders: true
        });
    }
});
