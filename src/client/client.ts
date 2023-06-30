import * as THREE from 'three';
import Player from './player';
import PlayerLocal from './player_local';
import { io } from 'socket.io-client';
import MenuState from './menu_state';
import WaitingState from './waiting_state';
import ExpelledState from './expelled_state';
import * as CANNON from 'cannon-es'
import CannonDebugRenderer from 'cannon-es-debugger';
import RaceTrack from './racetrack';

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
  gameTimer: string = '';
  cannonDebugRenderer: undefined;
  remoteScores: any[];
  groundMaterial = new CANNON.Material("groundMaterial");
  grassMaterial = new CANNON.Material('grassMaterial' );
  wallMaterial = new CANNON.Material('wallMaterial')
  physicsWorld  = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0), // -9.81 m/s²
  });

  constructor() {
    this.remotePlayers = [];
    this.remoteData = [];
    this.remoteScores = [];
    this.initialisingPlayers = [];
    this.clock = new THREE.Clock();
    this.counter = 0;
    this.BLINK_AMOUNT = 11;
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

  onWaitingRoom() {
    const gameState = new WaitingState(this);
    gameState.onWaitingRoomState();
  }

  onExpelled() {
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

      // background and fog
      this.scene.background = new THREE.Color( 0x0d820d );
      this.scene.fog = new THREE.Fog( 0x0d820d, 2, 36 );


      // lighting
      const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
      hemiLight.position.set( 0, 20, 0 );
      hemiLight.name = 'hemiLight';
      this.scene.add( hemiLight );

      this.createRaceTrack(this.scene, this.physicsWorld, this.grassMaterial);

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

  createRaceTrack(scene: THREE.Scene, physicsWorld: CANNON.World, material: CANNON.Material) {
    const raceTrack = new RaceTrack(scene, physicsWorld, material, this.wallMaterial);
    raceTrack.create();
  }

  onPlayState() {
    this.player = new PlayerLocal( this, this.camera, this.socket );

    this.socket.on('gameTimer', (data: number) => {
      this.gameTimer = this.formatGameTimer(data);
    });

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

    // Create a static ground body
    const groundBody = new CANNON.Body( {  mass: 0, material: this.groundMaterial, collisionFilterGroup: 5 } );
    const groundShape = new CANNON.Box( new CANNON.Vec3( 500, 1, 500 ) );
    groundBody.addShape( groundShape );
    groundBody.position.set( 8, -1, -10 );
    this.physicsWorld.addBody( groundBody );

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
            // TODO: what is the data, how does that effect having a CANNON physicsBody etc
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

      this.player?.characterController?.updatePlayerMesh();
    }
  }

  animate() {
    const game = this;

    this.updatePhysics();

    this.updateDisplayTimer();
    this.updateScorePanel();

    if ( this.currentState === this.GAMESTATES.PLAY ) {
      let mixerUpdateDelta = this.clock.getDelta();

      requestAnimationFrame( function(){ game.animate() } );

      if(this.cannonDebugRenderer !== undefined) (this.cannonDebugRenderer as any).update()

      if ( this.player?.characterController !== undefined ) {
        this.player.characterController.update( mixerUpdateDelta, this.player.collided, this.keysPressed );
      }

      this.updateRemotePlayers( mixerUpdateDelta );

      if( this.player?.mixer != undefined ) {
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
