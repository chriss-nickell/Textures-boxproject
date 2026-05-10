import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { GLTFLoader } from './js/GLTFLoader.js';

console.log("A4 NEW");

// =========================
// SCENE
// =========================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xf5f5f5);
const cubeLoader = new THREE.CubeTextureLoader();

const skybox = cubeLoader.load([
    './images/envmap/posx.jpg',
    './images/envmap/negx.jpg',
    './images/envmap/posy.jpg',
    './images/envmap/negy.jpg',
    './images/envmap/posz.jpg',
    './images/envmap/negz.jpg'
]);

scene.background = skybox;
scene.environment = skybox;



// =========================
// CAMERA
// =========================

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 1.5, 5);

// =========================
// RENDERER
// =========================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    document.getElementById('viewer').clientWidth,
    window.innerHeight
);


renderer.setPixelRatio(1);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;




document
    .getElementById('viewer')
    .appendChild(renderer.domElement);



function updateSize() {

    const viewer = document.getElementById('viewer');

    const width = viewer.clientWidth;
    const height = viewer.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

}

updateSize();

// =========================
// CONTROLS
// =========================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

controls.enablePan = false;
controls.screenSpacePanning = false;


controls.rotateSpeed = 0.7;

controls.minDistance = 3;
controls.maxDistance = 8;

// =========================
// LIGHTS
// =========================

const ambient = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambient);

const dir = new THREE.DirectionalLight(0xffffff, 2);

dir.position.set(5, 10, 7);

scene.add(dir);

// =========================
// LOADER
// =========================

const loader = new GLTFLoader();

let currentGift = null;

// =========================
// MODEL CONFIGS
// =========================

const giftConfigs = {

    'gift1.glb': {

        cameraPos: [4, -137.5, 5],
        target: [0, -139.7, 0],
        scale: 1

    },

    'gift2.glb': {

        cameraPos: [4.5, 3.2, 5],
        target: [0, 0.7, 0],
        scale: 1

    }

};

// =========================
// LOAD MODEL
// =========================

function loadGift(path) {

    loader.load(path, (gltf) => {

        console.log("LOADED:", path);

        // remove old model
        if (currentGift) {

            scene.remove(currentGift);

        }

        currentGift = gltf.scene;

        // =========================
        // AUTO CENTER
        // =========================

        const box = new THREE.Box3().setFromObject(currentGift);

        const center = box.getCenter(new THREE.Vector3());

        currentGift.position.sub(center);

        // =========================
        // AUTO SCALE
        // =========================

        const size = box.getSize(new THREE.Vector3());

        const maxAxis = Math.max(
            size.x,
            size.y,
            size.z
        );

        const autoScale = 2 / maxAxis;

        const config = giftConfigs[path];

        const finalScale =
            config?.scale
            ? autoScale * config.scale
            : autoScale;

        currentGift.scale.setScalar(finalScale);

        scene.add(currentGift);

        ////// EFFECTS
/*        currentGift.traverse((child) => {

            if (child.isMesh) {

                child.material.envMap = skybox;
                child.material.envMapIntensity = 0.6;

                child.material.metalness = 0.2;
                child.material.roughness = 0.6;

                child.material.needsUpdate = true;

            }

        });

        */

        // =========================
        // CAMERA CONFIG
        // =========================

        if (config) {

            camera.position.set(
                config.cameraPos[0],
                config.cameraPos[1],
                config.cameraPos[2]
            );

            controls.target.set(
                config.target[0],
                config.target[1],
                config.target[2]
            );

        } else {

            camera.position.set(0, 1.5, 5);

            controls.target.set(0, 0, 0);

        }

        controls.update();

    }, undefined, (error) => {

        console.error("MODEL LOAD ERROR:");

        console.error(error);

    });
}



// =========================
// DEFAULT MODEL
// =========================

loadGift('gift1.glb');

// =========================
// RESIZE
// =========================

window.addEventListener('resize', () => {

    const viewerWidth =
        document.getElementById('viewer').clientWidth;

    camera.aspect =
        viewerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        viewerWidth,
        window.innerHeight
    );

});

// =========================
// LOOP
// =========================

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);

}

animate();



window.addEventListener('resize', updateSize);

const patterns = document.querySelectorAll(".pattern");

let selectedGift = "gift1.glb";

patterns.forEach(p => {

    p.addEventListener("click", () => {

        // визуальный active
        patterns.forEach(x => x.classList.remove("active"));
        p.classList.add("active");

        selectedGift = p.dataset.gift;

        console.log("SELECTED:", selectedGift);

        // загрузка модели
        loadGift(selectedGift);

    });

});


const colorButtons = document.querySelectorAll(".color-btn");

colorButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        colorButtons.forEach(x =>
            x.classList.remove("active")
        );

        btn.classList.add("active");

    });

});