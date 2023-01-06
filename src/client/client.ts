import * as THREE from 'three';
import { io } from 'socket.io-client';
import { Player } from './player';
import { PlayerLocal } from './player_local';

const socket = io();
let players: any = [];

//new code
let thisPlayer: PlayerLocal;
let remotePlayers: any = [];

// camera
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
camera.position.set( -5, 3, 10);
camera.lookAt( new THREE.Vector3( 0, 2, 0 ) );
console.log('beginning camera', camera.position)

const scene = new THREE.Scene();
// background and fog
scene.background = new THREE.Color( 0xe0e0e0 );
scene.fog = new THREE.Fog( 0xe0e0e0, 20, 100 );

// lighting
const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
hemiLight.position.set( 0, 20, 0 );
hemiLight.name = 'hemiLight';
scene.add( hemiLight );

const dirLight = new THREE.DirectionalLight( 0xffffff );
dirLight.position.set( 0, 20, 20);
dirLight.name = 'dirLight';
scene.add( dirLight );

// ground
const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false }));
mesh.rotation.x = -Math.PI / 2;
mesh.name = 'ground mesh';
scene.add( mesh );

// grid
const grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
if (grid.material instanceof THREE.Material) {
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
}
grid.name = 'ground grid';
scene.add( grid );

// web render
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputEncoding = THREE.sRGBEncoding;

document.body.appendChild( renderer.domElement );

thisPlayer = new PlayerLocal(scene, camera, undefined);

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}

let keysPressed: { [key: string]: boolean; } = {};

document.addEventListener( 'keydown', ( e ) => {
  if (thisPlayer.characterControls) {
    keysPressed[e.key] = true;
    console.log(keysPressed)
  }
});

document.addEventListener('keyup', ( e ) => {
  if(thisPlayer.characterControls) {
    keysPressed[e.key] = false;
  }
});

socket.on( 'connect', function () {
  console.log('connected', socket.id);
});

socket.on( 'newPlayer', (client) => {
  players.push(client);
  console.log('new player added', client)
  
});

socket.on( 'disconnect', function (message: any) {
  console.log( 'disconnect ' + message );
  // the following code gets handled in the socket.on 'clients' function, so this isn't needed
  // players = players.filter((player: { id: string; }) => player.id !== socket.id)
  // console.log('players left:', players)
});

socket.on('clients', (clients: any = []) => {
  // we only want to update players if different from clients given to us by the server
  if(JSON.stringify(clients) != JSON.stringify(players)) {
    players = clients;
    console.log('players', players)
  }
});

socket.on( 'removeClient', ( id: string ) => {
  scene.remove( scene.getObjectByName(id) as THREE.Object3D );
});

const clock = new THREE.Clock();

function animate() {
  let mixerUpdateDelta = clock.getDelta();
  
  if (thisPlayer.characterControls !== undefined) {
    thisPlayer.characterControls.update(mixerUpdateDelta, keysPressed);
  }

  if(thisPlayer.mixer != undefined) {
    thisPlayer.mixer.update(mixerUpdateDelta);
    thisPlayer.move(mixerUpdateDelta);
  }

  requestAnimationFrame( animate );

  if (thisPlayer.thirdPersonCamera !== undefined) {
    thisPlayer.thirdPersonCamera.update(mixerUpdateDelta);
    if (thisPlayer.characterControls !== undefined){
      const userData = {
        position: thisPlayer.characterControls.model.position,
        quaternion: thisPlayer.characterControls.model.quaternion,
        action: thisPlayer.characterControls.currentAction,
      }
      socket.emit('updateClient', userData);
    }
  }
 
  render();
}

function render() {
  renderer.render( scene, camera );
}

animate();
