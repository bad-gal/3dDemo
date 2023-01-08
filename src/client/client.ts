import * as THREE from 'three';
import Player from './player';
import PlayerLocal from './player_local';

class Client {
  player: PlayerLocal | undefined;
  scene: THREE.Scene | undefined;
  remotePlayers: any;
  remoteData: any;
  remoteColliders: any;
  initialisingPlayers: any;
  camera: any;
  renderer: any;
  clock: any;
  keysPressed: { [key: string]: boolean; } = {};

  constructor() {
    this.player;
    this.scene;
    this.remotePlayers = [];
    this.remoteData = [];
    this.remoteColliders = [];
    this.initialisingPlayers = [];
    this.camera;
    this.renderer;
    this.clock;
    this.keysPressed;
    this.clock = new THREE.Clock();

    // camera
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
    this.camera.position.set( -5, 3, 10);
    this.camera.lookAt( new THREE.Vector3( 0, 2, 0 ) );

    this.scene = new THREE.Scene();
    // background and fog
    this.scene.background = new THREE.Color( 0xe0e0e0 );
    this.scene.fog = new THREE.Fog( 0xe0e0e0, 20, 100 );

    // lighting
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 20, 0 );
    hemiLight.name = 'hemiLight';
    this.scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( 0, 20, 20);
    dirLight.name = 'dirLight';
    this.scene.add( dirLight );

    // ground
    const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.name = 'ground mesh';
    this.scene.add( mesh );

    // grid
    const grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
    if (grid.material instanceof THREE.Material) {
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
    }
    grid.name = 'ground grid';
    this.scene.add( grid );

    // web render
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    document.body.appendChild( this.renderer.domElement);

    this.player = new PlayerLocal(this, this.camera);

    document.addEventListener( 'keydown', ( e ) => {
      if (this.player?.characterControls) {
        this.keysPressed[e.key] = true;
      }
    });
    
    document.addEventListener('keyup', ( e ) => {
      if(this.player?.characterControls) {
        this.keysPressed[e.key] = false;
      }
    });

    window.addEventListener( 'resize', () => this.onWindowResize(), false );

    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  updateRemotePlayers(delta: number) {
    if(this.remoteData === undefined || this.remoteData.length == 0 || this.player === undefined || this.player.id === undefined) return;

    const game = this;
    const remotePlayers: any[] = [];
    const remoteColliders: any[] = [];

    this.remoteData.forEach(function(data: { id: any; model: any}){
      if(game.player?.id != data.id){

        // is player being initialised?
        let iplayer;
        
        game.initialisingPlayers.forEach(function(player: any){
          if(player.id == data.id) iplayer = player;
        });

        // if not being initialised check the remote players array
        if(iplayer === undefined) {
          let rplayer: Player | undefined;
          game.remotePlayers.forEach(function(player: any){
            if(player.id === data.id) {
              rplayer = player;
            }
          });

          if(rplayer === undefined){
            // initialise player
            game.initialisingPlayers.push(new Player(game, game.camera, data));
          } 
          else{
            //player exists
            remotePlayers.push(rplayer);
            remoteColliders.push(rplayer.collider);
          }
        }
      }
    });

    this.scene?.children.forEach(function(object){
      if(object.userData.remotePlayer && game.getRemotePlayerById(object.userData.id) === undefined){
        game.scene?.remove(object);
      }
    });

    this.remotePlayers = remotePlayers;
    this.remoteColliders = remoteColliders;
    this.remotePlayers.forEach(function(player: any){player.update(delta);});
  }

  getRemotePlayerById(id: string){
    if(this.remotePlayers === undefined || this.remotePlayers.length == 0) return;

    const players = this.remotePlayers.filter(function(player: { id: string; }){
      if(player.id == id) return true;
    });

    if(players.length == 0) return;

    return players[0];
  }

  animate() {
    const game = this;
    let mixerUpdateDelta = this.clock.getDelta();
    
    requestAnimationFrame( function(){game.animate()} );
  
    this.updateRemotePlayers(mixerUpdateDelta);
    
    if (this.player?.characterControls !== undefined) {
      this.player.characterControls.update(mixerUpdateDelta, this.keysPressed);
    }
  
    if(this.player?.mixer != undefined) {
      this.player.mixer.update(mixerUpdateDelta);
      this.player.move(mixerUpdateDelta);
    }
  
    if (this.player?.thirdPersonCamera !== undefined) {
      this.player.thirdPersonCamera.update(mixerUpdateDelta);
      if (this.player.characterControls !== undefined){
        this.player.updateSocket();
      }
    }
    this.renderer.render( this.scene, this.camera );
  }
  
  render() {
    this.renderer.render( this.scene, this.camera );
  }
}

new Client();
