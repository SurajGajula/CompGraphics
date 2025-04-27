//The matrix library wasnt importing so I used claude-3.7 sonnet to help rewrite it in this file using the prompt "replicate cuon-matrix-cse160.js in this file"
let gl;
let programInfo;
let cubeBuffers;
let mandibleBuffers;
let tearBuffers;
let g_time = 0;
let g_animationActive = false;
let g_mandibleAnimationActive = false;
let g_animalGlobalRotation = 0;
let g_animalXRotation = 0;
let g_animalYRotation = 0;
let g_jointAngle1 = -66 * Math.PI / 180;
let g_jointAngle2 = 0;
let g_mandibleAngle = 0;
let g_isDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

let g_frameCount = 0;
let g_lastFpsUpdateTime = 0;
let g_fps = 0;
let g_fpsElement = null;

window.onload = function() {
    const canvas = document.getElementById('glCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    gl = canvas.getContext('webgl');
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    setupUI();
    
    createFpsCounter();
    
    const shaderProgram = initShaderProgram(gl, getVertexShaderSource(), getFragmentShaderSource());
    
    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            globalRotationMatrix: gl.getUniformLocation(shaderProgram, 'uGlobalRotationMatrix'),
        },
    };
    
    cubeBuffers = initCubeBuffers(gl);
    
    mandibleBuffers = initMandibleBuffers(gl);
    
    tearBuffers = initTearBuffers(gl);
    
    canvas.addEventListener('click', function(event) {
        if (event.shiftKey) {
            g_mandibleAnimationActive = !g_mandibleAnimationActive;
            if (g_mandibleAnimationActive) {
                console.log('Mandible animation activated!');
            } else {
                console.log('Mandible animation deactivated!');
                g_mandibleAngle = 0;
            }
        }
    });
    
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    canvas.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove);
    
    requestAnimationFrame(tick);
};

function initTearBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    const positions = [
        -0.201, 0.15, -0.17,
        -0.201, -0.15, -0.17,
        -0.201, -0.15, -0.05,
        
        -0.201, 0.15, -0.17,
        -0.201, -0.15, -0.05,
        -0.201, 0.15, -0.05,
        
        -0.201, 0.15, 0.05,
        -0.201, -0.15, 0.05,
        -0.201, -0.15, 0.17,
        
        -0.201, 0.15, 0.05,
        -0.201, -0.15, 0.17,
        -0.201, 0.15, 0.17,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    
    const tearColor = [0.0, 0.5, 1.0, 1.0];
    let colors = [];
    
    for (let i = 0; i < 12; i++) {
        colors = colors.concat(tearColor);
    }
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    return {
        position: positionBuffer,
        color: colorBuffer,
        vertexCount: 12
    };
}

function drawTears(modelMatrix, projectionMatrix) {
    if (!g_mandibleAnimationActive) return;
    
    gl.useProgram(programInfo.program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, tearBuffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, tearBuffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        4,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelMatrix
    );
    
    gl.drawArrays(gl.TRIANGLES, 0, tearBuffers.vertexCount);
}

function createFpsCounter() {
    g_fpsElement = document.createElement('div');
    g_fpsElement.id = 'fpsCounter';
    g_fpsElement.style.position = 'absolute';
    g_fpsElement.style.top = '10px';
    g_fpsElement.style.right = '10px';
    g_fpsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    g_fpsElement.style.color = 'white';
    g_fpsElement.style.padding = '5px 10px';
    g_fpsElement.style.borderRadius = '5px';
    g_fpsElement.style.fontFamily = 'monospace';
    g_fpsElement.style.fontSize = '14px';
    g_fpsElement.style.zIndex = '1000';
    g_fpsElement.textContent = 'FPS: --';
    document.body.appendChild(g_fpsElement);
}

function updateFpsCounter(now) {
    g_frameCount++;
    
    if (now - g_lastFpsUpdateTime >= 0.5) {
        g_fps = Math.round((g_frameCount / (now - g_lastFpsUpdateTime)) * 10) / 10;
        g_fpsElement.textContent = `FPS: ${g_fps}`;
        
        g_frameCount = 0;
        g_lastFpsUpdateTime = now;
    }
}

function setupUI() {
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '10px';
    uiContainer.style.left = '10px';
    uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    uiContainer.style.padding = '10px';
    uiContainer.style.borderRadius = '5px';
    uiContainer.style.color = 'white';
    
    addSlider(uiContainer, 'Global Rotation:', 0, 360, 0, function(value) {
        g_animalGlobalRotation = value * Math.PI / 180;
        renderScene();
    });
    
    addSlider(uiContainer, 'Knee Joint Angle:', -90, 90, 0, function(value) {
        g_jointAngle1 = value * Math.PI / 180;
        renderScene();
    });
    
    addSlider(uiContainer, 'Hip Joint Angle:', -90, 90, 0, function(value) {
        g_jointAngle2 = value * Math.PI / 180;
        renderScene();
    });
    
    const animButton = document.createElement('button');
    animButton.textContent = 'Toggle Animation';
    animButton.style.marginTop = '10px';
    animButton.style.padding = '5px';
    animButton.onclick = function() {
        g_animationActive = !g_animationActive;
        animButton.textContent = g_animationActive ? 'Stop Animation' : 'Start Animation';
    };
    uiContainer.appendChild(animButton);
    
    document.body.appendChild(uiContainer);
}

function addSlider(container, labelText, min, max, initialValue, onChangeCallback) {
    const sliderContainer = document.createElement('div');
    sliderContainer.style.marginBottom = '10px';
    
    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.display = 'block';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = initialValue;
    slider.oninput = function() {
        onChangeCallback(parseFloat(slider.value));
    };
    
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = initialValue;
    valueDisplay.style.marginLeft = '10px';
    
    slider.addEventListener('input', function() {
        valueDisplay.textContent = slider.value;
    });
    
    sliderContainer.appendChild(label);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    container.appendChild(sliderContainer);
}

function tick() {
    const now = Date.now() / 1000;
    g_time = now;
    
    updateFpsCounter(now);
    
    if (g_animationActive) {
        updateAnimationAngles();
    }
    
    if (g_mandibleAnimationActive) {
        updateMandibleAnimation();
    }
    
    renderScene();
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    g_jointAngle1 = -66 * Math.PI / 180;
}

function updateMandibleAnimation() {
    g_mandibleAngle = Math.sin(g_time * 8) * 0.5;
}

function renderScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    
    const baseMatrix = mat4.create();
    
    mat4.translate(baseMatrix, baseMatrix, [0.0, 0.0, -7.0]);
    
    mat4.rotate(baseMatrix, baseMatrix, g_animalXRotation, [1, 0, 0]);
    mat4.rotate(baseMatrix, baseMatrix, g_animalYRotation, [0, 1, 0]);
    
    mat4.rotate(baseMatrix, baseMatrix, g_animalGlobalRotation, [0, 1, 0]);
    
    const globalRotationMatrix = mat4.create();
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.globalRotationMatrix,
        false,
        globalRotationMatrix);
    
    const cubePositions = [
        -2.4, 0.0, 0.0,
        -1.8, 0.0, 0.0,
        -1.2, 0.0, 0.0,
        -0.6, 0.0, 0.0,
        0.0, 0.0, 0.0,
        0.6, 0.0, 0.0,
        1.2, 0.0, 0.0,
        1.8, 0.0, 0.0,
        2.4, 0.0, 0.0,
    ];
    
    for (let i = 0; i < 9; i++) {
        const modelMatrix = mat4.create();
        mat4.copy(modelMatrix, baseMatrix);
        
        if (g_animationActive) {
            const wavePhase = i * (Math.PI / 4.5);
            const verticalOffset = Math.sin(g_time * 5 - wavePhase) * 0.12;
            
            const xPos = cubePositions[i * 3];
            const yPos = cubePositions[i * 3 + 1] + verticalOffset;
            const zPos = cubePositions[i * 3 + 2];
            
            const rotationAmount = Math.cos(g_time * 5 - wavePhase) * 0.1;
            
            mat4.translate(modelMatrix, modelMatrix, [xPos, yPos, zPos]);
            mat4.rotate(modelMatrix, modelMatrix, rotationAmount, [0, 0, 1]);
            
            if (i === 0) {
                const headNod = Math.sin(g_time * 3) * 0.05;
                mat4.rotate(modelMatrix, modelMatrix, headNod, [1, 0, 0]);
            }
        } else {
            mat4.translate(modelMatrix, modelMatrix, [cubePositions[i * 3], cubePositions[i * 3 + 1], cubePositions[i * 3 + 2]]);
        }
        
        drawCube(modelMatrix, projectionMatrix, [0.55, 0.27, 0.07, 1.0]);
        
        if (i === 0) {
            drawTears(modelMatrix, projectionMatrix);
            
            drawMandibles(modelMatrix, projectionMatrix);
        }
        
        if (i > 0) {
            const segmentPhase = ((i - 1) % 4) * (Math.PI / 2);
            
            const leftLegMatrix = mat4.create();
            mat4.copy(leftLegMatrix, modelMatrix);
            mat4.translate(leftLegMatrix, leftLegMatrix, [-0.1, 0.0, -0.2]);
            mat4.rotate(leftLegMatrix, leftLegMatrix, Math.PI/2, [0, 1, 0]);
            
            let leftHipAngle;
            if (g_animationActive) {
                const hipAngleBase = -0.349 + (10 * Math.PI / 180);
                const hipAngleRange = 0.175;
                leftHipAngle = hipAngleBase + hipAngleRange * Math.sin(g_time * 5 + segmentPhase);
            } else {
                leftHipAngle = g_jointAngle2;
            }
            
            mat4.rotate(leftLegMatrix, leftLegMatrix, leftHipAngle, [0, 0, 1]);
            
            drawLegSegment(leftLegMatrix, projectionMatrix, true);
            
            const leftLegJointMatrix = mat4.create();
            mat4.copy(leftLegJointMatrix, leftLegMatrix);
            mat4.translate(leftLegJointMatrix, leftLegJointMatrix, [0.3, 0, 0]);
            
            mat4.rotate(leftLegJointMatrix, leftLegJointMatrix, g_jointAngle1, [0, 0, 1]); 
            
            drawLegSegment(leftLegJointMatrix, projectionMatrix, false);
            
            const rightLegMatrix = mat4.create();
            mat4.copy(rightLegMatrix, modelMatrix);
            mat4.translate(rightLegMatrix, rightLegMatrix, [0.1, 0.0, 0.2]);
            mat4.rotate(rightLegMatrix, rightLegMatrix, -Math.PI/2, [0, 1, 0]);
            
            let rightHipAngle;
            if (g_animationActive) {
                const hipAngleBase = -0.349 + (10 * Math.PI / 180);
                const hipAngleRange = 0.175;
                rightHipAngle = hipAngleBase + hipAngleRange * Math.sin(g_time * 5 + segmentPhase + Math.PI);
            } else {
                rightHipAngle = g_jointAngle2;
            }
            
            mat4.rotate(rightLegMatrix, rightLegMatrix, rightHipAngle, [0, 0, 1]);
            
            drawLegSegment(rightLegMatrix, projectionMatrix, true);
            
            const rightLegJointMatrix = mat4.create();
            mat4.copy(rightLegJointMatrix, rightLegMatrix);
            mat4.translate(rightLegJointMatrix, rightLegJointMatrix, [0.3, 0, 0]);
            
            mat4.rotate(rightLegJointMatrix, rightLegJointMatrix, g_jointAngle1, [0, 0, 1]);
            
            drawLegSegment(rightLegJointMatrix, projectionMatrix, false);
        }
    }
}

function drawCube(modelMatrix, projectionMatrix, color) {
    gl.useProgram(programInfo.program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        4,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeBuffers.indices);
    
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelMatrix
    );
    
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function drawLegSegment(modelMatrix, projectionMatrix, isFirstSegment) {
    gl.useProgram(programInfo.program);
    
    if (isFirstSegment) {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.position);
    } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.lowerLegPosition);
    }
    
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.legColor);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        4,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeBuffers.legIndices);
    
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    
    const scaledMatrix = mat4.create();
    mat4.copy(scaledMatrix, modelMatrix);
    
    if (isFirstSegment) {
        mat4.scale(scaledMatrix, scaledMatrix, [1.0, 0.2, 0.2]); 
    } else {
        mat4.scale(scaledMatrix, scaledMatrix, [1.0, 0.2, 0.2]); 
    }
    
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        scaledMatrix
    );
    
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function drawMandibles(modelMatrix, projectionMatrix) {
    const headMatrix = mat4.create();
    mat4.copy(headMatrix, modelMatrix);
    
    const rightMandibleMatrix = mat4.create();
    mat4.copy(rightMandibleMatrix, headMatrix);
    
    mat4.translate(rightMandibleMatrix, rightMandibleMatrix, [0.1, 0.0, -0.15]);
    
    mat4.scale(rightMandibleMatrix, rightMandibleMatrix, [0.6, 0.6, 0.6]);
    
    mat4.rotate(rightMandibleMatrix, rightMandibleMatrix, -Math.PI/2, [0, 1, 0]);
    
    mat4.translate(rightMandibleMatrix, rightMandibleMatrix, [0, 0, 0.5]);
    
    mat4.rotate(rightMandibleMatrix, rightMandibleMatrix, Math.PI, [1, 0, 0]);
    
    mat4.rotate(rightMandibleMatrix, rightMandibleMatrix, Math.PI/12, [0, 0, 1]);
    
    if (g_mandibleAnimationActive) {
        mat4.rotate(rightMandibleMatrix, rightMandibleMatrix, -g_mandibleAngle, [0, 1, 0]);
    }
    
    mat4.translate(rightMandibleMatrix, rightMandibleMatrix, [0, 0, -0.5]);
    
    drawMandible(rightMandibleMatrix, projectionMatrix);
    
    const leftMandibleMatrix = mat4.create();
    mat4.copy(leftMandibleMatrix, headMatrix);
    
    mat4.translate(leftMandibleMatrix, leftMandibleMatrix, [0.1, 0.0, 0.15]);
    
    mat4.scale(leftMandibleMatrix, leftMandibleMatrix, [0.6, 0.6, 0.6]);
    
    mat4.rotate(leftMandibleMatrix, leftMandibleMatrix, -Math.PI/2, [0, 1, 0]);
    
    mat4.translate(leftMandibleMatrix, leftMandibleMatrix, [0, 0, 0.5]);
    
    mat4.rotate(leftMandibleMatrix, leftMandibleMatrix, Math.PI, [1, 0, 0]);
    
    mat4.rotate(leftMandibleMatrix, leftMandibleMatrix, -Math.PI/12, [0, 0, 1]);
    
    if (g_mandibleAnimationActive) {
        mat4.rotate(leftMandibleMatrix, leftMandibleMatrix, g_mandibleAngle, [0, 1, 0]);
    }
    
    mat4.translate(leftMandibleMatrix, leftMandibleMatrix, [0, 0, -0.5]);
    
    drawMandible(leftMandibleMatrix, projectionMatrix);
}

function drawMandible(modelMatrix, projectionMatrix) {
    gl.useProgram(programInfo.program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, mandibleBuffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, mandibleBuffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        4,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelMatrix
    );
    
    gl.drawArrays(gl.TRIANGLES, 0, mandibleBuffers.vertexCount);
}

function initCubeBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    const positions = [
        -0.2, -0.2,  0.2,
         0.2, -0.2,  0.2,
         0.2,  0.2,  0.2,
        -0.2,  0.2,  0.2,
        
        -0.2, -0.2, -0.2,
        -0.2,  0.2, -0.2,
         0.2,  0.2, -0.2,
         0.2, -0.2, -0.2,
        
        -0.2,  0.2, -0.2,
        -0.2,  0.2,  0.2,
         0.2,  0.2,  0.2,
         0.2,  0.2, -0.2,
        
        -0.2, -0.2, -0.2,
         0.2, -0.2, -0.2,
         0.2, -0.2,  0.2,
        -0.2, -0.2,  0.2,
        
         0.2, -0.2, -0.2,
         0.2,  0.2, -0.2,
         0.2,  0.2,  0.2,
         0.2, -0.2,  0.2,
        
        -0.2, -0.2, -0.2,
        -0.2, -0.2,  0.2,
        -0.2,  0.2,  0.2,
        -0.2,  0.2, -0.2,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const lowerLegPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lowerLegPositionBuffer);
    
    const lowerLegPositions = [
        0.0, -0.2,  0.2,
        0.6, -0.2,  0.2,
        0.6,  0.2,  0.2,
        0.0,  0.2,  0.2,
        
        0.0, -0.2, -0.2,
        0.0,  0.2, -0.2,
        0.6,  0.2, -0.2,
        0.6, -0.2, -0.2,
        
        0.0,  0.2, -0.2,
        0.0,  0.2,  0.2,
        0.6,  0.2,  0.2,
        0.6,  0.2, -0.2,
        
        0.0, -0.2, -0.2,
        0.6, -0.2, -0.2,
        0.6, -0.2,  0.2,
        0.0, -0.2,  0.2,
        
        0.6, -0.2, -0.2,
        0.6,  0.2, -0.2,
        0.6,  0.2,  0.2,
        0.6, -0.2,  0.2,
        
        0.0, -0.2, -0.2,
        0.0, -0.2,  0.2,
        0.0,  0.2,  0.2,
        0.0,  0.2, -0.2,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lowerLegPositions), gl.STATIC_DRAW);
    
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    
    const brownColor = [0.55, 0.27, 0.07, 1.0];
    let colors = [];
    
    for (let i = 0; i < 24; i++) {
        colors = colors.concat(brownColor);
    }
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    const legColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, legColorBuffer);
    
    const lightBrownColor = [0.9, 0.7, 0.4, 1.0];
    let legColors = [];
    
    for (let i = 0; i < 24; i++) {
        legColors = legColors.concat(lightBrownColor);
    }
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(legColors), gl.STATIC_DRAW);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    const indices = [
        0, 1, 2,    0, 2, 3,
        4, 5, 6,    4, 6, 7,
        8, 9, 10,   8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ];
    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    return {
        position: positionBuffer,
        lowerLegPosition: lowerLegPositionBuffer,
        color: colorBuffer,
        legColor: legColorBuffer,
        indices: indexBuffer,
        legIndices: indexBuffer,
    };
}

function initMandibleBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    const segments = 8;
    const baseRadius = 0.15;
    const positions = [];
    
    const tipX = 0;
    const tipY = 0;
    const tipZ = 0;
    
    const baseX = 0;
    const baseY = 0;
    const baseZ = 0.5;
    
    const baseVertices = [];
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = baseX + baseRadius * Math.cos(angle);
        const y = baseY + baseRadius * Math.sin(angle);
        const z = baseZ;
        baseVertices.push([x, y, z]);
    }
    
    for (let i = 0; i < segments; i++) {
        const v1 = baseVertices[i];
        const v2 = baseVertices[(i + 1) % segments];
        
        positions.push(
            tipX, tipY, tipZ,
            v1[0], v1[1], v1[2],
            v2[0], v2[1], v2[2]
        );
    }
    
    const baseCenter = [baseX, baseY, baseZ];
    for (let i = 0; i < segments; i++) {
        const v1 = baseVertices[i];
        const v2 = baseVertices[(i + 1) % segments];
        
        positions.push(
            baseCenter[0], baseCenter[1], baseCenter[2],
            v1[0], v1[1], v1[2],
            v2[0], v2[1], v2[2]
        );
    }
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    
    const color = [1.0, 1.0, 1.0, 1.0];
    let colors = [];
    
    for (let i = 0; i < positions.length / 3; i++) {
        colors = colors.concat(color);
    }
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    return {
        position: positionBuffer,
        color: colorBuffer,
        vertexCount: positions.length / 3
    };
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    
    gl.shaderSource(shader, source);
    
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

function getVertexShaderSource() {
    return `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uGlobalRotationMatrix;
        
        varying lowp vec4 vColor;
        
        void main() {
            gl_Position = uProjectionMatrix * uGlobalRotationMatrix * uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    `;
}

function getFragmentShaderSource() {
    return `
        precision mediump float;
        varying lowp vec4 vColor;
        
        void main() {
            gl_FragColor = vColor;
        }
    `;
}

const mat4 = {
    create: function() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    },
    
    identity: function(out) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    },
    
    copy: function(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
        return out;
    },
    
    perspective: function(out, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);
        
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = (2 * far * near) * nf;
        out[15] = 0;
        
        return out;
    },
    
    translate: function(out, a, v) {
        const x = v[0], y = v[1], z = v[2];
        
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        
        return out;
    },
    
    scale: function(out, a, v) {
        const x = v[0], y = v[1], z = v[2];
        
        out[0] = a[0] * x;
        out[1] = a[1] * x;
        out[2] = a[2] * x;
        out[3] = a[3] * x;
        out[4] = a[4] * y;
        out[5] = a[5] * y;
        out[6] = a[6] * y;
        out[7] = a[7] * y;
        out[8] = a[8] * z;
        out[9] = a[9] * z;
        out[10] = a[10] * z;
        out[11] = a[11] * z;
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
        return out;
    },
    
    rotate: function(out, a, rad, axis) {
        let x = axis[0], y = axis[1], z = axis[2];
        let len = Math.sqrt(x * x + y * y + z * z);
        
        if (len < 0.000001) { return null; }
        
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;
        
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const t = 1 - c;
        
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        
        const b00 = x * x * t + c;
        const b01 = y * x * t + z * s;
        const b02 = z * x * t - y * s;
        
        const b10 = x * y * t - z * s;
        const b11 = y * y * t + c;
        const b12 = z * y * t + x * s;
        
        const b20 = x * z * t + y * s;
        const b21 = y * z * t - x * s;
        const b22 = z * z * t + c;
        
        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
        out[3] = a03 * b00 + a13 * b01 + a23 * b02;
        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
        out[7] = a03 * b10 + a13 * b11 + a23 * b12;
        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        out[11] = a03 * b20 + a13 * b21 + a23 * b22;
        
        if (a !== out) {
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        
        return out;
    }
};

function handleMouseDown(event) {
    g_isDragging = true;
    g_lastMouseX = event.clientX;
    g_lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    g_isDragging = false;
}

function handleMouseMove(event) {
    if (!g_isDragging) return;
    
    const deltaX = event.clientX - g_lastMouseX;
    const deltaY = event.clientY - g_lastMouseY;
    g_lastMouseX = event.clientX;
    g_lastMouseY = event.clientY;
    
    g_animalXRotation += (-deltaY * 0.01);
    g_animalYRotation += (deltaX * 0.01);
    
    renderScene();
}

function handleTouchStart(event) {
    if (event.touches.length === 1) {
        g_isDragging = true;
        g_lastMouseX = event.touches[0].clientX;
        g_lastMouseY = event.touches[0].clientY;
        
        event.preventDefault();
    }
}

function handleTouchEnd(event) {
    g_isDragging = false;
}

function handleTouchMove(event) {
    if (!g_isDragging || event.touches.length !== 1) return;
    
    const deltaX = event.touches[0].clientX - g_lastMouseX;
    const deltaY = event.touches[0].clientY - g_lastMouseY;
    g_lastMouseX = event.touches[0].clientX;
    g_lastMouseY = event.touches[0].clientY;
    
    g_animalXRotation += (-deltaY * 0.01);
    g_animalYRotation += (deltaX * 0.01);
    
    renderScene();
    
    event.preventDefault();
} 