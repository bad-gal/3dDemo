import * as THREE from 'three';
import { io } from 'socket.io-client';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75,window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
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
