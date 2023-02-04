import * as THREE from 'three';
import Player from './player';
import PlayerLocal from './player_local';
import { Box3 } from 'three';
import { io } from 'socket.io-client';
import MenuState from './menu_state';
import WaitingState from './waiting_state';
import ExpelledState from './expelled_state';

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
  BLINK_AMOUNT: number;
  currentState: string;
  GAMESTATES = {
    MENU: 'menu',
    WAITING_ROOM: 'waiting-room',
    INIT: 'initial',
    PLAY: 'play',
    EXPELLED: 'expelled',
  }
  socket = io();
  initPlayerId: any;
  quadRacerList: any;
  quadRacerFullList: string[];
  userModel: string;

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
    this.BLINK_AMOUNT = 11;
    this.initPlayerId;
    this.userModel = '';
    this.quadRacerList = [];
    this.quadRacerFullList = [
      "camouflage rider", "green rider", "lime rider", "mustard rider",
      "neon rider", "orange rider", "purple rider", "red rider", "red star rider",
      "blue rider",
    ];

    this.socket.once('connect', () => {
      console.log(this.socket.id)
    })

    window.addEventListener( 'resize', () => this.onWindowResize(), false );
    this.currentState = this.GAMESTATES.MENU;
    this.onMenuState();
  }

  onWindowResize() {
    if ( this.currentState === this.GAMESTATES.INIT || this.currentState === this.GAMESTATES.PLAY ) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    else {
      // all other states should handle window resize without the camera or renderer
      window.resizeTo( window.innerWidth, window.innerHeight );
    }
  }

  onMenuState() {
    const gameState = new MenuState(this);

    gameState.onMenuState();
  };

  onWaitingRoomState() {
    const gameState = new WaitingState(this);

    gameState.onWaitingRoomState();
  }

  onExpelledState() {
    const gameState = new ExpelledState(this);

    gameState.onExpelledState();
  }

  onInitState() {
    if ( this.currentState === 'initial' ) {
      // console.log('In init state')
      // remove the waiting room contents
      const element: HTMLElement | null = document.getElementById("waiting-room-container");
      if (element !== null) {
        element.remove();   
      }
      
      // set up 3D space
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
      const mesh = new THREE.Mesh( new THREE.BoxGeometry( 5000, 0, 5000 ), new THREE.MeshPhongMaterial( { color: 0x000000 } ));
      mesh.position.set( -1000, -0.5, 0 )
      mesh.scale.set( scale.x, scale.y, scale.z )
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

      this.currentState = this.GAMESTATES.PLAY;
      this.onPlayState();
    }
  };

  onPlayState() {
    this.player = new PlayerLocal( this, this.camera, this.socket );

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

    this.animate();
  };

  updateRemotePlayers( delta: number ) {
    if( this.remoteData === undefined || this.remoteData.length == 0 || this.player === undefined || this.player.id === undefined ) return;

    const game = this;
    const remotePlayers: any[] = [];

    this.remoteData.forEach( function( data: { id: any; model: any, position: any } ) {
      if( game.player?.id != data.id ) {

        // is player being initialised?
        let iplayer;
        
        game.initialisingPlayers.forEach( function( player: any ){
          if( player.id == data.id ) iplayer = player;
        });

        // if not being initialised check the remote players array
        if( iplayer === undefined ) {
          let rplayer: Player | undefined;
          game.remotePlayers.forEach( function( player: any ) {
            if( player.id === data.id ) {
              rplayer = player;
            }
          });

          if( rplayer === undefined ){
            // initialise remote player
            game.initialisingPlayers.push( new Player( game, game.camera, data ));
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
    
    if ( this.currentState === this.GAMESTATES.PLAY ) {
      let mixerUpdateDelta = this.clock.getDelta();

      requestAnimationFrame( function(){ game.animate() } );

      if ( this.player?.characterController !== undefined ) {
        this.player.characterController.update( mixerUpdateDelta, this.player.collided, this.keysPressed );
        // run blink animation after player on player collision
        if( this.player.collided ) {
          this.player.mixer?.addEventListener( 'finished', function() {
            if ( game.player?.skinnedMesh !== undefined ) {
              game.onBlinkPlayer( game.BLINK_AMOUNT, game.player?.skinnedMesh, game.player );
            }
          });
        }
      }
  
      this.updateRemotePlayers( mixerUpdateDelta );

      if ( this.remotePlayers !== undefined ) {
        this.checkCollisions();
        this.remotePlayers.forEach(( rPlayer: Player ) => {
          // run blink animation after player on player collision
          if( rPlayer.collided ) {
            rPlayer.mixer?.addEventListener( 'finished', function() {
              game.onBlinkPlayer( game.BLINK_AMOUNT, rPlayer?.skinnedMesh, rPlayer );
            });
          }
        });
      }

      if( this.player?.mixer != undefined ) {
          this.player.boxHelper?.geometry.computeBoundingBox();
          this.player.boxHelper?.update();
          this.player.boundaryBox?.copy( this.player.boxHelper.geometry.boundingBox ).applyMatrix4( this.player.boxHelper.matrixWorld );

          this.player.mixer?.update( mixerUpdateDelta );
          this.player.updatePlayerData();
      }
  
      if ( this.player?.thirdPersonCamera !== undefined ) {
        this.player.thirdPersonCamera.update( mixerUpdateDelta );
        if ( this.player.characterController !== undefined ) {
          this.player.updateSocket();
        }
      }

      this.renderer.render( this.scene, this.camera );
    }
  }
  
  render() {
    this.renderer.render( this.scene, this.camera );
  }

  checkCollisions() {
    this.player?.boxHelper?.geometry.computeBoundingBox();
    this.player?.boxHelper?.update();
    this.player?.boundaryBox?.copy( this.player.boxHelper.geometry.boundingBox ).applyMatrix4( this.player.boxHelper.matrixWorld );
    const playerBB = this.player?.boundaryBox;

    for( let remotePlayer of this.remotePlayers ) {
      remotePlayer?.boxHelper?.geometry.computeBoundingBox();
      remotePlayer?.boxHelper?.update();
      remotePlayer?.boundaryBox?.copy( remotePlayer.boxHelper.geometry.boundingBox ).applyMatrix4( remotePlayer.boxHelper.matrixWorld );

      const remoteBB: Box3 = remotePlayer.boundaryBox;

      if( playerBB?.intersectsBox( remoteBB ) && this.player?.collided == false ) {
        // console.log('intersects but not necessarily collided')
        const distance = this.player?.object?.position?.distanceTo( remotePlayer.object.position );
        if(distance !== undefined){
          if( distance < 1 ) {
            // console.log( 'collision detected!!!!' );

            if( this.player !== undefined ) {
              // console.log('player is going to be set as collided - the distance is', distance)
              this.player.collided = true;
            }
          }
        }
      }
    }
  }

  onBlinkPlayer( numberOfIterations: number, skinnedMesh: THREE.SkinnedMesh[], player: Player ) {
    let iterationCounter = 0;

    this.setBlink( iterationCounter, numberOfIterations, skinnedMesh, player );
  }

  changePlayerOpacity( skinnedMesh: THREE.SkinnedMesh[], counter: number ) {
    skinnedMesh?.forEach( ( mesh ) => {
      let opacityScale = counter % 2 === 0 ? 0.5 : 1;
        //@ts-ignore
        mesh.material.opacity = opacityScale;
    })
  }

  setBlink( iteratorIndex: number, numberOfIterations: number, skinnedMesh: THREE.SkinnedMesh[], player: Player ) {
    const game = this;
    setTimeout( function() {
      game.changePlayerOpacity( skinnedMesh, iteratorIndex );
      iteratorIndex++;

      if ( iteratorIndex >= numberOfIterations ) {
        // console.log('we have finished with the blinking', player)
        player.resetCollidedPlayer();
        return;
      }
      game.setBlink( iteratorIndex, numberOfIterations, skinnedMesh, player );
    }, 300)
  }
}

new Client();
