import * as THREE from 'three';
import { io } from 'socket.io-client';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// holds all the animations
const allActions: THREE.AnimationAction[] = [];

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
camera.position.set( -5, 3, 10);
camera.lookAt( new THREE.Vector3( 0, 2, 0 ) );

const scene = new THREE.Scene();
// background and fog
scene.background = new THREE.Color( 0xe0e0e0 );
scene.fog = new THREE.Fog( 0xe0e0e0, 20, 100 );

// lighting
const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
hemiLight.position.set( 0, 20, 0 );
scene.add( hemiLight );

const dirLight = new THREE.DirectionalLight( 0xffffff );
dirLight.position.set( 0, 20, 20);
scene.add( dirLight );

// ground
const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false }));
mesh.rotation.x = -Math.PI / 2;
scene.add( mesh );

const grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
if (grid.material instanceof THREE.Material) {
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
}
scene.add( grid );

//model
let mixer: THREE.AnimationMixer;
const rider = new GLTFLoader();
let clips: THREE.AnimationClip[];

rider.load( 'assets/blue_rider.glb', function( gltf ) {
    scene.add( gltf.scene );
    mixer = new THREE.AnimationMixer( gltf.scene );
    clips = gltf.animations;

    let action;
    const fps = 30;
    const animationsFrameLocations = [
        {
            name: 'jump_down',
            frameStart: 10,
            frameEnd: 40,
        },
        {
            name: 'jump_up',
            frameStart: 40,
            frameEnd: 70,
        },
        {
            name: 'idle_01',
            frameStart: 75,
            frameEnd: 175,
        },
        {
            name: 'idle_02',
            frameStart: 175,
            frameEnd: 275,
        },
        {
            name: 'idle_03',
            frameStart: 275,
            frameEnd: 375,
        },
        {
            name: 'drive',
            frameStart: 380,
            frameEnd: 400,
        },
        {
            name: 'drive_turn_left',
            frameStart: 405,
            frameEnd: 425,
        },
        {
            name: 'drive_turn_right',
            frameStart: 435,
            frameEnd: 455,
        },
        {
            name: 'drive_fast',
            frameStart: 460,
            frameEnd: 480,
        },
        {
            name: 'drive_fast_left',
            frameStart: 485,
            frameEnd: 505,
        },
        {
            name: 'drive_fast_right',
            frameStart: 515,
            frameEnd: 535,
        },
        {
            name: 'drive_nitro',
            frameStart: 540,
            frameEnd: 560,
        },
        {
            name: 'drive_obstacle_01',
            frameStart: 565,
            frameEnd: 605,
        },
        {
            name: 'drive_obstacle_02',
            frameStart: 605,
            frameEnd: 645,
        },
        {
            name: 'drive_obstacle_03',
            frameStart: 650,
            frameEnd: 675,
        },
        {
            name: 'drive_hit_left',
            frameStart: 675,
            frameEnd: 695,
        },
        {
            name: 'drive_hit_right',
            frameStart: 695,
            frameEnd: 715,
        },
        {
            name: 'drive_kick_left',
            frameStart: 715,
            frameEnd: 735,
        },
        {
            name: 'drive_kick_right',
            frameStart: 735,
            frameEnd: 755,
        },
        {
            name: 'drive_fail_01',
            frameStart: 760,
            frameEnd: 805,
        },
        {
            name: 'drive_fail_02',
            frameStart: 810,
            frameEnd: 845,
        },
        {
            name: 'drive_trick_01',
            frameStart: 850,
            frameEnd: 900,
        },
        {
            name: 'drive_trick_01_loop',
            frameStart: 860,
            frameEnd: 890,
        },
        {
            name: 'drive_trick_02',
            frameStart: 900,
            frameEnd: 950,
        },
        {
            name: 'drive_trick_02_loop',
            frameStart: 910,
            frameEnd: 940,
        },
        {
            name: 'drive_trick_03',
            frameStart: 950,
            frameEnd: 1000,
        },
        {
            name: 'drive_trick_03_loop',
            frameStart: 960,
            frameEnd: 990,
        },
        {
            name: 'drive_trick_04',
            frameStart: 1000,
            frameEnd: 1050,
        },
        {
            name: 'drive_trick_04_loop',
            frameStart: 1015,
            frameEnd: 1035,
        },
        {
            name: 'drive_trick_05',
            frameStart: 1050,
            frameEnd: 1100,
        },
        {
            name: 'drive_trick_05_loop',
            frameStart: 1065,
            frameEnd: 1085,
        },
        {
            name: 'drive_trick_06',
            frameStart: 1100,
            frameEnd: 1150,
        },
        {
            name: 'drive_trick_06_loop',
            frameStart: 1115,
            frameEnd: 1135,
        },
        {
            name: 'drive_trick_07',
            frameStart: 1150,
            frameEnd: 1200,
        },
        {
            name: 'drive_trick_07_loop',
            frameStart: 1165,
            frameEnd: 1185,
        },
        {
            name: 'drive_trick_08',
            frameStart: 1200,
            frameEnd: 1250,
        },
        {
            name: 'drive_trick_08_loop',
            frameStart: 1215,
            frameEnd: 1235,
        },
        {
            name: 'drive_trick_09',
            frameStart: 1250,
            frameEnd: 1300,
        },
        {
            name: 'drive_trick_09_loop',
            frameStart: 1265,
            frameEnd: 1285,
        },
        {
            name: 'drive_trick_10',
            frameStart: 1300,
            frameEnd: 1360,
        },
        {
            name: 'drive_trick_10_loop',
            frameStart: 1320,
            frameEnd: 1340,
        },
        {
            name: 'turn_180',
            frameStart: 1370,
            frameEnd: 1400,
        },
        {
            name: 'turn_360',
            frameStart: 1410,
            frameEnd: 1450,
        },
        {
            name: 'salto',
            frameStart: 1460,
            frameEnd: 1500,
        },
    ]

    // store the animations from the model in an array
    animationsFrameLocations.forEach( function(clip) {
        let animClip = THREE.AnimationUtils.subclip ( clips[1], clip.name, clip.frameStart, clip.frameEnd, fps );
        action = mixer.clipAction( animClip );
        allActions.push( action );
    });

    if( allActions ){
        console.log( 'allActions', allActions );
    }

    // here we just play the last animation in the array
    action = mixer.clipAction( allActions[43].getClip() );
    action.play();
});

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputEncoding = THREE.sRGBEncoding;

document.body.appendChild( renderer.domElement );

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}

const socket = io();
socket.on( 'connect', function () {
    console.log('connected');
});
socket.on( 'disconnect', function (message: any) {
    console.log( 'disconnect ' + message );
});
socket.on( 'removeClient', ( id: string ) => {
    scene.remove( scene.getObjectByName(id) as THREE.Object3D );
});

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame( animate );
    if(mixer) {
      mixer.update( clock.getDelta() );
    }
    render();
}

function render() {
    renderer.render( scene, camera );
}

animate();
