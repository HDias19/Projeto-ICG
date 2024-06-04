import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


// global variables
let scene, basicCamera, camera, fpcamera, plcamera, renderer, clock, fpcontrols, orbitcontrols, plcontrols, gui, blockerDiv
let up = false
let pl = false
let walls = []
let doors = []
let doorRotation = []
let ceilingWall
let player

function init()
{
    // Inner Clock
    clock = new THREE.Clock();
    
    // Create a scene
    scene = new THREE.Scene();

    // Create a renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xADD8E6);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    
    //basic camera
    basicCamera = new THREE.OrthographicCamera(-15, 15, 15, -15);
    basicCamera.position.y = 20
    basicCamera.lookAt(new THREE.Vector3(0,0,0))

    // Create perspective camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 5;

    // PointerLock Camera
    plcamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
    plcamera.position.z = 10;
    plcamera.position.y = 1.5;
    fpcontrols = new FirstPersonControls( plcamera, renderer.domElement );
    fpcontrols.lookSpeed = 0.2;
    fpcontrols.movementSpeed = 5;
    fpcontrols.noFly = true;
    fpcontrols.lookVertical = true;
    fpcontrols.constrainVertical = true;
    fpcontrols.verticalMin = 1.0;
    fpcontrols.verticalMax = 2.0;
    fpcontrols.enabled = false;
    fpcontrols.enableDamping = true;

    // Create plane
    const planeGeometry = new THREE.PlaneGeometry(20,20);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x301a00, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
    scene.add(ambientLight);

    // SpotLight (Sun)
    const spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(10, 10, 10);
    spotLight.castShadow = true;
    spotLight.decay = 0;
    // scene.add(spotLight);


    // Orbit Controls
    orbitcontrols = new OrbitControls(camera, renderer.domElement);
    orbitcontrols.enableDamping = true;
    orbitcontrols.dampingFactor = 0.25;
    orbitcontrols.update()

    // GUI
    gui = new GUI()
    const base = {
        Up: function() {
            up = !up
        },
        FirstPerson: function() {
            pl = !pl
            orbitcontrols.enabled = !orbitcontrols.enabled
            fpcontrols.enabled = !fpcontrols.enabled
        },
        Ceiling: function() {
            ceilingWall.visible = !ceilingWall.visible
        }   
    }

    gui.add(base, 'Up').listen()
    gui.add(base, 'FirstPerson').listen()
    gui.add(base, 'Ceiling').listen()

    createHouse()
    ceilingWall.visible = false

    const playerGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    const playerMaterial = new THREE.MeshBasicMaterial();
    player = new THREE.Mesh(playerGeometry, playerMaterial)
    player.position.copy(plcamera.position)
    player.visible = false
    scene.add(player)

    // Animation loop
    animate()
}

// Create House
function createHouse() {
    let wallsPos = [
        // [3.5, 3, 0.1, -3.5/2, 1.5, 5],
        [0.55, 3, 0.1, -3.5+0.55/2, 1.5, 5],
        [0.55, 3, 0.1, -1-0.55/2, 1.5, 5],
        [2.5, 0.7, 0.1, -3.5+2.5/2, 0.35, 5],
        [2.5, 0.7, 0.1, -3.5+2.5/2, 3-0.35, 5],
        [1, 3, 0.1, -0.5, 1.5, 5],
        // [5, 3, 0.1, 2.5, 1.5, 5],
        // [2, 3, 0.1, 1.5+1, 1.5, 5],
        [0.4, 3, 0.1, 1.5+0.2, 1.5, 5],
        [0.4, 3, 0.1, 3.5-0.2, 1.5, 5],
        [2, 0.7, 0.1, 1.5+2/2, 0.35, 5],
        [2, 0.7, 0.1, 1.5+2/2, 3-0.35, 5],
        [2.5, 3, 0.1, -3.5+2.5/2, 1.5, 1.5],
        [2.5, 3, 0.1, -3.5+2.5/2, 1.5, 0],
        [1.5, 3, 0.1, -3.5+1.5/2, 1.5, -1.5],
        [2.5, 3, 0.1, 3.5-2.5/2, 1.5, 1.5],
        [2.5, 3, 0.1, 3.5-2.5/2, 1.5, -1.5],
        // [3.5, 3, 0.1, -3.5/2, 1.5, -5]
        [2.3/2, 3, 0.1, -3.5+2.3/4, 1.5, -5],
        [2.3/2, 3, 0.1, -2.3/4, 1.5, -5],
        [2.3/2, 3, 0.1, 3.5-2.3/4, 1.5, -5],
        [2.3/2, 3, 0.1, 2.3/4, 1.5, -5],
        [3.5, 0.7, 0.1, -3.5/2, 0.35, -5],
        [3.5, 0.7, 0.1, -3.5/2, 3-0.35, -5],
        [3.5, 0.7, 0.1, 3.5/2, 0.35, -5],
        [3.5, 0.7, 0.1, 3.5/2, 3-0.35, -5],
        // [0.1, 3, 3.5, -3.5, 1.5, 5-3.5/2], 
        [0.1, 3, 0.9, -3.5, 1.5, 5-0.9/2],
        [0.1, 3, 0.9, -3.5, 1.5, 5-3.5+0.9/2],
        [0.1, 0.7, 3.5, -3.5, 0.35, 5-3.5/2],
        [0.1, 0.7, 3.5, -3.5, 3-0.35, 5-3.5/2],
        // [0.1, 3, 1.5, -3.5, 1.5, 1.5/2],
        [0.1, 3, 0.5, -3.5, 1.5, 1.5-0.5/2],
        [0.1, 3, 0.5, -3.5, 1.5, 0.5/2],
        [0.1, 0.5, 1.5, -3.5, 3-0.5/2, 1.5/2],
        [0.1, 2, 1.5, -3.5, 2/2, 1.5/2],
        [0.1, 3, 0.5, -3.5, 1.5, -1.5+0.5/2],
        [0.1, 3, 0.5, -3.5, 1.5, -0.5/2],
        [0.1, 0.5, 1.5, -3.5, 3-0.5/2, -1.5/2],
        [0.1, 2, 1.5, -3.5, 2/2, -1.5/2],
        // [0.1, 3, 3.5, -3.5, 1.5, -5+3.5/2]
        [0.1, 3, 0.25, -3.5, 1.5, -1.5-0.25/2],
        [0.1, 3, 0.25, -3.5, 1.5, -5+0.25/2],
        [0.1, 3, 1, -3.5, 1.5, -1.5-3.5/2],
        [0.1, 1.7/2, 3.5, -3.5, 1.7/4, -5+3.5/2],
        [0.1, 1.7/2, 3.5, -3.5, 3-1.7/4, -5+3.5/2],
        [0.1, 3, 3.5, 0, 1.5, -5+3.5/2],
        [0.1, 3, 0.25, 3.5, 1.5, -1.5-0.25/2],
        [0.1, 3, 0.25, 3.5, 1.5, -5+0.25/2],
        [0.1, 3, 1, 3.5, 1.5, -1.5-3.5/2],
        [0.1, 1.7/2, 3.5, 3.5, 1.7/4, -5+3.5/2],
        [0.1, 1.7/2, 3.5, 3.5, 3-1.7/4, -5+3.5/2],
        // [0.1, 3, 3, 3.5, 1.5, 0],
        [0.1, 3, 1.8/2, 3.5, 1.5, -1.5+1.8/4],
        [0.1, 3, 1.8/2, 3.5, 1.5, 1.5-1.8/4],
        [0.1, 0.7, 3, 3.5, 0.7/2, 0],
        [0.1, 0.7, 3, 3.5, 3-0.7/2, 0],
        // [0.1, 3, 3.5, 3.5, 1.5, 1.5+3.5/2],
        [0.1, 3, 0.8, 3.5, 1.5, 1.5+0.8/2],
        [0.1, 3, 0.8, 3.5, 1.5, 5-0.8/2],
        [0.1, 0.7, 3.5, 3.5, 0.7/2, 1.5+3.5/2],
        [0.1, 0.7, 3.5, 3.5, 3-0.7/2, 1.5+3.5/2],
        [0.1, 3, 0.5, -1, 1.5, 1.5-0.25],
        [0.1, 3, 1.5, -1, 1.5, -1.5+0.75],
        [0.1, 3, 2, 1, 1.5, 1.5-1]
    ]

    for (let i = 0; i < wallsPos.length; i++) {
        createWall(wallsPos[i][0], wallsPos[i][1], wallsPos[i][2], wallsPos[i][3], wallsPos[i][4], wallsPos[i][5])
    }

    let doorFramesPos = [
        [1.5/2, 1.5, 5, 1],
        [-1/2, 1.5, -1.5, 2],
        [1/2, 1.5, -1.5, 2],
        [-1-1/2, 1.5, -1.5, 2],
        [-1, 1.5, 1/2, 3],
        [1, 1.5, -1.5+1/2, 3]
    ]

    for (let i = 0; i < doorFramesPos.length; i++) {
        createDoorFrame(doorFramesPos[i][0], doorFramesPos[i][1], doorFramesPos[i][2], doorFramesPos[i][3])
    }

    let windowPos = [
        [1.4, 1.6, 0.01, -3.5+2.5/2, 1.5, 5],
        [1.2, 1.6, 0.01, 3.5-2/2, 1.5, 5],
        [0.01, 1.6, 1.6, -3.5, 1.5, 1.5+3.5/2],
        [0.01, 0.5, 0.5, -3.5, 2.25, 1.5/2],
        [0.01, 0.5, 0.5, -3.5, 2.25, -1.5/2],
        [0.01, 1.3, 1, -3.5, 1.5, -1.5-0.25-1/2],
        [0.01, 1.3, 1, -3.5, 1.5, -5+0.25+1/2],
        [1.2, 1.6, 0.01, 3.5-3.5/2, 1.5, -5],
        [1.2, 1.6, 0.01, -3.5+3.5/2, 1.5, -5],
        [0.01, 1.6, 1.8, 3.5, 1.5, 1.5+3.5/2],
        [0.01, 1.3, 1, 3.5, 1.5, -1.5-0.25-1/2],
        [0.01, 1.3, 1, 3.5, 1.5, -5+0.25+1/2],
        [0.01, 1.6, 1.2, 3.5, 1.5, 0],
    ]

    for (let i = 0; i < windowPos.length; i++) {
        createWindow(windowPos[i][0], windowPos[i][1], windowPos[i][2], windowPos[i][3], windowPos[i][4], windowPos[i][5])
    }

    createWall(7, 0.1, 10, 0, 3, 0)

    let doorPos = [
        [1, 2.2, 0.05, 1.5/2, 1.1, 5, 1],
        [0.9, 2.2, 0.05, 1/2, 1.1, -1.5, 1],
        [0.9, 2.2, 0.05, -1/2, 1.1, -1.5, 2],
        [0.9, 2.2, 0.05, -1-1/2, 1.1, -1.5, 3],
        [0.05, 2.2, 0.9, 1, 1.1, -1.5+0.45, 4],
        [0.05, 2.2, 0.9, -1, 1.1, 0.45, 5],
    ]

    for (let i = 0; i < doorPos.length; i++) {
        createDoor(doorPos[i][0], doorPos[i][1], doorPos[i][2], doorPos[i][3], doorPos[i][4], doorPos[i][5], doorPos[i][6])
    }

    let lampPos = [
        [0,2.8,0],
        [-3.5+2.5/2, 2.8, 1.5+3.5/2],
        [3.5-2.5/2, 2.8, 1.5+3.5/2],
        [-3.5+2.5/2, 2.8, 1.5/2],
        [-3.5+2.5/2, 2.8, -1.5/2],
        [-3.5/2, 2.8, -5+3.5/2],
        [3.5/2, 2.8, -5+3.5/2],
        [3.5-2.5/2, 2.8, 0],
    ]

    for (let i = 0; i < lampPos.length; i++) {
        createLamp(lampPos[i][0], lampPos[i][1], lampPos[i][2])
    }
}

// Create Wall
function createWall(tx, ty, tz, px, py, pz) {
    if (tx > 0.1) { tx += 0.1 } else { tz += 0.1 }
    const wallGeometry = new THREE.BoxGeometry(tx,ty,tz);
    const wallMaterial = new THREE.MeshLambertMaterial({color: 0xd3d3d3});
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(px, py, pz);
    wall.receiveShadow = true;
    wall.castShadow = true;
    
    if (ty == 0.1) {
        ceilingWall = wall
        walls.push(ceilingWall);
        scene.add(ceilingWall);
        return
    }

    walls.push(wall);
    scene.add(wall);
    
    
}

// Create Door Frames
function createDoorFrame(px, py, pz, type=1) {
    let x1, x2, y1, y2, z1, z2
    let doorFrame1Geometry, doorFrame2Geometry, doorFrameMaterial, doorframe1, doorframe2, doorframe3
    if (type == 1) {
        x1 = 0.25, x2 = 1.5, y1 = 3, y2 = 0.8, z1 = 0.1, z2 = 0.1
        doorFrame1Geometry = new THREE.BoxGeometry(Math.abs(x1),y1,z1);
        doorFrame2Geometry = new THREE.BoxGeometry(x2,y2,z2);
        doorFrameMaterial = new THREE.MeshLambertMaterial({color: 0xd3d3d3});
        doorframe1 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
        doorframe2 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
        doorframe3 = new THREE.Mesh(doorFrame2Geometry, doorFrameMaterial)
        doorframe1.receiveShadow = true;
        doorframe1.castShadow = true;
        doorframe1.position.set(px+px-x1/2, py, pz);
        doorframe2.receiveShadow = true;
        doorframe2.castShadow = true;
        doorframe2.position.set(px-px+x1/2, py, pz);
        doorframe3.receiveShadow = true;
        doorframe3.castShadow = true;
        doorframe3.position.set(px, py*2-y2/2, pz);
    } else if (type == 2) {
        doorFrame1Geometry = new THREE.BoxGeometry(0.1, 3, 0.1);
        doorFrame2Geometry = new THREE.BoxGeometry(1, 0.8, 0.1);
        doorFrameMaterial = new THREE.MeshLambertMaterial({color: 0xd3d3d3});
        doorframe1 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
        doorframe2 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
        doorframe3 = new THREE.Mesh(doorFrame2Geometry, doorFrameMaterial)
        doorframe1.receiveShadow = true;
        doorframe1.castShadow = true;
        doorframe1.position.set(px-0.85/2, py, pz);
        doorframe2.receiveShadow = true;
        doorframe2.castShadow = true;
        doorframe2.position.set(px+0.85/2, py, pz);
        doorframe3.receiveShadow = true;
        doorframe3.castShadow = true;
        doorframe3.position.set(px, py-1.5+2.6, pz);
    } else {
        doorFrame1Geometry = new THREE.BoxGeometry(0.1, 3, 0.1);
        doorFrame2Geometry = new THREE.BoxGeometry(0.1, 0.8, 1);
        doorFrameMaterial = new THREE.MeshLambertMaterial({color: 0xd3d3d3});
        doorframe1 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
        doorframe2 = new THREE.Mesh(doorFrame1Geometry, doorFrameMaterial)
        doorframe3 = new THREE.Mesh(doorFrame2Geometry, doorFrameMaterial)
        doorframe1.receiveShadow = true;
        doorframe1.castShadow = true;
        doorframe1.position.set(px, py, pz-0.85/2);
        doorframe2.receiveShadow = true;
        doorframe2.castShadow = true;
        doorframe2.position.set(px, py, pz+0.85/2);
        doorframe3.receiveShadow = true;
        doorframe3.castShadow = true;
        doorframe3.position.set(px, py-1.5+2.6, pz);
    }

    const doorframe = new THREE.Group()
    doorframe.add(doorframe1)
    doorframe.add(doorframe2)
    doorframe.add(doorframe3)
    walls.push(doorframe)
    scene.add(doorframe) 
}

// Create Window
function createWindow(tx, ty, tz, px, py, pz) {
    const windowGeometry = new THREE.BoxGeometry(tx,ty,tz);
    const windowMaterial = new THREE.MeshPhongMaterial({
        color: 0xADD8E6,
        opacity: 0.25,
        transparent: true,
        shininess: 100, 
        refractionRatio: 0.98,
        envMap: scene.background,
    });
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(px, py, pz);
    window.receiveShadow = true;
    window.castShadow = true;
    
    walls.push(window);
    scene.add(window);
}

// Create Door
function createDoor(tx, ty, tz, px, py, pz, type) {
    const doorGeometry = new THREE.BoxGeometry(tx, ty, tz);
    const doorMaterial = new THREE.MeshLambertMaterial({color: 0x8B4513});
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.receiveShadow = true;
    door.castShadow = true;
    const trueDoor = new THREE.Group()
    if (type == 1) {
        trueDoor.position.set(px-tx/2, py, pz);
        door.position.set(tx/2, 0, 0)
        doorRotation.push(1)
    } else if (type == 2) {
        trueDoor.position.set(px+tx/2, py, pz);
        door.position.set(-tx/2, 0, 0)
        doorRotation.push(-1)
    } else if (type == 3) {
        trueDoor.rotateY(Math.PI)
        trueDoor.position.set(tx+px-tx/2, py, pz);
        door.position.set(tx/2, 0, 0)
        doorRotation.push(2)
    } else if (type == 4) {
        trueDoor.position.set(px, py, pz-tz/2);
        door.position.set(0, 0, tz/2)
        doorRotation.push(3)
    } else if (type == 5) {
        trueDoor.position.set(px, py, pz-tz/2);
        door.position.set(0, 0, tz/2)
        doorRotation.push(4)
    }
    trueDoor.add(door)
    scene.add(trueDoor);
    doors.push(trueDoor)
}

// Create Ceiling Lamps
function createLamp(px, py, pz) {
    const pointLight = new THREE.PointLight(0xffff88, 0.8, 50);
    pointLight.position.set(px, py, pz);
    scene.add(pointLight);
}

// Check Collision with wall
function checkCollisions() {
    let playerBoundingBox = new THREE.Box3().setFromObject(player);
        for (let i = 0; i < walls.length; i++) {
            if (playerBoundingBox.intersectsBox(new THREE.Box3().setFromObject(walls[i]).expandByScalar(-0.03))) {
                return true
            }
        }
    return false
}

// Render
function render(delta) {
    if (up) {
        renderer.render(scene, basicCamera);
        return
    }
    if (pl) {
        let prevPosition = plcamera.position.clone();
        fpcontrols.update(delta)
        player.position.copy(plcamera.position)
        player.position.y = 0.1
        fpcontrols.object.position.y = 1.50;
        if (checkCollisions()) {
            plcamera.position.copy(prevPosition);
            player.position.copy(prevPosition);
        }
        renderer.render(scene, plcamera);   
    } else {
        orbitcontrols.update();
        renderer.render(scene, camera);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();
    for (let i = 0; i < doors.length; i++) {
        if (doors[i].rotation.y <= Math.PI/2.2 && doorRotation[i] == 1) {
            doors[i].rotateY(0.02)
        } else if (doors[i].rotation.y >= -Math.PI/2.2 && doorRotation[i] == -1) {
            doors[i].rotateY(-0.02)
        } else if (doors[i].rotation.y >= -Math.PI/2.2 && doorRotation[i] == 2) {
            doors[i].rotateY(0.02)
        } else if (doors[i].rotation.y <= Math.PI/2.2 && doorRotation[i] == 3) {
            doors[i].rotateY(0.02)
        } else if (doors[i].rotation.y >= -Math.PI/2.2 && doorRotation[i] == 4) {
            doors[i].rotateY(-0.02)
        }
    }

    render(delta);
}

window.onload = init;