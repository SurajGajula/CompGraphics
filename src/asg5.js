//The scene uses cylinders, spheres, cones, and a textured and animated cube.
//The roblox skibidi model is loaded and scaled to be visible, courtesy of sigmacool on Sketchfab.
//The three light sources are a directional light, a point light, and a spot light.
//The skibidi toiled also moves around the scene based on WASD input.


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

camera.position.set(0, 5, 15);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemisphereLight);

const pointLight = new THREE.PointLight(0xff0000, 1, 100);
pointLight.position.set(2, 10, 2);
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0x00ff00, 1);
spotLight.position.set(-5, 10, 0);
spotLight.angle = Math.PI / 6;
scene.add(spotLight);

const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x885533 });
const marbleMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });

scene.background = new THREE.Color(0x87ceeb);

const groundGeometry = new THREE.PlaneGeometry(30, 30);
const ground = new THREE.Mesh(groundGeometry, woodMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const shapes = [];

const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cube = new THREE.Mesh(cubeGeometry, marbleMaterial);
cube.position.set(-5, 1, 0);
scene.add(cube);
shapes.push(cube);

for (let i = 0; i < 5; i++) {
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5);
    scene.add(sphere);
    shapes.push(sphere);
}

for (let i = 0; i < 7; i++) {
    const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(Math.random() * 10 - 5, 1, Math.random() * 10 - 5);
    scene.add(cylinder);
    shapes.push(cylinder);
}

for (let i = 0; i < 7; i++) {
    const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32);
    const coneMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.set(Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5);
    scene.add(cone);
    shapes.push(cone);
}

let skibidiModel;
const gltfLoader = new THREE.GLTFLoader();
console.log('Starting to load GLB model...');
gltfLoader.load('../skibidi-toilet-roblox-blender-glb/source/Skibidi toilet edit all V3 Roblox.glb', (gltf) => {
    console.log('Model loaded successfully:', gltf);
    skibidiModel = gltf.scene;
    
    skibidiModel.scale.set(2, 2, 2);
    
    const boundingBox = new THREE.Box3().setFromObject(skibidiModel);
    const modelHeight = boundingBox.max.y - boundingBox.min.y;
    
    skibidiModel.position.set(0, -boundingBox.min.y, 0);
    
    skibidiModel.traverse((child) => {
        if (child.isMesh) {
            child.material.side = THREE.DoubleSide;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    scene.add(skibidiModel);
    console.log('Model added to scene at position:', skibidiModel.position);
    console.log('Model height:', modelHeight);
    console.log('Model bounding box:', boundingBox);
    
    shapes.push(skibidiModel);
}, 
(progress) => {
    console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
},
(error) => {
    console.error('An error occurred loading the GLB model:', error);
});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

directionalLight.castShadow = true;
spotLight.castShadow = true;
pointLight.castShadow = true;

const moveSpeed = 0.1;

const keyStates = {
    w: false,
    a: false,
    s: false,
    d: false
};

window.addEventListener('keydown', (event) => {
    switch(event.key.toLowerCase()) {
        case 'w': keyStates.w = true; break;
        case 'a': keyStates.a = true; break;
        case 's': keyStates.s = true; break;
        case 'd': keyStates.d = true; break;
    }
});

window.addEventListener('keyup', (event) => {
    switch(event.key.toLowerCase()) {
        case 'w': keyStates.w = false; break;
        case 'a': keyStates.a = false; break;
        case 's': keyStates.s = false; break;
        case 'd': keyStates.d = false; break;
    }
});

let time = 0;
function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    shapes.forEach((shape, index) => {
        if (shape.geometry && shape.geometry.type === 'SphereGeometry') {
            shape.position.y = 0.5 + Math.sin(time + index) * 0.5;
        }
    });

    if (skibidiModel) {
        if (keyStates.w) skibidiModel.position.z -= moveSpeed;
        if (keyStates.s) skibidiModel.position.z += moveSpeed;
        if (keyStates.a) skibidiModel.position.x -= moveSpeed;
        if (keyStates.d) skibidiModel.position.x += moveSpeed;

        if (keyStates.w || keyStates.s || keyStates.a || keyStates.d) {
            let angle = Math.atan2(
                keyStates.d - keyStates.a,
                keyStates.s - keyStates.w
            );
            skibidiModel.rotation.y = angle;
        }

        const bounds = 14;
        skibidiModel.position.x = Math.max(-bounds, Math.min(bounds, skibidiModel.position.x));
        skibidiModel.position.z = Math.max(-bounds, Math.min(bounds, skibidiModel.position.z));
    }

    time += 0.02;

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();
