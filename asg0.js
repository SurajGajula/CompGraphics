var canvas;
var ctx;

function main() {
    canvas = document.getElementById('webgl');
  
    ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Failed to get the rendering context for Canvas');
      return;
    }
  
    handleDrawEvent();
}

function handleDrawEvent() {
    var v1_x = parseFloat(document.getElementById('v1_x').value);
    var v1_y = parseFloat(document.getElementById('v1_y').value);
    var v2_x = parseFloat(document.getElementById('v2_x').value);
    var v2_y = parseFloat(document.getElementById('v2_y').value);
    
    var v1 = new Vector3([v1_x, v1_y, 0.0]);
    var v2 = new Vector3([v2_x, v2_y, 0.0]);
    
    clearCanvas();
    drawVector(ctx, v1, "red");
    drawVector(ctx, v2, "blue");
}

function handleDrawOperationEvent() {
    var v1_x = parseFloat(document.getElementById('v1_x').value);
    var v1_y = parseFloat(document.getElementById('v1_y').value);
    var v2_x = parseFloat(document.getElementById('v2_x').value);
    var v2_y = parseFloat(document.getElementById('v2_y').value);
    
    var v1 = new Vector3([v1_x, v1_y, 0.0]);
    var v2 = new Vector3([v2_x, v2_y, 0.0]);
    
    var operation = document.getElementById('operation').value;
    var scalar = parseFloat(document.getElementById('scalar').value);
    
    clearCanvas();
    drawVector(ctx, v1, "red");
    drawVector(ctx, v2, "blue");
    
    switch (operation) {
        case 'add':
            var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
            v3.add(v2);
            drawVector(ctx, v3, "green");
            break;
            
        case 'sub':
            var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
            v3.sub(v2);
            drawVector(ctx, v3, "green");
            break;
            
        case 'mul':
            var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
            var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
            v3.mul(scalar);
            v4.mul(scalar);
            drawVector(ctx, v3, "green");
            drawVector(ctx, v4, "green");
            break;
            
        case 'div':
            var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
            var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
            v3.div(scalar);
            v4.div(scalar);
            drawVector(ctx, v3, "green");
            drawVector(ctx, v4, "green");
            break;
            
        case 'magnitude':
            var mag1 = v1.magnitude();
            var mag2 = v2.magnitude();
            console.log("Magnitude of v1:", mag1);
            console.log("Magnitude of v2:", mag2);
            break;
            
        case 'normalize':
            var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
            var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
            v3.normalize();
            v4.normalize();
            drawVector(ctx, v3, "green");
            drawVector(ctx, v4, "green");
            
            console.log("Magnitude of normalized v1:", v3.magnitude());
            console.log("Magnitude of normalized v2:", v4.magnitude());
            break;
            
        case 'angle':
            var angle = angleBetween(v1, v2);
            console.log("Angle between v1 and v2:", angle, "radians");
            console.log("Angle between v1 and v2:", angle * (180 / Math.PI), "degrees");
            break;
            
        case 'area':
            var area = areaTriangle(v1, v2);
            console.log("Area of triangle formed by v1 and v2:", area);
            break;
    }
}

function angleBetween(v1, v2) {
    var dotProduct = Vector3.dot(v1, v2);
    var mag1 = v1.magnitude();
    var mag2 = v2.magnitude();
    
    if (mag1 === 0 || mag2 === 0) {
        return 0;
    }
    
    var cosAlpha = dotProduct / (mag1 * mag2);
    
    cosAlpha = Math.max(-1, Math.min(1, cosAlpha));
    
    return Math.acos(cosAlpha);
}

function areaTriangle(v1, v2) {
    var crossProduct = Vector3.cross(v1, v2);
    return crossProduct.magnitude() / 2;
}

function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(ctx, v, color) {
    var canvas = ctx.canvas;
    var width = canvas.width;
    var height = canvas.height;
    
    var centerX = width / 2;
    var centerY = height / 2;
    
    var scaleFactor = 20;
    
    var endX = centerX + v.elements[0] * scaleFactor;
    var endY = centerY - v.elements[1] * scaleFactor;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    ctx.stroke();
}