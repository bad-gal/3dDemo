import * as THREE from 'three';
import Player from './player';
import PlayerLocal from './player_local';
import { Box3 } from 'three';
import { io } from 'socket.io-client';
import MenuState from './menu_state';
import WaitingState from './waiting_state';
import ExpelledState from './expelled_state';
import Coin from './coin';

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
  coins: Coin[];
  coinLocations: any[];
  wallBoundaryList: string[];
  coinPickupSound: THREE.Audio | undefined;
  remoteScores: any[];

  constructor() {
    this.player;
    this.scene;
    this.remotePlayers = [];
    this.remoteData = [];
    this.remoteScores = [];
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
    this.coins = [];
    this.coinLocations = [];
    this.wallBoundaryList = [
      'wall_boundary_1', 'wall_boundary_2', 'wall_boundary_3', 'wall_boundary_4'
    ];

    this.socket.once('connect', () => {
      console.log(this.socket.id)
    })

    // get the coin locations from the server
    this.socket.on( 'coinLocations', ( data: any ) => {
      console.log('we have received something from the server', data)
      this.coinLocations = data;
    });

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
      // remove the waiting room contents
      const element: HTMLElement | null = document.getElementById("waiting-room-container");
      if (element !== null) {
        element.remove();
      }

      // show score panel
      const scorePanel = document.getElementById("score-info");
      if ( scorePanel !== null ) scorePanel.style.visibility='visible';

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

      // audio listener
      const listener = new THREE.AudioListener();
      this.camera.add( listener );

      this.coinPickupSound = new THREE.Audio( listener );

      // load a sound and set it as the Audio object's buffer
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load( 'assets/audio/confirmation_001.ogg', ( buffer ) => {
        if (this.coinPickupSound !== undefined) {
          this.coinPickupSound.setBuffer( buffer );
          this.coinPickupSound.setLoop( false );
          this.coinPickupSound.setVolume( 0.5 );
        }
      });

      // Create wall objects around the plane mesh
      const wallGeometry = new THREE.BoxGeometry(150, 5, 1);  // width, height, depth of wall
      const wallMaterial = new THREE.MeshBasicMaterial({color: 0x000000}); // black color
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);

      wall.position.set(0, 0, 75);
      wall.name = 'wall_1'
      this.scene.add(wall);

      const wallHelper = new THREE.BoxHelper( wall, 0xf542dd );
      wallHelper.visible = true;
      let boundaryBox = new THREE.Box3();
      boundaryBox.setFromObject( wallHelper );
      wallHelper.geometry.computeBoundingBox();
      wallHelper.update();
      wallHelper.name = 'wall_boundary_1'
      this.scene.add( wallHelper );

      const wall2 = wall.clone();
      wall2.position.set(0, 0, -75);
      wall2.name = 'wall_2'
      this.scene.add(wall2);

      const wallHelper2 = new THREE.BoxHelper( wall2, 0xf542dd );
      wallHelper2.visible = true;
      let boundaryBox2 = new THREE.Box3();
      boundaryBox2.setFromObject( wallHelper2 );
      wallHelper2.geometry.computeBoundingBox();
      wallHelper2.update();
      wallHelper2.name = 'wall_boundary_2'
      this.scene.add( wallHelper2 );

      const wall3 = wall.clone();
      wall3.rotation.y = Math.PI/2;
      wall3.position.set(-75, 0, 0);
      wall3.name = 'wall_3'
      this.scene.add(wall3);

      const wallHelper3 = new THREE.BoxHelper( wall3, 0xf542dd );
      wallHelper3.visible = true;
      let boundaryBox3 = new THREE.Box3();
      boundaryBox3.setFromObject( wallHelper3 );
      wallHelper3.geometry.computeBoundingBox();
      wallHelper3.update();
      wallHelper3.name = 'wall_boundary_3'
      this.scene.add( wallHelper3 );

      const wall4 = wall3.clone();
      wall4.position.set(75, 0, 0);
      wall4.name = 'wall_4'
      this.scene.add(wall4);

      const wallHelper4 = new THREE.BoxHelper( wall4, 0xf542dd );
      wallHelper4.visible = true;
      let boundaryBox4 = new THREE.Box3();
      boundaryBox4.setFromObject( wallHelper4 );
      wallHelper4.geometry.computeBoundingBox();
      wallHelper4.update();
      wallHelper4.name = 'wall_boundary_4'
      this.scene.add( wallHelper4 );

      // web render
      this.renderer = new THREE.WebGLRenderer( { antialias: true } );
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      document.body.style.overflow = 'hidden';
      document.body.appendChild( this.renderer.domElement );

      this.currentState = this.GAMESTATES.PLAY;
      this.onPlayState();
    }
  };

  onPlayState() {
    this.player = new PlayerLocal( this, this.camera, this.socket );

    this.socket.on( 'removeCoin', ( data: any ) => {
      for (let i = this.coins.length - 1; i >=0; i--) {
        let coin = this.coins[i];
        if(coin.object !== undefined && coin.object.parent !== null) {
          if ( coin.object?.position.x == data[0].x && coin.object?.position.z == data[0].z ) {
            this?.scene?.remove( coin.object.parent.remove(coin.object));
            this.coins.splice(i, 1);
          }
        }
      }
		});

    for ( let i = 0; i < this.coinLocations.length; i++ ) {
      this.coins.push( new Coin( this, this.coinLocations[i] ));
    }

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

    this.createScorePanel();
    this.animate();
  };

  createScorePanel(){
    // create title
    const scorePanelTitle = document.createElement( "p" );
    scorePanelTitle.className = ( 'score-panel-title');
    const titleText = document.createTextNode( "Scores" );
    scorePanelTitle.appendChild( titleText );
    const scorePanel = document.getElementById("score-info");
    if( scorePanel !== null) scorePanel.appendChild( scorePanelTitle );

    // create local player panel
    let localPlayerPanel = document.createElement( "div" );
    localPlayerPanel.className = ( 'score-box' );
    let playerTitle = document.createElement( "div" );
    let playerTitleHeader = document.createElement( "p" );

    if ( this.player !== undefined ) {
      let img = document.createElement( 'img' );
      img.src = "assets/icons/" + this.player.model + ".ico"
      playerTitleHeader.appendChild(img);
    }

    playerTitle.appendChild(playerTitleHeader);

    let localPlayerScoreText = document.createElement("p")
    localPlayerScoreText.id = ( 'local-player-score' );
    let playerScoreText = document.createTextNode( (this.player!.score).toString() );
    localPlayerScoreText.appendChild( playerScoreText );
    playerTitle.appendChild(localPlayerScoreText);
    localPlayerPanel.appendChild(playerTitle);
    if( scorePanel !== null) scorePanel.appendChild(localPlayerPanel)
  }

  updateScorePanel(){
    let localPlayerScore = document.getElementById('local-player-score');
    if(localPlayerScore !== null) {
      localPlayerScore.innerText = this.player!.score.toString();
    }

    //remote players
    if (this.remoteScores.length > 0) {
      const scorePanel = document.getElementById("score-info");

      for(let i = 0; i < this.remoteScores.length; i++) {

        //skip if there is already an element that matches the remote player id
        let remotePanel = document.getElementById( this.remoteScores[i].id);

        if (remotePanel === null) {
          let remotePlayerPanel = document.createElement( "div" );
          remotePlayerPanel.className = ( "score-box" );

          let remoteTitle = document.createElement( 'div' );
          let remoteTitleHeader = document.createElement( 'p' );

          let img = document.createElement( 'img' );
          img.src = "assets/icons/" + this.remoteScores[i].model + ".ico"

          remoteTitleHeader.appendChild(img);
          remoteTitle.appendChild(remoteTitleHeader);

          let remotePlayerScoreText = document.createElement( 'p' );
          remotePlayerScoreText.id = ( this.remoteScores[i].id );
          let playerScoreText = document.createTextNode( (this.remoteScores[i].score).toString() );
          remotePlayerScoreText.appendChild( playerScoreText );

          remoteTitle.appendChild(remotePlayerScoreText);
          remotePlayerPanel.appendChild(remoteTitle);
          if( scorePanel !== null) scorePanel.appendChild(remotePlayerPanel);
        }
        else {
          remotePanel.innerText = this.remoteScores[i].score.toString();
        }
      }
    }
  }

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

    this.remotePlayers.forEach( ( player: any ) => {
      player.update( delta );
    });
    // console.log('REMOTE SCORES', this.remoteScores)
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

    this.updateScorePanel();

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

      this.coins.forEach( coin => coin.update( mixerUpdateDelta ))
      this.updateRemotePlayers( mixerUpdateDelta );

      for( let i = 0; i < this.wallBoundaryList.length; i++ ) {
        if ( this.checkWallCollison( this.wallBoundaryList[i], this.player )) {
          break;
        }
      }

      for (let i = this.coins.length - 1; i >=0; i--) {
        if ( this.checkCoinCollsion(this.coins[i], this.player)){
          let coin = this.coins[i];
          if(coin.object !== undefined && coin.object.parent !== null) {
            let coinPosition = { x: coin.object.position.x, z: coin.object.position.z}
            if ( this.player !== undefined) {
              if ( this.coinPickupSound?.isPlaying ) {
                this.coinPickupSound.stop();
                this.coinPickupSound?.play();
              } else {
                this.coinPickupSound?.play();
              }

              this.player.score += coin.points;
            }
            this.socket.emit('updateCoins', coinPosition);
            game?.scene?.remove( coin.object.parent.remove(coin.object));
            this.coins.splice(i, 1);
          }
        }
      }

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

  checkCoinCollsion( coinModel:any, playerModel:any ) {
    if ( coinModel !== undefined && playerModel !== undefined ){
      if(playerModel.boundaryBox !== undefined){
        const coinBoundingBox = new THREE.Box3().setFromObject(coinModel.boxHelper);
        const playerBoundingBox = playerModel.boundaryBox;

        //check if the two boxes intersect
        return coinBoundingBox.intersectsBox(playerBoundingBox);
      }
    }
  }

  checkWallCollison( boundaryWall: string, playerModel: any ) {
    if( playerModel !== undefined && playerModel.boundaryBox !== undefined ) {
      const wallOne = this.scene?.getObjectByName( boundaryWall );

      if( wallOne !== undefined ) {
        let wallName = boundaryWall.replace( "_boundary_", "_" );
        let wall = this.scene?.getObjectByName( wallName );

        if( wall !== undefined ) {
          if ( wall.position.x !== 0 ) {
            //wall is either to the left or right
            let distance = Math.abs( wall.position.x - playerModel.object.position.x );
            if( distance <= 2 ) {
              const newX = playerModel.object.position.x - (( wall.position.x - playerModel.object.position.x ) *2 )
              playerModel.object.position.set( newX, playerModel.object.position.y, playerModel.object.position.z )
              return true;
            }
          }
          else if ( wall.position.z !== 0 ) {
            //wall is either top or bottom
            let distance = Math.abs( wall.position.z - playerModel.object.position.z );
            if( distance <= 2 ) {
              const newZ = playerModel.object.position.z - (( wall.position.z - playerModel.object.position.z ) *2 )
              playerModel.object.position.set( playerModel.object.position.x, playerModel.object.position.y, newZ )
              return true;
            }
          }
        }
      }
    }
    return false;
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
