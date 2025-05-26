//The initializers were made by Claude-3.5 Sonnet
let gl;
let programInfo;
let cubeBuffers;
let mandibleBuffers;
let tearBuffers;
let sphereBuffers;

let g_time = 0;
let g_animationActive = false;
let g_animalGlobalRotation = 0;
let g_animalXRotation = 0;
let g_animalYRotation = 0;
let g_jointAngle1 = -66 * Math.PI / 180;
let g_jointAngle2 = 0;
let g_mandibleAngle = 0;
let g_isDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

let g_showNormals = false;
let g_lightOn = true;
let g_lightPosition = [0, 5, 5];
let g_lightColor = [1, 1, 1];
let g_lightCubeScale = 0.2;
let g_ambientStrength = 0.2;
let g_specularStrength = 0.5;
let g_shininess = 32.0;
let g_isSpotlight = true;
let g_spotlightDirection = [0, -1, 0];
let g_spotlightCutOff = Math.cos(12.5 * Math.PI / 180.0);
let g_spotlightOuterCutOff = Math.cos(17.5 * Math.PI / 180.0);

function getVertexShaderSource() {
    return `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        attribute vec3 aVertexNormal;

        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uNormalMatrix;
        uniform vec3 uLightPosition;
        uniform bool uShowNormals;

        varying vec4 vColor;
        varying vec3 vNormal;
        varying vec3 vFragPos;
        varying vec3 vLightDir;

        void main() {
            vec4 worldPos = uModelMatrix * aVertexPosition;
            vFragPos = worldPos.xyz;
            vNormal = normalize(mat3(uNormalMatrix) * aVertexNormal);
            vLightDir = normalize(uLightPosition - vFragPos);
            vColor = aVertexColor;
            gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
        }
    `;
}

function getFragmentShaderSource() {
    return `
        precision mediump float;

        varying vec4 vColor;
        varying vec3 vNormal;
        varying vec3 vFragPos;
        varying vec3 vLightDir;

        uniform bool uShowNormals;
        uniform bool uLightOn;
        uniform vec3 uLightColor;
        uniform vec3 uLightPosition;
        uniform float uAmbientStrength;
        uniform float uSpecularStrength;
        uniform float uShininess;
        uniform mat4 uViewMatrix;
        uniform bool uIsSpotlight;
        uniform vec3 uSpotlightDirection;
        uniform float uSpotlightCutOff;
        uniform float uSpotlightOuterCutOff;

        void main() {
            if (uShowNormals) {
                gl_FragColor = vec4(normalize(vNormal) * 0.5 + 0.5, 1.0);
                return;
            }

            if (!uLightOn) {
                vec3 ambient = uAmbientStrength * uLightColor;
                vec3 result = ambient * vColor.rgb;
                gl_FragColor = vec4(result, vColor.a);
                return;
            }

            vec3 ambient = uAmbientStrength * uLightColor;
            vec3 normal = normalize(vNormal);
            vec3 lightDir = normalize(vLightDir);
            float diff = max(dot(normal, lightDir), 0.0);
            vec3 diffuse = diff * uLightColor;

            vec3 viewPos = vec3(0.0, 0.0, 0.0);
            vec3 viewDir = normalize(viewPos - vFragPos);
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
            vec3 specular = uSpecularStrength * spec * uLightColor;

            float intensity = 1.0;
            if (uIsSpotlight) {
                float theta = dot(lightDir, normalize(-uSpotlightDirection));
                float epsilon = uSpotlightCutOff - uSpotlightOuterCutOff;
                intensity = clamp((theta - uSpotlightOuterCutOff) / epsilon, 0.0, 1.0);
            }

            vec3 result = (ambient + (diffuse + specular) * intensity) * vColor.rgb;
            gl_FragColor = vec4(result, vColor.a);
        }
    `;
}

// Initialize WebGL when the window loads
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
    setupEventListeners();
    
    const shaderProgram = initShaderProgram(gl, getVertexShaderSource(), getFragmentShaderSource());
    
    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
            lightPosition: gl.getUniformLocation(shaderProgram, 'uLightPosition'),
            lightColor: gl.getUniformLocation(shaderProgram, 'uLightColor'),
            showNormals: gl.getUniformLocation(shaderProgram, 'uShowNormals'),
            lightOn: gl.getUniformLocation(shaderProgram, 'uLightOn'),
            isSpotlight: gl.getUniformLocation(shaderProgram, 'uIsSpotlight'),
            ambientStrength: gl.getUniformLocation(shaderProgram, 'uAmbientStrength'),
            specularStrength: gl.getUniformLocation(shaderProgram, 'uSpecularStrength'),
            shininess: gl.getUniformLocation(shaderProgram, 'uShininess'),
            spotlightDirection: gl.getUniformLocation(shaderProgram, 'uSpotlightDirection'),
            spotlightCutOff: gl.getUniformLocation(shaderProgram, 'uSpotlightCutOff'),
            spotlightOuterCutOff: gl.getUniformLocation(shaderProgram, 'uSpotlightOuterCutOff'),
        },
    };
    
    initBuffers();
    requestAnimationFrame(tick);
};

function setupEventListeners() {
    document.getElementById('toggleNormalVis').addEventListener('click', function() {
        g_showNormals = !g_showNormals;
    });

    document.getElementById('lightOnOff').addEventListener('click', function() {
        g_lightOn = !g_lightOn;
        this.textContent = g_lightOn ? 'Turn Light Off' : 'Turn Light On';
    });

    document.getElementById('lightModeSwitch').addEventListener('click', function() {
        g_isSpotlight = !g_isSpotlight;
        this.textContent = g_isSpotlight ? 'Switch to Point Light' : 'Switch to Spotlight';
    });

    document.getElementById('lightX').addEventListener('input', function(e) {
        g_lightPosition[0] = parseFloat(e.target.value);
    });
    document.getElementById('lightY').addEventListener('input', function(e) {
        g_lightPosition[1] = parseFloat(e.target.value);
    });
    document.getElementById('lightZ').addEventListener('input', function(e) {
        g_lightPosition[2] = parseFloat(e.target.value);
    });

    document.getElementById('lightR').addEventListener('input', function(e) {
        g_lightColor[0] = parseFloat(e.target.value);
    });
    document.getElementById('lightG').addEventListener('input', function(e) {
        g_lightColor[1] = parseFloat(e.target.value);
    });
    document.getElementById('lightB').addEventListener('input', function(e) {
        g_lightColor[2] = parseFloat(e.target.value);
    });

    document.getElementById('toggleAnimation').addEventListener('click', function() {
        g_animationActive = !g_animationActive;
    });

    document.getElementById('spotlightDirX').addEventListener('input', function(e) {
        g_spotlightDirection[0] = parseFloat(e.target.value);
    });
    document.getElementById('spotlightDirY').addEventListener('input', function(e) {
        g_spotlightDirection[1] = parseFloat(e.target.value);
    });
    document.getElementById('spotlightDirZ').addEventListener('input', function(e) {
        g_spotlightDirection[2] = parseFloat(e.target.value);
    });

    document.getElementById('spotlightAngle').addEventListener('input', function(e) {
        const angleInDegrees = parseFloat(e.target.value);
        g_spotlightCutOff = Math.cos(angleInDegrees * Math.PI / 180.0);
        g_spotlightOuterCutOff = Math.cos((angleInDegrees + 5.0) * Math.PI / 180.0);
    });

    const canvas = document.getElementById('glCanvas');
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    canvas.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove);
}

function initBuffers() {
    cubeBuffers = initCubeBuffers(gl);
    mandibleBuffers = initMandibleBuffers(gl);
    tearBuffers = initTearBuffers(gl);
    sphereBuffers = initSphereBuffers(gl);
}

function initCubeBuffers(gl) {
    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
        
        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        
        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        
        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
        
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    const normals = [
        // Front face
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,

        // Back face
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,

        // Top face
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,

        // Bottom face
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,

        // Right face
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,

        // Left face
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
    ];

    const colors = [
        // Front face: white
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        
        // Back face: red
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        
        // Top face: green
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        
        // Bottom face: blue
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        
        // Right face: yellow
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        
        // Left face: purple
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
    ];

    const indices = [
        0,  1,  2,    0,  2,  3,    // front
        4,  5,  6,    4,  6,  7,    // back
        8,  9,  10,   8,  10, 11,   // top
        12, 13, 14,   12, 14, 15,   // bottom
        16, 17, 18,   16, 18, 19,   // right
        20, 21, 22,   20, 22, 23,   // left
    ];

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        color: colorBuffer,
        indices: indexBuffer,
        vertexCount: 36,
    };
}

function initSphereBuffers(gl, latitudeBands = 30, longitudeBands = 30, radius = 1.0) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];

    // Generate vertices
    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        const theta = latNumber * Math.PI / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            // Position
            positions.push(radius * x);
            positions.push(radius * y);
            positions.push(radius * z);

            // Normal (normalized position for sphere)
            normals.push(x);
            normals.push(y);
            normals.push(z);

            // Color (using normal as color for debugging)
            colors.push(x * 0.5 + 0.5);
            colors.push(y * 0.5 + 0.5);
            colors.push(z * 0.5 + 0.5);
            colors.push(1.0);
        }
    }

    // Generate indices
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber;
            const second = first + longitudeBands + 1;

            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        color: colorBuffer,
        indices: indexBuffer,
        vertexCount: indices.length,
    };
}

function initMandibleBuffers(gl) {
    const positions = [
        // Front face
        -1.0, -0.2,  0.2,
         1.0, -0.2,  0.2,
         1.0,  0.2,  0.2,
        -1.0,  0.2,  0.2,
        
        // Back face
        -1.0, -0.2, -0.2,
        -1.0,  0.2, -0.2,
         1.0,  0.2, -0.2,
         1.0, -0.2, -0.2,
        
        // Top face
        -1.0,  0.2, -0.2,
        -1.0,  0.2,  0.2,
         1.0,  0.2,  0.2,
         1.0,  0.2, -0.2,
        
        // Bottom face
        -1.0, -0.2, -0.2,
         1.0, -0.2, -0.2,
         1.0, -0.2,  0.2,
        -1.0, -0.2,  0.2,
        
        // Right face
         1.0, -0.2, -0.2,
         1.0,  0.2, -0.2,
         1.0,  0.2,  0.2,
         1.0, -0.2,  0.2,
        
        // Left face
        -1.0, -0.2, -0.2,
        -1.0, -0.2,  0.2,
        -1.0,  0.2,  0.2,
        -1.0,  0.2, -0.2,
    ];

    const normals = [
        // Front face
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,

        // Back face
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,

        // Top face
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,

        // Bottom face
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,

        // Right face
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,

        // Left face
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
    ];

    const colors = new Float32Array(24 * 4).fill(1.0);  // White color for all vertices

    const indices = [
        0,  1,  2,    0,  2,  3,    // front
        4,  5,  6,    4,  6,  7,    // back
        8,  9,  10,   8,  10, 11,   // top
        12, 13, 14,   12, 14, 15,   // bottom
        16, 17, 18,   16, 18, 19,   // right
        20, 21, 22,   20, 22, 23,   // left
    ];

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        color: colorBuffer,
        indices: indexBuffer,
        vertexCount: 36,
    };
}

function initTearBuffers(gl) {
    const positions = [
        // Left tear
        -0.201, 0.15, -0.17,
        -0.201, -0.15, -0.17,
        -0.201, -0.15, -0.05,
        
        -0.201, 0.15, -0.17,
        -0.201, -0.15, -0.05,
        -0.201, 0.15, -0.05,
        
        // Right tear
        -0.201, 0.15, 0.05,
        -0.201, -0.15, 0.05,
        -0.201, -0.15, 0.17,
        
        -0.201, 0.15, 0.05,
        -0.201, -0.15, 0.17,
        -0.201, 0.15, 0.17,
    ];

    // All normals point in the -X direction (facing left)
    const normals = new Float32Array(36).fill(0);
    for (let i = 0; i < 12; i++) {
        normals[i * 3] = -1.0;  // X component
        normals[i * 3 + 1] = 0.0;  // Y component
        normals[i * 3 + 2] = 0.0;  // Z component
    }

    // Light blue color for tears
    const colors = new Float32Array(48);  // 12 vertices * 4 components (RGBA)
    for (let i = 0; i < 12; i++) {
        colors[i * 4] = 0.0;      // R
        colors[i * 4 + 1] = 0.5;  // G
        colors[i * 4 + 2] = 1.0;  // B
        colors[i * 4 + 3] = 1.0;  // A
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        color: colorBuffer,
        vertexCount: 12,
    };
}

// Matrix utility functions
function mat4Multiply(a, b) {
    const result = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) {
                sum += a[i * 4 + k] * b[k * 4 + j];
            }
            result[i * 4 + j] = sum;
        }
    }
    return result;
}

function mat4Inverse(m) {
    const inv = new Float32Array(16);
    let det;

    inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] +
        m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
    inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] -
        m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
    inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] +
        m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
    inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] -
        m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
    inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] -
        m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
    inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] +
        m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
    inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] -
        m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
    inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] +
        m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
    inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] +
        m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
    inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] -
        m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
    inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] +
        m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
    inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] -
        m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
    inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] -
        m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
    inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] +
        m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
    inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] -
        m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
    inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] +
        m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

    det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

    if (det === 0) return null;

    det = 1.0 / det;

    for (let i = 0; i < 16; i++) {
        inv[i] *= det;
    }

    return inv;
}

function mat4Transpose(m) {
    const result = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result[i * 4 + j] = m[j * 4 + i];
        }
    }
    return result;
}

function tick() {
    g_time += 0.016;
    
    if (g_animationActive) {
        updateAnimationAngles();
        updateMandibleAnimation();
    }

    if (g_animationActive) {
        const radius = 5.0;
        const speed = 0.5;
        const t = g_time * speed;
        
        g_lightPosition[0] = radius * Math.sin(t);
        g_lightPosition[2] = radius * Math.sin(t * 2);
        g_lightPosition[1] = 3.0 + Math.sin(t * 0.5) * 2.0;
    }
    
    renderScene();
    requestAnimationFrame(tick);
}

function renderScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = mat4.perspective(mat4.create(), fieldOfView, aspect, zNear, zFar);
    const viewMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -20.0]);

    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix);
    
    gl.uniform3fv(programInfo.uniformLocations.lightPosition, g_lightPosition);
    gl.uniform3fv(programInfo.uniformLocations.lightColor, g_lightColor);
    gl.uniform1f(programInfo.uniformLocations.ambientStrength, g_ambientStrength);
    gl.uniform1f(programInfo.uniformLocations.specularStrength, g_specularStrength);
    gl.uniform1f(programInfo.uniformLocations.shininess, g_shininess);
    gl.uniform1i(programInfo.uniformLocations.showNormals, g_showNormals);
    gl.uniform1i(programInfo.uniformLocations.lightOn, g_lightOn);
    gl.uniform1i(programInfo.uniformLocations.isSpotlight, g_isSpotlight);
    gl.uniform3fv(programInfo.uniformLocations.spotlightDirection, g_spotlightDirection);
    gl.uniform1f(programInfo.uniformLocations.spotlightCutOff, g_spotlightCutOff);
    gl.uniform1f(programInfo.uniformLocations.spotlightOuterCutOff, g_spotlightOuterCutOff);

    const lightModelMatrix = mat4.create();
    mat4.translate(lightModelMatrix, lightModelMatrix, g_lightPosition);
    mat4.scale(lightModelMatrix, lightModelMatrix, [g_lightCubeScale, g_lightCubeScale, g_lightCubeScale]);
    drawCube(lightModelMatrix, projectionMatrix, viewMatrix, [1.0, 1.0, 1.0, 1.0]);

    const modelMatrix = mat4.create();
    mat4.rotate(modelMatrix, modelMatrix, g_animalGlobalRotation, [0, 1, 0]);
    drawCentipede(modelMatrix, projectionMatrix, viewMatrix);

    const sphereModelMatrix = mat4.create();
    mat4.translate(sphereModelMatrix, sphereModelMatrix, [8.0, 0.0, 0.0]);
    drawSphere(sphereModelMatrix, projectionMatrix, viewMatrix);
}

function drawCube(modelMatrix, projectionMatrix, viewMatrix, color) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.normal);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.color);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeBuffers.indices);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

    gl.drawElements(gl.TRIANGLES, cubeBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
}

function drawSphere(modelMatrix, projectionMatrix, viewMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.normal);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.color);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereBuffers.indices);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

    gl.drawElements(gl.TRIANGLES, sphereBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
}

function drawCentipede(modelMatrix, projectionMatrix, viewMatrix) {
    const numSegments = 8;
    const segmentSpacing = 2.2;
    const totalLength = numSegments * segmentSpacing;
    const centerOffset = totalLength / 2;

    const centipedeMatrix = mat4.clone(modelMatrix);
    mat4.translate(centipedeMatrix, centipedeMatrix, [0, 0, -centerOffset]);

    const headMatrix = mat4.clone(centipedeMatrix);
    mat4.translate(headMatrix, headMatrix, [0, 0, 0]);
    drawCube(headMatrix, projectionMatrix, viewMatrix, [0.8, 0.2, 0.2, 1.0]);

    drawMandibles(headMatrix, projectionMatrix, viewMatrix);

    if (g_animationActive) {
        drawTears(headMatrix, projectionMatrix, viewMatrix);
    }

    let segmentMatrix = mat4.clone(centipedeMatrix);
    
    for (let i = 0; i < numSegments; i++) {
        mat4.translate(segmentMatrix, segmentMatrix, [0, 0, segmentSpacing]);
        const segmentColor = i % 2 === 0 ? [0.2, 0.8, 0.2, 1.0] : [0.2, 0.6, 0.2, 1.0];
        drawBodySegment(segmentMatrix, projectionMatrix, viewMatrix, segmentColor, i);
    }
}

function drawBodySegment(modelMatrix, projectionMatrix, viewMatrix, color, segmentIndex) {
    const segmentMatrix = mat4.clone(modelMatrix);
    mat4.scale(segmentMatrix, segmentMatrix, [1, 0.8, 1]);
    drawCube(segmentMatrix, projectionMatrix, viewMatrix, color);
    drawLegs(segmentMatrix, projectionMatrix, viewMatrix, segmentIndex);
}

function drawLegs(modelMatrix, projectionMatrix, viewMatrix, segmentIndex) {
    const legPairs = 2;
    const legSpacing = 1.0;
    
    for (let i = 0; i < legPairs; i++) {
        const leftLegMatrix = mat4.clone(modelMatrix);
        mat4.translate(leftLegMatrix, leftLegMatrix, [-1.2, 0, i * legSpacing - legSpacing/2]);
        drawLegSegment(leftLegMatrix, projectionMatrix, viewMatrix, true, segmentIndex, i, 'left');

        const rightLegMatrix = mat4.clone(modelMatrix);
        mat4.translate(rightLegMatrix, rightLegMatrix, [1.2, 0, i * legSpacing - legSpacing/2]);
        drawLegSegment(rightLegMatrix, projectionMatrix, viewMatrix, true, segmentIndex, i, 'right');
    }
}

function drawLegSegment(modelMatrix, projectionMatrix, viewMatrix, isFirstSegment, segmentIndex, legPairIndex, side) {
    const legMatrix = mat4.clone(modelMatrix);
    
    let legAngle = g_jointAngle1;
    if (g_animationActive) {
        const phaseOffset = (segmentIndex * Math.PI / 4) + (legPairIndex * Math.PI);
        legAngle += Math.sin(g_time * 5 + phaseOffset) * 0.3;
    }
    
    const rotationAngle = side === 'left' ? legAngle : -legAngle;
    mat4.rotate(legMatrix, legMatrix, rotationAngle, [0, 0, 1]);
    
    mat4.scale(legMatrix, legMatrix, [0.2, 1.0, 0.2]);
    
    drawCube(legMatrix, projectionMatrix, viewMatrix, [0.6, 0.4, 0.2, 1.0]);
    
    if (isFirstSegment) {
        const lowerLegMatrix = mat4.clone(legMatrix);
        mat4.translate(lowerLegMatrix, lowerLegMatrix, [0, -2, 0]);
        
        let lowerLegAngle = g_jointAngle2;
        if (g_animationActive) {
            const phaseOffset = (segmentIndex * Math.PI / 4) + (legPairIndex * Math.PI);
            lowerLegAngle += Math.cos(g_time * 5 + phaseOffset) * 0.3;
        }
        
        mat4.rotate(lowerLegMatrix, lowerLegMatrix, side === 'left' ? lowerLegAngle : -lowerLegAngle, [0, 0, 1]);
        
        mat4.scale(lowerLegMatrix, lowerLegMatrix, [1, 1, 1]);
        drawCube(lowerLegMatrix, projectionMatrix, viewMatrix, [0.4, 0.2, 0.1, 1.0]);
    }
}

function drawMandibles(modelMatrix, projectionMatrix, viewMatrix) {
    const leftMandibleMatrix = mat4.clone(modelMatrix);
    mat4.translate(leftMandibleMatrix, leftMandibleMatrix, [-0.8, 0, -1.0]);
    mat4.rotate(leftMandibleMatrix, leftMandibleMatrix, g_mandibleAngle, [0, 1, 0]);
    drawMandible(leftMandibleMatrix, projectionMatrix, viewMatrix, 'left');

    const rightMandibleMatrix = mat4.clone(modelMatrix);
    mat4.translate(rightMandibleMatrix, rightMandibleMatrix, [0.8, 0, -1.0]);
    mat4.rotate(rightMandibleMatrix, rightMandibleMatrix, -g_mandibleAngle, [0, 1, 0]);
    drawMandible(rightMandibleMatrix, projectionMatrix, viewMatrix, 'right');
}

function drawMandible(modelMatrix, projectionMatrix, viewMatrix, side) {
    const mandibleMatrix = mat4.clone(modelMatrix);
    mat4.scale(mandibleMatrix, mandibleMatrix, [0.2, 0.2, 1.0]);
    drawCube(mandibleMatrix, projectionMatrix, viewMatrix, [0.8, 0.1, 0.1, 1.0]);
}

function drawTears(modelMatrix, projectionMatrix, viewMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, tearBuffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    const tearNormals = new Float32Array(tearBuffers.vertexCount * 3);
    for (let i = 0; i < tearBuffers.vertexCount; i++) {
        tearNormals[i * 3] = -1.0;
        tearNormals[i * 3 + 1] = 0.0;
        tearNormals[i * 3 + 2] = 0.0;
    }
    
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tearNormals, gl.STATIC_DRAW);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, tearBuffers.color);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, tearBuffers.vertexCount);
}

function updateAnimationAngles() {
    const walkSpeed = 5.0;
    g_jointAngle1 = Math.sin(g_time * walkSpeed) * 0.3 - Math.PI / 3;
    g_jointAngle2 = Math.cos(g_time * walkSpeed) * 0.3;
}

function updateMandibleAnimation() {
    const crySpeed = 3.0;
    g_mandibleAngle = Math.sin(g_time * crySpeed) * 0.5;
}

function setupUI() {
    const uiContainer = document.getElementById('uiContainer');

    // Add mouse and touch event listeners to the canvas
    const canvas = document.getElementById('glCanvas');
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    canvas.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove);
}

function handleMouseDown(event) {
    g_isDragging = true;
    g_lastMouseX = event.clientX;
    g_lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    g_isDragging = false;
}

function handleMouseMove(event) {
    if (!g_isDragging) {
        return;
    }

    const newX = event.clientX;
    const newY = event.clientY;

    const deltaX = newX - g_lastMouseX;
    const deltaY = newY - g_lastMouseY;

    g_animalGlobalRotation += deltaX * 0.01;
    g_animalXRotation += deltaY * 0.01;

    g_lastMouseX = newX;
    g_lastMouseY = newY;
}

function handleTouchStart(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        g_isDragging = true;
        g_lastMouseX = event.touches[0].clientX;
        g_lastMouseY = event.touches[0].clientY;
    }
}

function handleTouchEnd(event) {
    g_isDragging = false;
}

function handleTouchMove(event) {
    if (g_isDragging && event.touches.length === 1) {
        event.preventDefault();
        const newX = event.touches[0].clientX;
        const newY = event.touches[0].clientY;

        const deltaX = newX - g_lastMouseX;
        const deltaY = newY - g_lastMouseY;

        g_animalGlobalRotation += deltaX * 0.01;
        g_animalXRotation += deltaY * 0.01;

        g_lastMouseX = newX;
        g_lastMouseY = newY;
    }
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