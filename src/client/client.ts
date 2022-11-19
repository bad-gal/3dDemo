import * as THREE from 'three';
import { io } from 'socket.io-client';

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

function animate() {
    requestAnimationFrame( animate );

    render();
}

function render() {
    renderer.render( scene, camera );
}

animate();
