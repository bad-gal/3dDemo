import * as THREE from 'three';
import Player from './player';
import PlayerLocal from './player_local';
import { Box3 } from 'three';
import { io } from 'socket.io-client';
import MenuState from './menu_state';
import WaitingState from './waiting_state';
import ExpelledState from './expelled_state';
import Coin from './coin';
import MovingObstacle from './moving_obstacle';
import GroundObstacle from './ground_obstacle';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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
  wallList: string[];
  coins: Coin[];
  coinLocations: any[];
  barrelObstacles: GroundObstacle[];
  barrelObstaclesData: { type: string, position: { x: number, z: number } }[];
  fruitObstaclesData: { type: string, position: { x: number, y: number, z: number }, velocity: { x: number, y: number, z: number}, rotation: { x: number, y: number, z: number } }[];
  fruitObstacles: MovingObstacle[];
  coinPickupSound: THREE.Audio | undefined;
  coinDropSound: THREE.Audio | undefined;
  collisionSound: THREE.Audio | undefined;
  smallCollisionSound: THREE.Audio | undefined;
  largeCoinDropSound: THREE.Audio | undefined;
  backgroundMusic: THREE.Audio | undefined;
  gameTimer: string = '';
  fruitVisibility = false;

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
    this.coins = [];
    this.coinLocations = [];
    this.fruitObstacles = []
    this.fruitObstaclesData = [];
    this.barrelObstacles = [];
    this.barrelObstaclesData = [];
    this.quadRacerList = [];
    this.quadRacerFullList = [
      "camouflage rider", "green rider", "lime rider", "mustard rider",
      "neon rider", "orange rider", "purple rider", "red rider", "red star rider",
      "blue rider",
    ];

    this.wallList = ['wall_0', 'wall_1'];

    this.socket.once('connect', () => {
      console.log(this.socket.id)
    })

    // get the coin locations from the server
    this.socket.on( 'coinLocations', ( data: any ) => {
      this.coinLocations = data;
    });

    // get the ground obstacle locations from the server
    this.socket.on( 'groundObstacleLocations', (data: { type: string, position: { x: number, z: number } }[] ) => {
      this.barrelObstaclesData = data;
    });

    // get the fruit obstacle locations from the server
    this.socket.on('fruitObstaclesDataInitial', (data: { type: string, position: { x: number, y: number, z: number }, velocity: { x: number, y: number, z: number}, rotation: { x: number, y: number, z: number } }[]) => {
      this.fruitObstaclesData = data;
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

      this.createWalls();

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
      this.coinDropSound = new THREE.Audio( listener );
      this.collisionSound = new THREE.Audio( listener );
      this.largeCoinDropSound = new THREE.Audio( listener );
      this.smallCollisionSound = new THREE.Audio( listener );
      this.backgroundMusic = new THREE.Audio( listener );

      // load sounds and set it as the Audio object's buffer
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load( 'assets/audio/confirmation_001.ogg', ( buffer ) => {
        if (this.coinPickupSound !== undefined) {
          this.coinPickupSound.setBuffer( buffer );
          this.coinPickupSound.setLoop( false );
          this.coinPickupSound.setVolume( 0.5 );
        }
      });

      audioLoader.load( 'assets/audio/coin-drop-small.mp3', ( buffer ) => {
        if ( this.coinDropSound !== undefined ) {
          this.coinDropSound.setBuffer( buffer );
          this.coinDropSound.setLoop( false );
          this.coinDropSound.setVolume( 0.5 );
        }
      });

      audioLoader.load( 'assets/audio/impact-large.wav', ( buffer ) => {
        if ( this.collisionSound !== undefined ) {
          this.collisionSound.setBuffer( buffer );
          this.collisionSound.setLoop( false );
          this.collisionSound.setVolume( 0.5 );
        }
      });

      audioLoader.load( 'assets/audio/impact-small.wav', ( buffer ) => {
        if ( this.smallCollisionSound !== undefined ) {
          this.smallCollisionSound.setBuffer( buffer );
          this.smallCollisionSound.setLoop( false );
          this.smallCollisionSound.setVolume( 0.5 );
        }
      });

      audioLoader.load( 'assets/audio/coin-drop.mp3', ( buffer ) => {
        if ( this.largeCoinDropSound !== undefined ) {
          this.largeCoinDropSound.setBuffer( buffer );
          this.largeCoinDropSound.setLoop( false );
          this.largeCoinDropSound.setVolume( 0.5 );
        }
      });

      audioLoader.load( 'assets/audio/song.mp3', ( buffer ) => {
        if ( this.backgroundMusic !== undefined ) {
          this.backgroundMusic.setBuffer( buffer );
          this.backgroundMusic.setLoop( true );
          this.backgroundMusic.setVolume( 0.02 );
          // this.backgroundMusic.play();
        }
      });

      // load checkpoint model
      const loader = new GLTFLoader();
      loader.load( 'assets/checkpoint.glb', (gltf) => {
        gltf.scene.name = 'checkpoint';
        this.scene?.add(gltf.scene);
        gltf.scene.position.set(16.5, 0.1, 0);
        gltf.scene.rotation.y = Math.PI / 2;;
      })

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

    this.socket.on('gameTimer', (data: number) => {
      this.gameTimer = this.formatGameTimer(data);
    });

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

    this.socket.on( 'setVisibilityMoveableObjects', ( visibility: boolean) => {
      console.log('fruits visibility is ', visibility);
      this.fruitVisibility = visibility;
    });

    for ( let i = 0; i < this.coinLocations.length; i++ ) {
      this.coins.push( new Coin( this, this.coinLocations[i] ));
    }

    for( let i = 0; i < this.fruitObstaclesData.length; i++) {
      this.fruitObstacles.push( new MovingObstacle(this, this.fruitObstaclesData[i]))
    }

    for ( let i = 0; i < this.barrelObstaclesData.length; i++ ) {
      this.barrelObstacles.push( new GroundObstacle( this, this.barrelObstaclesData[i]));
    }

    this.socket.emit('fruitStart');

    this.socket.on('remoteFruitObstaclesData', (data:any)=> {
      this.fruitObstaclesData = data;
    })

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
    this.displayTimer();
    this.animate();
  };

  displayTimer() {
    const timerPanel = document.getElementById( 'game-time-info' );
    if ( timerPanel !== null ) {
      timerPanel.innerText = this.gameTimer;
    }
  }

  updateDisplayTimer() {
    let timerText = document.getElementById('game-time-info');
    if( timerText !== null ) timerText.innerText = this.gameTimer;
  }

  createScorePanel() {
    const scorePanel = document.getElementById("score-info");
    if (!scorePanel) {
      return;
    }

    // create title
    const scorePanelTitle = document.createElement("p");
    scorePanelTitle.className = "score-panel-title";
    scorePanelTitle.textContent = "Scores";
    scorePanel.appendChild(scorePanelTitle);

    // create local player panel
    const localPlayerPanel = document.createElement("div");
    localPlayerPanel.className = "score-box";
    const playerTitle = document.createElement("div");

    if (this.player) {
      const img = document.createElement("img");
      img.src = `assets/icons/${this.player.model}.ico`;
      playerTitle.appendChild(img);
    }

    const localPlayerScoreText = document.createElement("p");
    localPlayerScoreText.id = "local-player-score";
    localPlayerScoreText.textContent = `${this.player?.score ?? ""}`;
    playerTitle.appendChild(localPlayerScoreText);
    localPlayerPanel.appendChild(playerTitle);
    scorePanel.appendChild(localPlayerPanel);
  }

  updateScorePanel() {
    const localPlayerScore = document.getElementById('local-player-score');
    if (localPlayerScore) {
      localPlayerScore.innerText = `${this.player?.score ?? ""}`;
    }

    const scorePanel = document.getElementById("score-info");
    if (!scorePanel) return;

    for (const remoteScore of this.remoteScores) {
      const remotePanel = document.getElementById(remoteScore.id);
      if (!remotePanel) {
        const remotePlayerPanel = document.createElement("div");
        remotePlayerPanel.className = "score-box";

        const remoteTitle = document.createElement("div");
        const remoteTitleHeader = document.createElement("p");

        const img = document.createElement("img");
        img.src = `assets/icons/${remoteScore.model}.ico`;

        remoteTitleHeader.appendChild(img);
        remoteTitle.appendChild(remoteTitleHeader);

        const remotePlayerScoreText = document.createElement("p");
        remotePlayerScoreText.id = remoteScore.id;
        remotePlayerScoreText.textContent = `${remoteScore.score}`;

        remoteTitle.appendChild(remotePlayerScoreText);
        remotePlayerPanel.appendChild(remoteTitle);
        scorePanel.appendChild(remotePlayerPanel);
      } else {
        remotePanel.textContent = `${remoteScore.score}`;
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

    this.updateDisplayTimer();
    this.updateScorePanel();

    let wallConnected = false;
    for ( let i = 0; i < this.wallList.length; i++ ) {
      if ( this.player !== undefined ) {
        if ( this.checkWallCollision( this.wallList[i] )) {
          console.log('wall collision');
          wallConnected = true;
          if ( this.collisionSound?.isPlaying ) {
            this.collisionSound.stop();
            this.collisionSound.play();
          } else {
            this.collisionSound?.play();
          }
          break;
        }
      }
    }
    if ( !wallConnected && this.player?.collided && this.player.collided.object == 'wall' ) {
      this.player.collided.value = false;
      this.player.collided.object = '';
      if ( this.player.characterController !== undefined ) {
        this.player.characterController.barrelCollisionCounter = 0;
      }
      console.log('no wall collision')
    }

    //THIS COULD WORK WITH SOME TWEAKING. WE SHOULD BE ABLE TO DETECT IF THE PLAYER IS ON THE PLANE, IF NOT THEY FALL
    //WHEN THE Y VALUE REACHES 4.5, WE RESET THE PLAYER AND THEY GO BACK TO THE BEGINNING

    // this.boxPosition.x -= 0.1;


    // if(this.boxPosition.x >= 0) {
    //   this.onPlane = true;
    // } else {
    //   this.boxPosition.y = 0.5;
    //   this.boxVelocity.y *= -0.9;
    //   this.boxVelocity.add(this.boxAcceleration);
    // this.boxPosition.add(this.boxVelocity);
    //   this.onPlane = false;
    // }

    // if(!this.onPlane) this.boxPosition.y += this.boxVelocity.y * 0.01;
    // this.box.position.copy(this.boxPosition);
    // console.log(this.boxPosition)

    if ( this.currentState === this.GAMESTATES.PLAY ) {
      let mixerUpdateDelta = this.clock.getDelta();

      requestAnimationFrame( function(){ game.animate() } );

      if ( this.player?.characterController !== undefined ) {
        this.player.characterController.update( mixerUpdateDelta, this.player.collided, this.keysPressed );
        // run blink animation after player on player collision
        if( this.player.collided.value == true && this.player.collided.object == 'player') {
          this.player.mixer?.addEventListener( 'finished', function() {
            if ( game.player?.skinnedMesh !== undefined ) {
              game.onBlinkPlayer( game.BLINK_AMOUNT, game.player?.skinnedMesh, game.player );
            }
          });
        }
      }

      this.coins.forEach( coin => coin.update( mixerUpdateDelta ))

      this.fruitObstacles.forEach( (fruit, index) => fruit.update(this.fruitObstaclesData[index], this.fruitVisibility));

      this.checkMovingFruitCollision();

      if (this.player?.collided.value == true && this.player.collided.object == 'fruit') {
        this.player.mixer?.addEventListener( 'finished', function() {
          if ( game.player?.skinnedMesh !== undefined ) {
            game.onBlinkPlayer( game.BLINK_AMOUNT, game.player?.skinnedMesh, game.player );
          }
        });
      }

      this.barrelObstacles.forEach( barrel => barrel.update( mixerUpdateDelta ));

      this.updateRemotePlayers( mixerUpdateDelta );

      let found = false
      for(let i = 0; i < this.barrelObstacles.length; i++) {
        if(this.player !== undefined) {
          if (this.checkBarrelCollision(this.barrelObstacles[i], this.player)){
            console.log('PLAYER COLLIDED WITH BARREL')
            console.log('velocity',this.player.characterController?.velocity)
            found = true;
            break;
          }
        }
      }

      if (found == false && this.player?.collided.value == true && this.player?.collided.object == 'barrel') {
        this.player.collided.value = false;
        this.player.collided.object = '';
        if(this.player.characterController !== undefined) {
          this.player.characterController.barrelCollisionCounter = 0;
        }
        console.log('no barrel collision')
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
          if( rPlayer.collided.value == true && rPlayer.collided.object == 'player') {
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

  checkWallCollision( wall: string ) {
    if( this.player !== undefined && this.player.object !== undefined && this.player?.collided.value == false ) {
      const wallObject = this.scene?.getObjectByName( wall );

      if( wallObject !== undefined ) {
        const collisionMargin = 0.3;
        const wallBox = new THREE.Box3().setFromObject( wallObject );
        const playerBox = new THREE.Box3().setFromObject( this.player.object );

        const collisionDetected = playerBox.intersectsBox( wallBox.expandByScalar( -collisionMargin ));

        if ( collisionDetected ) {
          this.player.collided.value = true;
          this.player.collided.object = 'wall';
          return true;
        }
      }
    }
    return false;
  }

  checkBarrelCollision(barrelModel: GroundObstacle, playerModel: PlayerLocal) {
    if(playerModel.collided.value == false) {

      if ( barrelModel !== undefined && playerModel !== undefined ){
        if(barrelModel.object !== undefined && playerModel.object !== undefined){

          const collisionMargin = 0.3;
          const barrelBox = new THREE.Box3().setFromObject(barrelModel.object);
          const playerBox = new THREE.Box3().setFromObject(playerModel.object);

          // Check if the two objects intersect with a margin for error
          const collisionDetected =playerBox.intersectsBox(barrelBox.expandByScalar(-collisionMargin));

          if(collisionDetected) {
            playerModel.collided.value = true;
            playerModel.collided.object = 'barrel';

            //play impact sound
            if ( this.smallCollisionSound?.isPlaying) {
              this.smallCollisionSound.stop();
              this.smallCollisionSound?.play();
            } else {
              this.smallCollisionSound?.play()
            }

            if (playerModel.score >= Math.abs(barrelModel.points)) {
              playerModel.score += barrelModel.points;
              if ( this.coinDropSound?.isPlaying) {
                this.coinDropSound.stop();
                this.coinDropSound?.play();
              } else {
                this.coinDropSound?.play()
              }
            }
            return true;
          }
        }
      }
    }
    return false
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

      if( playerBB?.intersectsBox( remoteBB ) && this.player?.collided.value == false ) {
        const distance = this.player?.object?.position?.distanceTo( remotePlayer.object.position );
        if(distance !== undefined){
          if( distance < 1 ) {
            if( this.player !== undefined ) {
              this.player.collided.value = true;
              this.player.collided.object = 'player';

              //play impact sound
              if ( this.collisionSound?.isPlaying) {
                this.collisionSound.stop();
                this.collisionSound?.play();
              } else {
                this.collisionSound?.play()
              }

              // player loses 30% of their coins
              if ( this.player.score > 0 ) {

                if ( this.largeCoinDropSound?.isPlaying) {
                  this.largeCoinDropSound.stop();
                  this.largeCoinDropSound?.play();
                } else {
                  this.largeCoinDropSound?.play()
                }

                this.player.score = this.player.score - ( Math.round(this.player.score * 0.3 ));
                console.log('player score', this.player.score)
              }
            }
          }
        }
      }
    }
  }

  checkMovingFruitCollision() {
    if (this.fruitVisibility) {
      if (this.player !== undefined && this.player.object !== undefined) {
        const playerBox = new THREE.Box3().setFromObject(this.player.object);

        for ( let i = 0; i < this.fruitObstacles.length; i++ ) {
          let obstacle = this.fruitObstacles[i];

          if ( obstacle !== undefined && obstacle.object !== undefined) {
          let fruitBox = new THREE.Box3().setFromObject( obstacle.object );

            if ( playerBox.intersectsBox(fruitBox) && this.player.collided.value == false ) {
              this.player.collided.value = true;
              this.player.collided.object = 'fruit';
              console.log('fruit collides with player')

              //play impact sound
              if ( this.collisionSound?.isPlaying) {
                this.collisionSound.stop();
                this.collisionSound?.play();
              } else {
                this.collisionSound?.play()
              }

              // player loses 50% of their coins
              // we only play the coin sound if the player has a positive score
              if ( this.player.score > 0 ) {
                if ( this.largeCoinDropSound?.isPlaying) {
                  this.largeCoinDropSound.stop();
                  this.largeCoinDropSound?.play();
                } else {
                  this.largeCoinDropSound?.play()
                }
                this.player.score = this.player.score - ( Math.round( this.player.score * 0.5 ));
                console.log( 'player score after collision with fruit', this.player.score)
              }
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

  formatGameTimer(timer: number): string {
    if (timer < 10) {
      return `0:0${timer}`;
    } else if (timer < 60) {
      return `0:${timer}`;
    } else if (timer < 70) {
      return `1:0${timer - 60}`;
    } else if (timer < 120) {
      return `1:${timer - 60}`;
    } else {
      return '2:00';
    }
  }
}

new Client();
