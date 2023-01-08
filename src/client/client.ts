import * as THREE from 'three';
import Player from './player';
import PlayerLocal from './player_local';

let thisPlayer: PlayerLocal;
let remotePlayers: any = [];
let remoteData: any = [];
let remoteColliders: any = [];
let initialisingPlayers: any = [];
let count = 0;

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

thisPlayer = new PlayerLocal(scene, camera);

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
  }
});

document.addEventListener('keyup', ( e ) => {
  if(thisPlayer.characterControls) {
    keysPressed[e.key] = false;
  }
});

function updateRemotePlayers(delta: number) {
  //DEBUGGING: remoteData is a parameter on scene, but there is no way to access it. Probably need to make this file class
  
  if(remoteData === undefined || remoteData.length == 0 || thisPlayer === undefined || thisPlayer.id === undefined) return;

  // get all remote players from remote data array
  const rPlayers: any[] = [];
  const rColliders: any[] = [];

  remoteData.forEach(function(data: { id: any; model: any}){
    console.log('updateRemotePlayers: data', data)
    if(thisPlayer.id != data.id){
      let iplayer;

      // is player being initialised?
      initialisingPlayers.forEach(function(player: any){
        if(player.id == data.id) iplayer = player;
      });

      // if not being initialised check the remote players array
      if(iplayer === undefined) {
        let rplayer :any;
        remotePlayers.forEach(function(player: { id: any; }){
          if(player.id == data.id) rplayer = player;
        });

        if(rplayer === undefined){
          // initialise player
          initialisingPlayers.push(new Player(scene, camera, data));
          console.log('initialising players', initialisingPlayers)
        } else{
          //player exists
          remotePlayers.push(rplayer);
          rColliders.push(rplayer.collider);
        }
      }
    }
  });

  scene.children.forEach(function(object){
    console.log('updateRemotePlayers', object)
    if(object.userData.remotePlayer && getRemotePlayerById(object.userData.id) === undefined){
      scene.remove(object);
    }
  });

  remotePlayers = rPlayers;
  remoteColliders = rColliders;
  remotePlayers.forEach(function(player: { update: (arg0: number) => void; }){player.update(delta);});
}

function getRemotePlayerById(id: string){
  if(remotePlayers === undefined || remotePlayers.length == 0) return;

  const players = remotePlayers.filter(function(player: { id: string; }){
    if(player.id == id) return true;
  });

  if(players.length == 0) return;

  return players[0];
}

const clock = new THREE.Clock();

function animate() {
  let mixerUpdateDelta = clock.getDelta();
  
  requestAnimationFrame( animate );

  updateRemotePlayers(mixerUpdateDelta);

  // console.log('remotePlayers', remotePlayers)
  if(remotePlayers.length > 0) {
    console.log('remotePlayers', remotePlayers)
  }
  
  if (thisPlayer.characterControls !== undefined) {
    thisPlayer.characterControls.update(mixerUpdateDelta, keysPressed);
  }

  if(thisPlayer.mixer != undefined) {
    thisPlayer.mixer.update(mixerUpdateDelta);
    thisPlayer.move(mixerUpdateDelta);
  }

  

  if (thisPlayer.thirdPersonCamera !== undefined) {
    thisPlayer.thirdPersonCamera.update(mixerUpdateDelta);
    if (thisPlayer.characterControls !== undefined){
      thisPlayer.updateSocket();
    }
  }
 
  render();
}

function render() {
  renderer.render( scene, camera );
}

animate();
