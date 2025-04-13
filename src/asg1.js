var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_PointSize;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_PointSize;\n' +
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

var gl;
var canvas;
var a_Position;
var u_FragColor;
var u_PointSize;
var currentShape = 'point';
var currentColor = [1.0, 0.0, 0.0, 1.0];
var currentSize = 10.0;
var shapesList = [];

function main() {
  setupWebGL();
  
  connectVariablesToGLSL();
  
  registerEventHandlers();
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL() {
  canvas = document.getElementById('webgl');

  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }) || 
       canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
  
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  
  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  if (!u_PointSize) {
    console.log('Failed to get the storage location of u_PointSize');
    return;
  }
}

function registerEventHandlers() {
  canvas.onmousedown = handleClick;
  canvas.onmousemove = handleMouseMove;
  
  document.getElementById('clearButton').onclick = clearCanvas;
  document.getElementById('redSlider').oninput = updateColor;
  document.getElementById('greenSlider').oninput = updateColor;
  document.getElementById('blueSlider').oninput = updateColor;
  document.getElementById('sizeSlider').oninput = updateSize;
  document.getElementById('pointButton').onclick = function() { currentShape = 'point'; };
  document.getElementById('triangleButton').onclick = function() { currentShape = 'triangle'; };
  document.getElementById('circleButton').onclick = function() { currentShape = 'circle'; };
  document.getElementById('segmentsSlider').oninput = updateSegments;
  
  document.getElementById('clearButton').addEventListener('click', clearCanvas);
  document.getElementById('pointButton').addEventListener('click', () => setCurrentShape('point'));
  document.getElementById('triangleButton').addEventListener('click', () => setCurrentShape('triangle'));
  document.getElementById('circleButton').addEventListener('click', () => setCurrentShape('circle'));
  
  document.getElementById('draw160Button').addEventListener('click', function() {
    clearCanvas();
  
    drawCentipede();
    
    renderAllShapes();
  });
}

function updateColor() {
  var r = document.getElementById('redSlider').value / 100;
  var g = document.getElementById('greenSlider').value / 100;
  var b = document.getElementById('blueSlider').value / 100;
  currentColor = [r, g, b, 1.0];
  
  document.getElementById('colorPreview').style.backgroundColor = 
    `rgb(${r*255}, ${g*255}, ${b*255})`;
}

function updateSize() {
  var sliderValue = parseInt(document.getElementById('sizeSlider').value);
  
  document.getElementById('sizeValue').textContent = sliderValue;
  
  currentSize = sliderValue;
}

function updateSegments() {
  currentSegments = document.getElementById('segmentsSlider').value;
  document.getElementById('segmentsValue').textContent = currentSegments;
}

function setCurrentShape(shape) {
  currentShape = shape;
}

function clearCanvas() {
  shapesList = [];
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function handleClick(ev) {
  addShape(ev);
}

function handleMouseMove(ev) {
  if (ev.buttons === 1) { 
    addShape(ev);
  }
}

function addShape(ev) {
  var coords = getCoordinates(ev);
  
  var shapeSize = currentSize / 100;
  
  if (currentShape === 'point') {
    shapesList.push(new Point(coords.x, coords.y, currentColor, currentSize));
  } else if (currentShape === 'triangle') {
    var size = Math.max(0.05, shapeSize);
    
    var height = size * Math.sqrt(3) / 2;
    
    var x1 = coords.x;
    var y1 = coords.y + height/1.5;
    
    var x2 = coords.x - size/2;
    var y2 = coords.y - height/3;
    
    var x3 = coords.x + size/2;
    var y3 = coords.y - height/3;
    
    shapesList.push(new Triangle(x1, y1, x2, y2, x3, y3, currentColor));
  } else if (currentShape === 'circle') {
    var segments = document.getElementById('segmentsSlider').value;
    var radius = Math.max(0.05, shapeSize);
    shapesList.push(new Circle(coords.x, coords.y, radius, segments, currentColor));
  }
  
  renderAllShapes();
}

function getCoordinates(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
  y = (canvas.height/2 - (y - rect.top)) / (canvas.height/2);
  
  return { x: x, y: y };
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  console.log(`Rendering ${shapesList.length} shapes`);
  
  for (var i = 0; i < shapesList.length; i++) {
    shapesList[i].render();
  }
}

// Point class
class Point {
  constructor(x, y, color, size) {
    this.position = [x, y];
    this.color = color;
    this.size = size;
    this.type = 'point';
  }
  
  render() {
    gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniform1f(u_PointSize, this.size);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

class Triangle {
  constructor(x1, y1, x2, y2, x3, y3, color) {
    console.log(`Creating triangle: (${x1}, ${y1}), (${x2}, ${y2}), (${x3}, ${y3})`);
    
    if (Array.isArray(x1)) {
      const p1 = x1;
      const p2 = y1;
      const p3 = x2;
      color = y2;
      
      this.vertices = new Float32Array([
        p1[0], p1[1], 
        p2[0], p2[1], 
        p3[0], p3[1]
      ]);
    } else {
      this.vertices = new Float32Array([
        x1, y1, 
        x2, y2, 
        x3, y3
      ]);
    }
    
    this.color = color;
    this.type = 'triangle';
  }
  
  render() {
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    gl.disableVertexAttribArray(a_Position);
  }
}

class Circle {
  constructor(x, y, radius, segments, color) {
    this.position = [x, y];
    this.radius = radius;
    this.segments = segments;
    this.color = color;
    this.type = 'circle';
  }
  
  render() {
    this.drawFilledCircle();
  }
  
  drawFilledCircle() {
    var vertices = [];
    
    var angleStep = 2 * Math.PI / this.segments;
    
    for (var i = 0; i < this.segments; i++) {
      var angle1 = i * angleStep;
      var angle2 = (i + 1) * angleStep;
      
      vertices.push(this.position[0]);
      vertices.push(this.position[1]);
      
      vertices.push(this.position[0] + this.radius * Math.cos(angle1));
      vertices.push(this.position[1] + this.radius * Math.sin(angle1));
      
      vertices.push(this.position[0] + this.radius * Math.cos(angle2));
      vertices.push(this.position[1] + this.radius * Math.sin(angle2));
    }
    
    var verticesArray = new Float32Array(vertices);
    
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesArray, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    
    gl.drawArrays(gl.TRIANGLES, 0, this.segments * 3);
    
    gl.disableVertexAttribArray(a_Position);
  }
}

function initShaders(gl, vshaderSource, fshaderSource) {
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) {
    return false;
  }

  gl.shaderSource(vertexShader, vshaderSource);
  gl.shaderSource(fragmentShader, fshaderSource);

  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log('Failed to compile vertex shader: ' + gl.getShaderInfoLog(vertexShader));
    return false;
  }

  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log('Failed to compile fragment shader: ' + gl.getShaderInfoLog(fragmentShader));
    return false;
  }

  var program = gl.createProgram();
  if (!program) {
    return false;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log('Failed to link program: ' + gl.getProgramInfoLog(program));
    return false;
  }

  gl.useProgram(program);
  gl.program = program;

  return true;
}

//This file was made using Claude 3.7-sonnet using the prompt "draw my centipede drawing using triangles" -->
function drawCentipede() {
  const colors = {
    body: [0.6, 0.2, 0.0, 1.0],    
    segments: [
      [0.8, 0.3, 0.1, 1.0],         
      [0.7, 0.2, 0.0, 1.0],         
      [0.5, 0.1, 0.0, 1.0],         
    ],
    legs: [0.4, 0.1, 0.0, 1.0],     
    antennae: [0.3, 0.0, 0.0, 1.0], 
    eyes: [0.0, 0.0, 0.0, 1.0],     
    highlight: [1.0, 0.5, 0.2, 1.0] 
  };

  drawCentipedeHead(colors);
  drawCentipedeBody(colors);
}

function drawCentipedeHead(colors) {
  const headX = -0.7;
  const headY = 0;
  const headRadius = 0.15;
  
  const segments = 8;
  const angleStep = 2 * Math.PI / segments;
  
  for (let i = 0; i < segments; i++) {
    const angle1 = i * angleStep;
    const angle2 = (i + 1) * angleStep;
    
    shapesList.push(new Triangle(
      headX, headY,
      headX + headRadius * Math.cos(angle1), headY + headRadius * Math.sin(angle1),
      headX + headRadius * Math.cos(angle2), headY + headRadius * Math.sin(angle2),
      colors.body
    ));
  }
  
  const eyeRadius = 0.03;
  const leftEyeX = headX + 0.08;
  const leftEyeY = headY + 0.06;
  
  shapesList.push(new Triangle(
    leftEyeX, leftEyeY,
    leftEyeX + eyeRadius, leftEyeY,
    leftEyeX, leftEyeY + eyeRadius,
    colors.eyes
  ));
  
  const rightEyeX = headX + 0.08;
  const rightEyeY = headY - 0.06;
  
  shapesList.push(new Triangle(
    rightEyeX, rightEyeY,
    rightEyeX + eyeRadius, rightEyeY,
    rightEyeX, rightEyeY - eyeRadius,
    colors.eyes
  ));
  
  shapesList.push(new Triangle(
    headX, headY + headRadius * 0.7,
    headX - 0.1, headY + headRadius * 2,
    headX - 0.05, headY + headRadius * 0.7,
    colors.antennae
  ));
  
  shapesList.push(new Triangle(
    headX, headY - headRadius * 0.7,
    headX - 0.1, headY - headRadius * 2,
    headX - 0.05, headY - headRadius * 0.7,
    colors.antennae
  ));
}

function drawCentipedeBody(colors) {
  const numSegments = 10;
  const segmentWidth = 0.13;
  const segmentHeight = 0.2;
  const startX = -0.55;
  
  for (let i = 0; i < numSegments; i++) {
    const segmentX = startX + i * segmentWidth * 1.2;
    const segmentY = 0;
    const colorIndex = i % colors.segments.length;
    
    shapesList.push(new Triangle(
      segmentX, segmentY + segmentHeight/2,
      segmentX - segmentWidth/2, segmentY - segmentHeight/2,
      segmentX + segmentWidth/2, segmentY - segmentHeight/2,
      colors.segments[colorIndex]
    ));
    
    shapesList.push(new Triangle(
      segmentX, segmentY + segmentHeight/2,
      segmentX - segmentWidth/4, segmentY + segmentHeight/4,
      segmentX + segmentWidth/4, segmentY + segmentHeight/4,
      colors.highlight
    ));
    
    const legLength = 0.15;
    
    shapesList.push(new Triangle(
      segmentX - segmentWidth/3, segmentY,
      segmentX - segmentWidth/3 - legLength * 0.7, segmentY + legLength,
      segmentX - segmentWidth/3 - legLength * 0.3, segmentY,
      colors.legs
    ));
    shapesList.push(new Triangle(
      segmentX + segmentWidth/3, segmentY,
      segmentX + segmentWidth/3 + legLength * 0.7, segmentY + legLength,
      segmentX + segmentWidth/3 + legLength * 0.3, segmentY,
      colors.legs
    ));
    shapesList.push(new Triangle(
      segmentX - segmentWidth/3, segmentY,
      segmentX - segmentWidth/3 - legLength * 0.7, segmentY - legLength,
      segmentX - segmentWidth/3 - legLength * 0.3, segmentY,
      colors.legs
    ));
    shapesList.push(new Triangle(
      segmentX + segmentWidth/3, segmentY,
      segmentX + segmentWidth/3 + legLength * 0.7, segmentY - legLength,
      segmentX + segmentWidth/3 + legLength * 0.3, segmentY,
      colors.legs
    ));
  }
}