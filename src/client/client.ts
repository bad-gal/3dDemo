import * as THREE from 'three';
import Player from './player';
import PlayerLocal from './player_local';
import { Box3 } from 'three';

class Client {
  player: PlayerLocal | undefined;
  scene: THREE.Scene | undefined;
  remotePlayers: any;
  remoteData: any;
  initialisingPlayers: any;
  camera: any;
  renderer: any;
  clock: any;
  keysPressed: { [key: string]: boolean; } = {};
  counter: number;

  constructor() {
    this.player;
    this.scene;
    this.remotePlayers = [];
    this.remoteData = [];
    this.initialisingPlayers = [];
    this.camera;
    this.renderer;
    this.clock;
    this.keysPressed;
    this.clock = new THREE.Clock();
    this.counter = 0;

    // camera
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
    this.camera.position.set( -5, 3, 10);
    this.camera.lookAt( new THREE.Vector3( 0, 2, 0 ) );

    this.scene = new THREE.Scene();
    // background and fog
    this.scene.background = new THREE.Color( 0x0d820d );
    this.scene.fog = new THREE.Fog( 0x0d820d, 2, 36 );

    // lighting
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 20, 0 );
    hemiLight.name = 'hemiLight';
    this.scene.add( hemiLight );

    // ground
    const scale = new THREE.Vector3(100, 1, 100);
    const mesh = new THREE.Mesh( new THREE.BoxGeometry(5000, 0, 5000), new THREE.MeshPhongMaterial( { color: 0x000000 } ));
    mesh.position.set(-1000, -0.5, 0)
    mesh.scale.set(scale.x, scale.y, scale.z)
    mesh.name = 'ground mesh';
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add( mesh );

    // grid
    const grid = new THREE.GridHelper( 150, 120, 0x0d820d, "green" );
    grid.name = 'ground grid';
    this.scene.add( grid );

    // web render
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    document.body.appendChild( this.renderer.domElement );

    this.player = new PlayerLocal( this, this.camera );

    document.addEventListener( 'keydown', ( e ) => {
      if ( this.player?.characterController ) {
        this.keysPressed[e.key] = true;
      }
    });
    
    document.addEventListener( 'keyup', ( e ) => {
      if( this.player?.characterController ) {
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

  updateRemotePlayers( delta: number ) {
    if( this.remoteData === undefined || this.remoteData.length == 0 || this.player === undefined || this.player.id === undefined ) return;

    const game = this;
    const remotePlayers: any[] = [];

    this.remoteData.forEach( function( data: { id: any; model: any, position: any} ) {
      if( game.player?.id != data.id ) {

        // is player being initialised?
        let iplayer;
        
        game.initialisingPlayers.forEach( function( player: any ){
          if( player.id == data.id ) iplayer = player;
        });

        // if not being initialised check the remote players array
        if( iplayer === undefined ) {
          let rplayer: Player | undefined;
          game.remotePlayers.forEach( function( player: any ){
            if( player.id === data.id ) {
              rplayer = player;
            }
          });

          if( rplayer === undefined ){
            // initialise remote player
            game.initialisingPlayers.push( new Player( game, game.camera, data ) );
          } 
          else{
            //player exists
            remotePlayers.push( rplayer );
          }
        }
      }
    });

    this.scene?.children.forEach( function( object ) {
      if( object.userData.remotePlayer && game.getRemotePlayerById( object.userData.id ) === undefined ) {
        game.scene?.remove( object );
      }
    });

    this.remotePlayers = remotePlayers;
    this.remotePlayers.forEach( function( player: any ) {
      player.update( delta );
    });
  }

  getRemotePlayerById( id: string ) {
    if( this.remotePlayers === undefined || this.remotePlayers.length == 0 ) return;

    const players = this.remotePlayers.filter( function( player: { id: string; } ) {
      if( player.id == id ) return true;
    });

    if( players.length == 0 ) return;

    return players[0];
  }

  animate() {
    const game = this;
    let mixerUpdateDelta = this.clock.getDelta();

    requestAnimationFrame( function(){ game.animate() } );

    if ( this.player?.characterController !== undefined ) {
        this.player.characterController.update( mixerUpdateDelta, this.player.collided, this.keysPressed );
    }
  
    if( this.player?.mixer != undefined ) {
        this.player.boxHelper?.geometry.computeBoundingBox();
        this.player.boxHelper?.update();
        this.player.boundaryBox?.copy( this.player.boxHelper.geometry.boundingBox ).applyMatrix4( this.player.boxHelper.matrixWorld );

        this.player.mixer?.update( mixerUpdateDelta );
        this.player.updatePlayerData();
    }
  
    this.updateRemotePlayers( mixerUpdateDelta );

    if ( this.remotePlayers !== undefined ) {
      this.checkCollisions();
    }

    if ( this.player?.thirdPersonCamera !== undefined ) {
      this.player.thirdPersonCamera.update( mixerUpdateDelta );
      if ( this.player.characterController !== undefined ){
        this.player.updateSocket();
      }
    }

    this.renderer.render( this.scene, this.camera );
  }
  
  render() {
    this.renderer.render( this.scene, this.camera );
  }

  checkCollisions() {
    const playerBB = this.player?.boundaryBox;

    for( let remotePlayer of this.remotePlayers ) {
      const remoteBB: Box3 = remotePlayer.boundaryBox;
      remoteBB.copy( remotePlayer.boxHelper.geometry.boundingBox );
      remoteBB.applyMatrix4( remotePlayer.boxHelper.matrixWorld );

      if( playerBB?.intersectsBox( remoteBB ) && this.player?.collided == false ) {
          console.log( 'collision detected!!!!' );

        if( this.player !== undefined ) {
          this.player.collided = true;
        }
      }
    }
  }
}

new Client();
