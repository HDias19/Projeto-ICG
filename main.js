import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let scale = 1.2

let walls = [];
let doorFrames = [];
let doors = [];
let doorAngles = [];
let ceiling;
let controls, renderer, scene, camera, gui, fpcontrols, fpcamera, clock
let fp = false;

function init() {
    //clock
    clock = new THREE.Clock();

    //scene
    scene = new THREE.Scene();
    scene.rotation.x = -0.5 * Math.PI; 

    //camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(6, 6, 20);
    const sceneCenter = new THREE.Vector3(6,6,0)
    camera.lookAt(sceneCenter); 

    //renderer
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x89cff0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    //basic camera
    const basicCamera = new THREE.OrthographicCamera(-5, 15, 15, -5, -10, 10);
    // camera.lookAt(scene.position);

    //plane 
    const planeGeometry = new THREE.PlaneGeometry(12, 12);
    const planeMaterial = new THREE.MeshLambertMaterial({color: 0x000000});
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    // plane.castShadow = true
    plane.position.x = 6
    plane.position.y = 6
    scene.add(plane);

    //orbit controls
    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); 

    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 10;
    controls.maxDistance = 50;

    controls.maxPolarAngle = Math.PI / 2;   

    controls.target = sceneCenter
    controls.update()

    //axis
    const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);

    //plant
    createPlant(scene)

    //ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    //spotlight light
    const spotLight = new THREE.SpotLight(0xffcc00, 1)
    spotLight.position.set(50,25,50)
    spotLight.decay = 0
    scene.add(spotLight)

    //directional helper
    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    // scene.add(spotLightHelper);

    

    //house position (example)
    const housePosition = new THREE.Vector3(6, 6, 0); // Update with actual house coordinates

    //first person camera
    fpcamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    fpcamera.position.set(6, 6, 20); // Set initial position
    fpcamera.lookAt(housePosition); // Make the camera look at the house

    fpcontrols = new FirstPersonControls(fpcamera, renderer.domElement);
    fpcontrols.lookSpeed = 0.1;
    fpcontrols.enabled = false
    fpcontrols.movementSpeed = 5;
    fpcontrols.lookVertical = true;
    fpcontrols.nofly = true;
    fpcontrols.position = new THREE.Vector3(0, 0, 1.5); // Set initial position

    gui = new GUI()
    const base = {
        Switch: function() {
            fp = !fp
            controls.enabled = !controls.enabled
            fpcontrols.enabled = !fpcontrols.enabled
            ceiling.visible = !ceiling.visible
        }
    }

    gui.add(base, 'Switch').listen()

    window.addEventListener('resize', onWindowResize, false);
    //animation
    
    //scale
    // scaleScene(5)
    // for (let i = 0; i < scene.children.length; i++) {
    //     scene.children[i].scale.set(scale, scale, scale);
    // }
    
    animate()
}

function scaleScene(scaleFactor) {
    scene.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            object.scale.multiplyScalar(scaleFactor);
            object.position.multiplyScalar(scaleFactor);
        }
    });

    // Adjust camera positions as well
    camera.position.multiplyScalar(scaleFactor);
    fpcamera.position.multiplyScalar(scaleFactor);
    fpcontrols.update(1);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    let delta = clock.getDelta();

    requestAnimationFrame(animate);
    controls.update()
    fpcontrols.update(delta)

    if (fp == true) {
        fpcontrols.object.position.y = 1.50; // Adjust based on floor size
        renderer.render(scene, fpcamera);
    }
    else {
        renderer.render(scene, camera);
    }
    // renderer.render(scene, basicCamera);
}

function createPlant(scene) {
    walls.push(createWall(3.5, 0.1, 3, 4.25, 1, 1.5))
    walls.push(createWall(2.2, 0.1, 3, 8.4, 1, 1.5))
    walls.push(createWall(7, 0.1, 3, 6, 11, 1.5))
    walls.push(createWall(0.1, 10, 3, 2.5, 6, 1.5))
    walls.push(createWall(0.1, 10, 3, 9.5, 6, 1.5))
    walls.push(createWall(0.1, 3.5, 3, 6, 9.25, 1.5))
    walls.push(createWall(1.5, 0.1, 3, 3.25, 7.5, 1.5))
    walls.push(createWall(2.5, 0.1, 3, 7+2.5/2, 7.5, 1.5))
    walls.push(createWall(2.5, 0.1, 3, 3.75, 6, 1.5))
    walls.push(createWall(2.5, 0.1, 3, 3.75, 4.5, 1.5))
    walls.push(createWall(3.5, 0.1, 3, 7.75, 4.5, 1.5))
    walls.push(createWall(0.1, 1.5, 3, 5, 6.75, 1.5))
    walls.push(createWall(0.1, .5, 3, 5, 4.75, 1.5))
    walls.push(createWall(0.1, 2, 3, 7, 5.5, 1.5))
    walls.push(createWall(1, 0.1, 3, 6.5, 6.25, 1.5))
    walls.push(createWall(0.1, 0.75, 3, 5, 3.375+0.75, 1.5))

    doorFrames.push(createDoorFrame1(6+1.3/2,1,1.5))
    doorFrames.push(createDoorFrame2(6-1/2, 7.5, 1.5))
    doorFrames.push(createDoorFrame2(4+1/2, 7.5, 1.5))
    doorFrames.push(createDoorFrame2(6+1/2, 7.5, 1.5))
    doorFrames.push(createDoorFrame3(5, 6-1/2, 1.5))
    doorFrames.push(createDoorFrame3(7, 7, 1.5))

    doors.push(createDoor(1, 0.05, 2.2, 6+1.3/2, 1, 1.1))
    doors.push(createDoor(0.9, 0.05, 2.2, 6-0.9/2, 7.5, 1.1, 1))
    doors.push(createDoor(0.9, 0.05, 2.2, 5-0.9/2, 7.5, 1.1))
    doors.push(createDoor(0.9, 0.05, 2.2, 6+0.9/2, 7.5, 1.1))
    doors.push(createDoor(0.05, 0.9, 2.2, 5, 6-1/2, 1.1))
    doors.push(createDoor(0.05, 0.9, 2.2, 7, 7, 1.1))

    walls.forEach(wall => {
        scene.add(wall);
    });

    doorFrames.forEach(doorframe => {
        scene.add(doorframe)
    })

    doors.forEach(door => {
        scene.add(door)
    })

    ceiling = createWall(7, 10, 0.1, 6, 6, 3)
    ceiling.castShadow = true
    ceiling.receiveShadow = true
    scene.add(ceiling)
    ceiling.visible = false
}

function createWall(tx,ty,tz,px,py,pz) {
    if (tx > 0.1) { tx += 0.05 } else { ty += 0.05 }
    const wallGeometry = new THREE.BoxGeometry(tx,ty,tz);
    const wallMaterial = new THREE.MeshLambertMaterial({color: 0xd3d3d3});
    let wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(px, py, pz);
    wall.receiveShadow = true;
    wall.castShadow = true;
    
    return wall;
}

// remake door creation function
function createDoor(tx,ty,tz,px,py,pz,r=0) {
    const doorGeometry = new THREE.BoxGeometry(tx, ty, tz);
    const doorMaterial = new THREE.MeshLambertMaterial({color: 0xB8860B});
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(px, py, pz);
    door.receiveShadow = true;
    door.castShadow = true;

    return door
}

function createDoorFrame1(px, py, pz) {
    const doorFrame1Geometry = new THREE.BoxGeometry(
        0.15, 0.1, 3
    );
    const doorFrame2Geometry = new THREE.BoxGeometry(
        1.2, 0.1, 0.8
    );
    const doorFrameMaterial = new THREE.MeshLambertMaterial(
        {color: 0xd3d3d3}
    );
    const doorframe1 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
    const doorframe2 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
    const doorframe3 = new THREE.Mesh(doorFrame2Geometry, doorFrameMaterial)
    doorframe1.receiveShadow = true;
    doorframe1.castShadow = true;
    doorframe1.position.set(px-1.15/2, py, pz);
    doorframe2.receiveShadow = true;
    doorframe2.castShadow = true;
    doorframe2.position.set(px+1.15/2, py, pz);
    doorframe3.receiveShadow = true;
    doorframe3.castShadow = true;
    doorframe3.position.set(px, py, pz-1.5+2.6);
    
    const doorframe = new THREE.Group()
    doorframe.add(doorframe1)
    doorframe.add(doorframe2)
    doorframe.add(doorframe3)
    
    return doorframe   
}

function createDoorFrame2(px, py, pz) {
    const doorFrame1Geometry = new THREE.BoxGeometry(
        0.1, 0.1, 3
    );
    const doorFrame2Geometry = new THREE.BoxGeometry(
        1, 0.1, 0.8
    );
    const doorFrameMaterial = new THREE.MeshLambertMaterial(
        {color: 0xd3d3d3}
    );
    const doorframe1 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
    const doorframe2 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
    const doorframe3 = new THREE.Mesh(doorFrame2Geometry, doorFrameMaterial)
    doorframe1.receiveShadow = true;
    doorframe1.castShadow = true;
    doorframe1.position.set(px-0.85/2, py, pz);
    doorframe2.receiveShadow = true;
    doorframe2.castShadow = true;
    doorframe2.position.set(px+0.85/2, py, pz);
    doorframe3.receiveShadow = true;
    doorframe3.castShadow = true;
    doorframe3.position.set(px, py, pz-1.5+2.6);
    
    const doorframe = new THREE.Group()
    doorframe.add(doorframe1)
    doorframe.add(doorframe2)
    doorframe.add(doorframe3)
    
    return doorframe
}

function createDoorFrame3(px, py, pz) {
    const doorFrame1Geometry = new THREE.BoxGeometry(
        0.1, 0.1, 3
    );
    const doorFrame2Geometry = new THREE.BoxGeometry(
        0.1, 1, 0.8
    );
    const doorFrameMaterial = new THREE.MeshLambertMaterial(
        {color: 0xd3d3d3}
    );
    const doorframe1 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
    const doorframe2 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
    const doorframe3 = new THREE.Mesh(doorFrame2Geometry, doorFrameMaterial)
    doorframe1.receiveShadow = true;
    doorframe1.castShadow = true;
    doorframe1.position.set(px, py-0.85/2, pz);
    doorframe2.receiveShadow = true;
    doorframe2.castShadow = true;
    doorframe2.position.set(px, py+0.85/2, pz);
    doorframe3.receiveShadow = true;
    doorframe3.castShadow = true;
    doorframe3.position.set(px, py, pz-1.5+2.6);
    
    const doorframe = new THREE.Group()
    doorframe.add(doorframe1)
    doorframe.add(doorframe2)
    doorframe.add(doorframe3)
    
    return doorframe
}

window.onload = init;