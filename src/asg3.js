
let camera;
let programInfo;
let cubeBuffers;
let textureCubeBuffers;
let rockTexture;
let skyTexture;
let worldMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 0, 3, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 3, 3, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 6, 0, 0, 6, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 6, 0, 0, 6, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 6, 0, 0, 6, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
let isAnimating = false;

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
    
    camera = new Camera(canvas);
    
    camera.eye = new Vector3([16.0, 1.0, 16.0]);
    camera.at = new Vector3([15.0, 1.0, 15.0]);
    camera.updateViewMatrix();
    
    const shaderProgram = initShaderProgram(gl, getVertexShaderSource(), getFragmentShaderSource());
    
    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'a_position'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'a_color'),
            textureCoord: gl.getAttribLocation(shaderProgram, 'a_texCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'u_ProjectionMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'u_ViewMatrix'),
            modelMatrix: gl.getUniformLocation(shaderProgram, 'u_ModelMatrix'),
            sampler: gl.getUniformLocation(shaderProgram, 'u_Sampler'),
            texColorWeight: gl.getUniformLocation(shaderProgram, 'u_texColorWeight'),
        },
    };
    
    cubeBuffers = initCubeBuffers(gl);
    
    textureCubeBuffers = initTextureCubeBuffers(gl);
    
    initTextures();
    
    document.addEventListener('keydown', handleKeyDown);
    
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    canvas.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });
    
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        camera.updateProjectionMatrix(canvas);
    });
    
    requestAnimationFrame(render);
    
    console.log("WebGL initialized, camera at:", camera.eye.elements);
};

/**
 * Initialize textures
 */
function initTextures() {
    rockTexture = gl.createTexture();
    const rockImage = new Image();
    
    rockImage.onerror = function() {
        console.error("Error loading rock texture");
        createSolidTexture(rockTexture, [255, 255, 255, 255]);
    };
    
    rockImage.onload = function() { 
        console.log("Rock texture loaded successfully");
        loadTexture(gl, rockTexture, rockImage); 
    };
    
    rockImage.src = '../textures/rock.png';
    
    skyTexture = gl.createTexture();
    const skyImage = new Image();
    
    skyImage.onerror = function() {
        console.error("Error loading sky texture");
        createSolidTexture(skyTexture, [135, 206, 235, 255]);
    };
    
    skyImage.onload = function() { 
        console.log("Sky texture loaded successfully");
        loadTexture(gl, skyTexture, skyImage); 
    };
    
    skyImage.src = '../textures/sky.png';
    
    createSolidTexture(rockTexture, [200, 200, 200, 255]);
    createSolidTexture(skyTexture, [135, 206, 235, 255]);
}

/**
 * Create a solid color texture as a fallback
 */
function createSolidTexture(texture, color) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const pixel = new Uint8Array(color);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}

/**
 * Load texture image into WebGL
 */
function loadTexture(gl, texture, image) {
    try {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        
        gl.generateMipmap(gl.TEXTURE_2D);
        
        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
            console.error("WebGL error when loading texture:", error);
        }
    } catch (e) {
        console.error("Exception when loading texture:", e);
    }
}

/**
 * Handle mouse down events for camera control
 */
function handleMouseDown(event) {
    if (event.button === 2) {
        camera.isMouseDown = true;
        camera.lastMouseX = event.clientX;
        camera.lastMouseY = event.clientY;
        
        document.body.style.cursor = 'grabbing';
    }
}

/**
 * Handle mouse up events for camera control
 */
function handleMouseUp(event) {
    if (event.button === 2) {
        camera.isMouseDown = false;
        
        document.body.style.cursor = 'auto';
    }
}

/**
 * Handle mouse move events for camera control
 */
function handleMouseMove(event) {
    if (!camera.isMouseDown) {
        return;
    }
    
    const deltaX = event.clientX - camera.lastMouseX;
    const deltaY = event.clientY - camera.lastMouseY;
    
    camera.lastMouseX = event.clientX;
    camera.lastMouseY = event.clientY;
    
    camera.rotateWithMouse(deltaX, deltaY);
    
    updateStatusDisplay();
}

/**
 * Handle keyboard input for camera control
 */
function handleKeyDown(event) {
    switch (event.key.toLowerCase()) {
        case 'w':
            camera.moveForward();
            break;
        case 's':
            camera.moveBackward();
            break;
        case 'a':
            camera.moveLeft();
            break;
        case 'd':
            camera.moveRight();
            break;
        case 'q':
            camera.panLeft();
            break;
        case 'e':
            camera.panRight();
            break;
        case 'o':
            addBlockInFront();
            break;
        case 'p':
            deleteBlockInFront();
            break;
        case ' ':
            isAnimating = !isAnimating;
            break;
    }
}

/**
 * Find the map coordinates of the block directly in front of the camera
 * @returns {Object} Object containing x, z coordinates and the current height value
 */
function getBlockInFront() {
    let forward = new Vector3();
    forward.set(camera.at);
    forward.sub(camera.eye);
    forward.normalize();
    
    const eyeX = camera.eye.elements[0];
    const eyeY = camera.eye.elements[1];
    const eyeZ = camera.eye.elements[2];
    
    const maxDistance = 5;
    const stepSize = 0.1;
    
    let currentX = eyeX;
    let currentY = eyeY;
    let currentZ = eyeZ;
    
    let currentBlockX = Math.floor(currentX);
    let currentBlockZ = Math.floor(currentZ);
    
    let lastValidBlockX = currentBlockX;
    let lastValidBlockZ = currentBlockZ;
    
    for (let distance = 0; distance <= maxDistance; distance += stepSize) {
        currentX = eyeX + forward.elements[0] * distance;
        currentY = eyeY + forward.elements[1] * distance;
        currentZ = eyeZ + forward.elements[2] * distance;
        
        currentBlockX = Math.floor(currentX);
        currentBlockZ = Math.floor(currentZ);
        
        if (currentBlockX < 0 || currentBlockX >= worldMap[0].length ||
            currentBlockZ < 0 || currentBlockZ >= worldMap.length) {
            break;
        }
        
        if (currentBlockX !== lastValidBlockX || currentBlockZ !== lastValidBlockZ) {
            lastValidBlockX = currentBlockX;
            lastValidBlockZ = currentBlockZ;
            
            const blockHeight = worldMap[currentBlockZ][currentBlockX];
            

            if (blockHeight > 0 && currentY <= blockHeight) {
                return {
                    x: currentBlockX,
                    z: currentBlockZ,
                    height: blockHeight
                };
            }
        }
    }
    
    return {
        x: lastValidBlockX,
        z: lastValidBlockZ,
        height: worldMap[lastValidBlockZ][lastValidBlockX]
    };
}

/**
 * Update the status display with information about the targeted block
 */
function updateStatusDisplay() {
    const targetBlock = getBlockInFront();
    
    const targetCoordsElement = document.getElementById('targetCoords');
    if (targetCoordsElement) {
        targetCoordsElement.textContent = `X:${targetBlock.x}, Z:${targetBlock.z}`;
    }
    
    const blockHeightElement = document.getElementById('blockHeight');
    if (blockHeightElement) {
        blockHeightElement.textContent = targetBlock.height;
    }
}

/**
 * Add a block in front of the camera
 */
function addBlockInFront() {
    const targetBlock = getBlockInFront();
    
    if (targetBlock.height < 9) {
        worldMap[targetBlock.z][targetBlock.x]++;
        
        updateStatusDisplay();
        
        console.log(`Block added at (${targetBlock.x}, ${targetBlock.z}). New height: ${worldMap[targetBlock.z][targetBlock.x]}`);
    } else {
        console.log(`Maximum height reached at (${targetBlock.x}, ${targetBlock.z})`);
    }
}

/**
 * Delete a block in front of the camera
 */
function deleteBlockInFront() {
    const targetBlock = getBlockInFront();
    
    if (targetBlock.height > 0) {
        worldMap[targetBlock.z][targetBlock.x]--;
        
        updateStatusDisplay();
        
        console.log(`Block removed at (${targetBlock.x}, ${targetBlock.z}). New height: ${worldMap[targetBlock.z][targetBlock.x]}`);
    } else {
        console.log(`No blocks to remove at (${targetBlock.x}, ${targetBlock.z})`);
    }
}

/**
 * Initialize the cube buffers (positions and colors)
 */
function initCubeBuffers(gl) {
    const positions = [
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        
        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,
        
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5
    ];
    
    const colors = [
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        
        0.0, 1.0, 1.0, 1.0,
        0.0, 1.0, 1.0, 1.0,
        0.0, 1.0, 1.0, 1.0,
        0.0, 1.0, 1.0, 1.0
    ];
    
    const indices = [
        0, 1, 2,    0, 2, 3,    
        4, 5, 6,    4, 6, 7,    
        8, 9, 10,   8, 10, 11, 
        12, 13, 14, 12, 14, 15, 
        16, 17, 18, 16, 18, 19, 
        20, 21, 22, 20, 22, 23 
    ];
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
        vertexCount: indices.length
    };
}

/**
 * Initialize the textured cube buffers (positions, colors, and texture coordinates)
 */
function initTextureCubeBuffers(gl) {
    const positions = [
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        
        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,
        
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5
    ];
    
    const colors = [
        1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0, 
        1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0, 
        1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0
    ];
    
    const textureCoordinates = [
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        1.0, 0.0,  1.0, 1.0,  0.0, 1.0,  0.0, 0.0,
        0.0, 1.0,  0.0, 0.0,  1.0, 0.0,  1.0, 1.0,
        1.0, 1.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,
        1.0, 0.0,  1.0, 1.0,  0.0, 1.0,  0.0, 0.0,
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0
    ];
    
    const indices = [
        0, 1, 2,    0, 2, 3,
        4, 5, 6,    4, 6, 7,  
        8, 9, 10,   8, 10, 11, 
        12, 13, 14, 12, 14, 15, 
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ];
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    return {
        position: positionBuffer,
        color: colorBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: indices.length
    };
}

/**
 * Initialize the shader program with vertex and fragment shaders
 */
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

/**
 * Load a shader from source code
 */
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

/**
 * Get vertex shader source code
 */
function getVertexShaderSource() {
    return `
        attribute vec4 a_position;
        attribute vec4 a_color;
        attribute vec2 a_texCoord;
        
        uniform mat4 u_ModelMatrix;
        uniform mat4 u_ViewMatrix;
        uniform mat4 u_ProjectionMatrix;
        
        varying lowp vec4 v_color;
        varying highp vec2 v_texCoord;
        
        void main() {
            gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_position;
            v_color = a_color;
            v_texCoord = a_texCoord;
        }
    `;
}

/**
 * Get fragment shader source code
 */
function getFragmentShaderSource() {
    return `
        precision mediump float;
        varying lowp vec4 v_color;
        varying highp vec2 v_texCoord;
        
        uniform sampler2D u_Sampler;
        uniform float u_texColorWeight;
        
        void main() {
            vec4 texColor = texture2D(u_Sampler, v_texCoord);
            
            gl_FragColor = mix(v_color, texColor, u_texColorWeight);
        }
    `;
}

/**
 * Draw coordinate axes to help with debugging
 */
function drawCoordinateAxes() {
    const vertices = new Float32Array([

        0, 0, 0,  10, 0, 0,
        

        0, 0, 0,  0, 10, 0,
        

        0, 0, 0,  0, 0, 10
    ]);
    

    const colors = new Float32Array([

        1, 0, 0, 1,  1, 0, 0, 1,
        

        0, 1, 0, 1,  0, 1, 0, 1,
        

        0, 0, 1, 1,  0, 0, 1, 1
    ]);
    
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    const modelMatrix = new Matrix4();
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelMatrix,
        false,
        modelMatrix.elements
    );

    gl.uniform1f(programInfo.uniformLocations.texColorWeight, 0.0);

    gl.drawArrays(gl.LINES, 0, 6);
}

/**
 * Create a scene with ground, walls and skybox
 */
function createScene() {
    drawCoordinateAxes();

    const modelMatrix = new Matrix4();

    for (let x = 0; x < 32; x++) {
        for (let z = 0; z < 32; z++) {
            modelMatrix.setIdentity();

            modelMatrix.translate(x, 0, z);

            modelMatrix.scale(1.0, 0.1, 1.0);

            drawTextureCube(modelMatrix, rockTexture, 1.0);
        }
    }

    for (let x = 0; x < 32; x++) {
        for (let z = 0; z < 32; z++) {
            const cellValue = worldMap[z][x];
            
            if (cellValue > 0) {
                const wallHeight = cellValue;

                for (let y = 0; y < wallHeight; y++) {
                    modelMatrix.setIdentity();

                    modelMatrix.translate(x, y + 0.5, z);

                    drawTextureCube(modelMatrix, rockTexture, 1.0);
                }

                if (cellValue >= 3) {
                    modelMatrix.setIdentity();

                    modelMatrix.translate(x, wallHeight, z);

                    modelMatrix.scale(1.0, 0.1, 1.0);

                    drawTextureCube(modelMatrix, rockTexture, 0.8);
                }
            }
        }
    }

    modelMatrix.setIdentity();

    modelMatrix.translate(camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);

    modelMatrix.scale(500, 500, 500);

    drawSkybox(modelMatrix, skyTexture);

    drawTargetBlockIndicator();
}

/**
 * Draw a colored cube with the given model matrix
 */
function drawCube(modelMatrix, texWeight) {
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
        programInfo.uniformLocations.modelMatrix,
        false,
        modelMatrix.elements
    );
    
    gl.uniform1f(programInfo.uniformLocations.texColorWeight, texWeight);
    
    gl.drawElements(gl.TRIANGLES, cubeBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
}

/**
 * Draw a textured cube with the given model matrix and texture
 */
function drawTextureCube(modelMatrix, texture, texWeight) {
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCubeBuffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCubeBuffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        4,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCubeBuffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, textureCubeBuffers.indices);
    
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelMatrix,
        false,
        modelMatrix.elements
    );
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.sampler, 0);
    
    gl.uniform1f(programInfo.uniformLocations.texColorWeight, texWeight);
    
    gl.drawElements(gl.TRIANGLES, textureCubeBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
    
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.error("WebGL error when drawing textured cube:", error);
    }
}

/**
 * Draw a skybox with the given model matrix and texture
 */
function drawSkybox(modelMatrix, texture) {
    gl.cullFace(gl.FRONT);
    gl.enable(gl.CULL_FACE);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCubeBuffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCubeBuffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        4,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCubeBuffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, textureCubeBuffers.indices);
    
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelMatrix,
        false,
        modelMatrix.elements
    );
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.sampler, 0);
    
    gl.uniform1f(programInfo.uniformLocations.texColorWeight, 1.0);
    
    gl.drawElements(gl.TRIANGLES, textureCubeBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
    
    gl.cullFace(gl.BACK);
    gl.disable(gl.CULL_FACE);
}

/**
 * Draw a visual indicator around the block that's currently targeted
 */
function drawTargetBlockIndicator() {
    const targetBlock = getBlockInFront();
    
    updateStatusDisplay();
    
    const modelMatrix = new Matrix4();
    modelMatrix.setIdentity();
    
    let y = 0;
    
    if (targetBlock.height > 0) {
        y = targetBlock.height - 0.5;
    } else {
        y = 0;
    }
    
    modelMatrix.translate(targetBlock.x, y, targetBlock.z);
    
    modelMatrix.scale(1.01, 1.01, 1.01);
    
    const blendEnabled = gl.isEnabled(gl.BLEND);
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
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
        programInfo.uniformLocations.modelMatrix,
        false,
        modelMatrix.elements
    );
    
    gl.uniform1f(programInfo.uniformLocations.texColorWeight, 0.3);
    
    gl.drawElements(gl.LINE_LOOP, cubeBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
    
    if (!blendEnabled) {
        gl.disable(gl.BLEND);
    }
}

/**
 * Render the scene
 */
function render(now) {
    try {
        now *= 0.001;
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(programInfo.program);
        
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.viewMatrix,
            false,
            camera.viewMatrix.elements
        );
        
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            camera.projectionMatrix.elements
        );
        
        createScene();
        
        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
            console.error("WebGL error during rendering:", error);
        }
        
        requestAnimationFrame(render);
    } catch (e) {
        console.error("Exception during rendering:", e);
    }
}

