import * as THREE from 'three';
import { io } from 'socket.io-client';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75,window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true } );

const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}
// TODO: This kinda works socket is polling for messages but fails
// because there are no connection being made via the server
let myId = '';
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

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    render();
}

function render() {
    renderer.render( scene, camera );
}

animate();
