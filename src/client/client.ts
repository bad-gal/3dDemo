import * as THREE from 'three';
import Player from './player';
import PlayerLocal from './player_local';
import { Box3 } from 'three';
import { io } from 'socket.io-client';
import MenuState from './menu_state';
import WaitingState from './waiting_state';
import ExpelledState from './expelled_state';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import * as CANNON from 'cannon-es'
import CannonDebugRenderer from 'cannon-es-debugger';
import RaceTrack from './racetrack';

// https://fertile-soil-productions.itch.io/modular-racekart-track
// https://github.com/donmccurdy/three-to-cannon
// https://discourse.threejs.org/t/how-can-i-make-colliders-from-glb-objects-with-cannon-js/17059/4
// https://pmndrs.github.io/cannon-es/docs/index.html
// https://pmndrs.github.io/cannon-es/docs/modules.html



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
  coinPickupSound: THREE.Audio | undefined;
  coinDropSound: THREE.Audio | undefined;
  collisionSound: THREE.Audio | undefined;
  smallCollisionSound: THREE.Audio | undefined;
  largeCoinDropSound: THREE.Audio | undefined;
  revivePlayerSound: THREE.Audio | undefined;
  playerFallenSound: THREE.Audio | undefined;
  gameTimer: string = '';
  fruitVisibility = false;
  checkpointReached = false;
  physicsWorld  = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
  });

  cannonDebugRenderer: undefined;

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

    this.socket.once('connect', () => {
      console.log(this.socket.id)
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

      // camera
      this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
      this.camera.position.set( -5, 3, 10);
      this.camera.lookAt( new THREE.Vector3( 0, 2, 0 ) );

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xffffff);

      // lighting
      const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
      hemiLight.position.set( 0, 20, 0 );
      hemiLight.name = 'hemiLight';
      this.scene.add( hemiLight );

      this.createRaceTrack(this.scene, this.physicsWorld);

      // web render
      this.renderer = new THREE.WebGLRenderer( { antialias: true } );
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      document.body.style.overflow = 'hidden';
      document.body.appendChild( this.renderer.domElement );

      // Debug Renderer for Physics
      this.cannonDebugRenderer = new (CannonDebugRenderer  as any)(this.scene, this.physicsWorld);

      this.currentState = this.GAMESTATES.PLAY;
      this.onPlayState();
    }
  };

  createRaceTrack(scene: THREE.Scene, physicsWorld: CANNON.World) {
    const raceTrack = new RaceTrack(scene, physicsWorld);
    raceTrack.create();
  }

  createAudio() {
    const listener = new THREE.AudioListener();
    this.camera.add(listener);

    this.coinPickupSound = new THREE.Audio( listener );
    this.coinDropSound = new THREE.Audio( listener );
    this.collisionSound = new THREE.Audio( listener );
    this.largeCoinDropSound = new THREE.Audio( listener );
    this.smallCollisionSound = new THREE.Audio( listener );
    this.revivePlayerSound = new THREE.Audio( listener );
    this.playerFallenSound = new THREE.Audio( listener );

    // load sounds and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/audio/confirmation_001.ogg', (buffer) => {
      if (this.coinPickupSound !== undefined) {
        this.coinPickupSound.setBuffer(buffer);
        this.coinPickupSound.setLoop(false);
        this.coinPickupSound.setVolume(0.5);
      }
    });

    audioLoader.load('assets/audio/coin-drop-small.mp3', (buffer) => {
      if (this.coinDropSound !== undefined) {
        this.coinDropSound.setBuffer(buffer);
        this.coinDropSound.setLoop(false);
        this.coinDropSound.setVolume(0.5);
      }
    });

    audioLoader.load('assets/audio/impact-large.wav', (buffer) => {
      if (this.collisionSound !== undefined) {
        this.collisionSound.setBuffer(buffer);
        this.collisionSound.setLoop(false);
        this.collisionSound.setVolume(0.5);
      }
    });

    audioLoader.load('assets/audio/impact-small.wav', (buffer) => {
      if (this.smallCollisionSound !== undefined) {
        this.smallCollisionSound.setBuffer(buffer);
        this.smallCollisionSound.setLoop(false);
        this.smallCollisionSound.setVolume(0.5);
      }
    });

    audioLoader.load('assets/audio/coin-drop.mp3', (buffer) => {
      if (this.largeCoinDropSound !== undefined) {
        this.largeCoinDropSound.setBuffer(buffer);
        this.largeCoinDropSound.setLoop(false);
        this.largeCoinDropSound.setVolume(0.5);
      }
    });

    audioLoader.load('assets/audio/mixkit-fairy-glitter-867.wav', (buffer) => {
      if (this.revivePlayerSound !== undefined) {
        this.revivePlayerSound.setBuffer(buffer);
        this.revivePlayerSound.setLoop(false);
        this.revivePlayerSound.setVolume(0.5);
      }
    });

    audioLoader.load('assets/audio/mixkit-cartoon-falling-eco-407.wav', (buffer) => {
      if (this.playerFallenSound !== undefined) {
        this.playerFallenSound.setBuffer(buffer);
        this.playerFallenSound.setLoop(false);
        this.playerFallenSound.setVolume(0.5);
      }
    });

  }

  createWalls() {
    const geometry = new THREE.BoxGeometry( 20, 2, 2 );
    const material = new THREE.MeshBasicMaterial( { color: 0x3b030f });
    let wallZ = 20;
    for (let i = 0; i < 2; i++ ) {
      let wall = new THREE.Mesh( geometry, material );
      wall.position.set( 8.5, 1, wallZ );
      wall.name = 'wall_' + i;
      this.scene?.add( wall );
      wallZ += -375;
    }
  }

  private createTrack(scene: THREE.Scene) {
    const geometry = new THREE.PlaneGeometry(20, 100);
    const geometry2 = new THREE.PlaneGeometry(20, 140);
    const geometry4 = new THREE.PlaneGeometry(20, 120);
    const material = new THREE.MeshBasicMaterial({ color: 0x0f0f0e, side: THREE.DoubleSide });

    //==========================
    //    TRACKS
    //==========================

    //main runway
    const plane = new THREE.Mesh(geometry4, material);
    plane.rotation.x = Math.PI / 2;
    plane.position.set(8.5, 0, -38);
    plane.name = 'track';
    scene.add(plane);

    // first horizontal runway
    const plane2 = new THREE.Mesh(geometry2, material);
    plane2.rotation.x = Math.PI / 2;
    plane2.rotation.z = Math.PI / 2;
    plane2.position.set(8.5, 0, -108);
    plane2.name = 'track';
    scene.add(plane2);

    // right runway
    const planeRight = new THREE.Mesh(geometry, material);
    planeRight.rotation.x = Math.PI / 2;
    planeRight.position.set(68.5, 0, -168);
    planeRight.name = 'track';
    scene.add(planeRight);

    // left runway
    const planeLeft = new THREE.Mesh(geometry, material);
    planeLeft.rotation.x = Math.PI / 2;
    planeLeft.position.set(-51.5, 0, -168);
    planeLeft.name = 'track';
    scene.add(planeLeft);

    // second horizontal runway
    const plane5 = new THREE.Mesh(geometry2, material);
    plane5.rotation.x = Math.PI / 2;
    plane5.rotation.z = Math.PI / 2;
    plane5.position.set(8.5, 0, -228);
    plane5.name = 'track';
    scene.add(plane5);

    // final runway
    const plane6 = new THREE.Mesh(geometry4, material);
    plane6.rotation.x = Math.PI / 2;
    plane6.position.set(8.5, 0, -298);
    plane6.name = 'track';
    scene.add(plane6);

    // load checkpoint model
    const loader = new GLTFLoader();
    loader.load('assets/checkpoint.glb', (gltf) => {
      gltf.scene.name = 'checkpoint';
      scene?.add(gltf.scene);
      gltf.scene.position.set(16.5, 0.1, 0);
      gltf.scene.rotation.y = Math.PI / 2;

      // clone the model
      const checkpoint = clone(gltf.scene);
      checkpoint.position.set(16.5, 0.1, -333);
      scene?.add(checkpoint);
    });

    //==========================
    //  CENTRAL ROAD MARKINGS
    //==========================

    const geometry3 = new THREE.PlaneGeometry(0.2, 1)
    const material2 = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

    // main runway markings
    let markZ = -3;
    for ( let i = 0; i < 32; i++ ){
      let roadMark = new THREE.Mesh(geometry3, material2)
      roadMark.rotation.x = Math.PI / 2;
      roadMark.position.set(8.5, 0.01, markZ);
      scene.add(roadMark);
      markZ -= 3;
    }

    // left runway markings
    let markX = -120;
    for ( let i = 0; i < 33; i++ ){
      let roadMark = new THREE.Mesh(geometry3, material2)
      roadMark.rotation.x = Math.PI / 2;
      roadMark.position.set(-51.5, 0.01, markX);
      scene.add(roadMark);
      markX -= 3;
    }

    // right runway markings
    markX = -120;
    for ( let i = 0; i < 33; i++ ){
      let roadMark = new THREE.Mesh(geometry3, material2)
      roadMark.rotation.x = Math.PI / 2;
      roadMark.position.set(68.5, 0.01, markX);
      scene.add(roadMark);
      markX -= 3;
    }

    // first horizontal runway markings
    markX = -60;
    for ( let i = 0; i < 46; i++ ){
      let roadMark = new THREE.Mesh(geometry3, material2)
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(markX, 0.01, -108);
      scene.add(roadMark);
      markX +=3;
    }

    // second horizontal runway markings
    markX = -60;
    for ( let i = 0; i < 46; i++ ){
      let roadMark = new THREE.Mesh(geometry3, material2)
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(markX, 0.01, -228);
      scene.add(roadMark);
      markX +=3;
    }

    // final runway markings
    markZ = -240;
    for ( let i = 0; i < 31; i++ ){
      let roadMark = new THREE.Mesh(geometry3, material2)
      roadMark.rotation.x = Math.PI / 2;
      roadMark.position.set(8.5, 0.01, markZ);
      scene.add(roadMark);
      markZ -= 3;
    }

    //==========================
    //  TURN MARKINGS
    //==========================

    //main runway
    let lineX = -0.5
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -98);
      scene.add(roadMark);
      lineX += 1.5
    }
    lineX = -0.5
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -97);
      scene.add(roadMark);
      lineX += 1.5
    }

    // runway left top
    lineX = -50.5
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -119);
      scene.add(roadMark);
      lineX += 1.5
    }
    lineX = -50.5
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -118);
      scene.add(roadMark);
      lineX += 1.5
    }

    //runway left bottom
    lineX = -52.5
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -217);
      scene.add(roadMark);
      lineX -= 1.5
    }
    lineX = -52.5
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -218);
      scene.add(roadMark);
      lineX -= 1.5
    }

    //runway right top
    lineX = 77.5
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -119);
      scene.add(roadMark);
      lineX -= 1.5
    }
    lineX = 77.5
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -118);
      scene.add(roadMark);
      lineX -= 1.5
    }

    //runway right bottom
    lineX = 60
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -218);
      scene.add(roadMark);
      lineX += 1.5
    }
    lineX = 60
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -217);
      scene.add(roadMark);
      lineX += 1.5
    }

    //final runway top
    lineX = 9.5
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -238);
      scene.add(roadMark);
      lineX += 1.5
    }
    lineX = 9.5
    for ( let i = 0; i < 6; i++ ) {
      let roadMark = new THREE.Mesh( geometry3, material2 )
      roadMark.rotation.x = Math.PI / 2;
      roadMark.rotation.z = Math.PI / 2;
      roadMark.position.set(lineX, 0.01, -239);
      scene.add(roadMark);
      lineX += 1.5
    }
  }

  onPlayState() {
    this.player = new PlayerLocal( this, this.camera, this.socket );

    this.socket.on('gameTimer', (data: number) => {
      this.gameTimer = this.formatGameTimer(data);
    });

    // this.socket.on( 'removeCoin', ( data: any ) => {
    //   for (let i = this.coins.length - 1; i >=0; i--) {
    //     let coin = this.coins[i];
    //     if(coin.object !== undefined && coin.object.parent !== null) {
    //       if ( coin.object?.position.x == data[0].x && coin.object?.position.z == data[0].z ) {
    //         this?.scene?.remove( coin.object.parent.remove(coin.object));
    //         this.coins.splice(i, 1);
    //       }
    //     }
    //   }
		// });

    // this.socket.on( 'setVisibilityMoveableObjects', ( visibility: boolean) => {
    //   console.log('fruits visibility is ', visibility);
    //   this.fruitVisibility = visibility;
    // });

    // for ( let i = 0; i < this.coinLocations.length; i++ ) {
    //   this.coins.push( new Coin( this, this.coinLocations[i] ));
    // }

    // for( let i = 0; i < this.fruitObstaclesData.length; i++) {
    //   this.fruitObstacles.push( new MovingObstacle(this, this.fruitObstaclesData[i]))
    // }

    // for ( let i = 0; i < this.barrelObstaclesData.length; i++ ) {
    //   this.barrelObstacles.push( new GroundObstacle( this, this.barrelObstaclesData[i]));
    // }

    // this.socket.emit('fruitStart');

    // this.socket.on('remoteFruitObstaclesData', (data:any)=> {
    //   this.fruitObstaclesData = data;
    // })

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

  updatePhysics() {
    if (this.physicsWorld !== undefined){
      // Run the simulation independently of framerate every 1 / 60 ms
      this.physicsWorld.fixedStep();
      if(this.counter === 0) {
        console.log('physicsWorld', this.physicsWorld)
        this.counter = 1;
      }

      this.player?.characterController?.updatePhysicsBody();
    }
  }

  animate() {
    const game = this;

    this.updatePhysics();

    this.updateDisplayTimer();
    this.updateScorePanel();

    if(this.cannonDebugRenderer !== undefined) (this.cannonDebugRenderer as any).update()

    this.completedCourse()

    if ( this.currentState === this.GAMESTATES.PLAY ) {
      let mixerUpdateDelta = this.clock.getDelta();

      requestAnimationFrame( function(){ game.animate() } );

      if ( this.player?.characterController !== undefined ) {
        this.player.characterController.update( mixerUpdateDelta, this.player.collided, this.keysPressed, this.player.falling, this.checkpointReached );
        // run blink animation after player on player collision
        if( this.player.collided.value == true && this.player.collided.object == 'player') {
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

  isPlayerOnTracks() {
    if ( this.player !== undefined && this.player.object !== undefined ) {
      const playerBox = new THREE.Box3().setFromObject( this.player.object );
      const collisionMargin = 0.3;
      let tracks = this.scene?.getObjectsByProperty( 'name', 'track' );

      if ( tracks !== undefined ) {
        for( let i = 0; i < tracks.length; i++ ) {
          const trackBox = new THREE.Box3().setFromObject( tracks[i] );
          let collisionDetected = playerBox.intersectsBox( trackBox.expandByScalar( -collisionMargin ));

          if ( collisionDetected ) {
            return true;
          }
        }
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
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

              if ( this.player.score > 0 ) {
                this.player.score = this.player.score - ( Math.round(this.player.score * 0.3 ));
                console.log('player score', this.player.score)
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

  completedCourse() {
    if ( !this.checkpointReached ) {
      if ( this.player !== undefined && this.player.characterController !== undefined) {
        if ( this.player.characterController.model.position.x >= 0 && this.player.characterController.model.position.x <= 18 &&
          this.player.characterController.model.position.z >= -350 && this.player.characterController.model.position.z <= -335 ) {
            this.player.score += 1000;
            console.log('checkpoint reached')
            this.checkpointReached = true;
          }
      }
    }
  }
}

new Client();
