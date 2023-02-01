import * as THREE from 'three';
import Player from './player';
import PlayerLocal from './player_local';
import { Box3 } from 'three';
import { io } from 'socket.io-client';

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

  createMenuItems() {
    // create a container
    const containerDiv = document.createElement("div");
    containerDiv.className = ("container");
    containerDiv.id = ('container');
    document.body.appendChild(containerDiv);

    // create a new div element
    const menuDiv = document.createElement("div");
    menuDiv.className = ('menu-title');
    const newContent = document.createTextNode("Welcome to 3D Demo");

    // add the text node to the newly created div
    menuDiv.appendChild(newContent);
    containerDiv.appendChild(menuDiv)

    // add paragraph
    const menuParagraph = document.createElement("p");
    menuParagraph.className = ('menu-para');
    const paraContent = document.createTextNode("Play this exciting demo of a 3D racing game with friends. Click button to join the waiting room. Let the fun begin!!!");
    menuParagraph.appendChild(paraContent);
    containerDiv.appendChild(menuParagraph);

    // add button
    const btn = document.createElement("button");
    btn.className = ('btn waiting');
    btn.id = ('joinButton');
    btn.innerHTML = "Join Waiting Room";
    containerDiv.appendChild(btn);
  }

  onMenuState() {
    const game = this;

    // get the list of quadRacers
    this.socket.on( 'quadRacerList', function( data: string[]) {
      game.quadRacerList = data;
    });

    // get the player id and it's initial position
    this.socket.once( 'setId', function( data: any ) {
			game.initPlayerId = data.id;
      console.log( 'setId connected', data );
		});

    this.createMenuItems();

    const waitingBtn: HTMLElement = document.getElementById("joinButton")!;
    
    waitingBtn.addEventListener("click", function() {
      game.currentState = game.GAMESTATES.WAITING_ROOM;
      game.onWaitingRoomState();
    });
  };

  createWaitingRoomItems() {
    // remove the container div 
    const container: HTMLElement = document.getElementById( "container" )!;
    container.remove();

    // create a new container
    const containerDiv = document.createElement( "div" );
    containerDiv.className = ( "waiting-room-container" );
    containerDiv.id = ( 'waiting-room-container' );
    document.body.appendChild( containerDiv );

    // create a new div element with a title
    const menuDiv = document.createElement( "div" );
    menuDiv.className = ( 'waiting-room-title' );
    const newContent = document.createTextNode( "Waiting Room" );
    menuDiv.appendChild( newContent );
    containerDiv.appendChild( menuDiv )

    // add paragraph
    const menuParagraph = document.createElement( "p" );
    menuParagraph.className = ( 'waiting-room-para');
    const paraContent = document.createTextNode( "Choose a player" );
    menuParagraph.appendChild( paraContent );
    containerDiv.appendChild( menuParagraph );

    // create flexbox with list of quadRacers
    const flex = document.createElement( "ul" );
    flex.className = ( "player-container" );
   
    for ( let index = 0; index < this.quadRacerFullList.length; index++ ) {
      let data = document.createElement( "button" );
      data.className = ( "flex-item" );
      let value = document.createTextNode( this.quadRacerFullList[index] );
      data.appendChild( value );
      flex.appendChild( data );
    }
    containerDiv.appendChild( flex );
  }

  onWaitingRoomState() {
    const game = this;
    let timer;

    // console.log('IN WAITING ROOM')
    let chosenQuadRacer: string;

    // player can click to select a quadRacer
    let quadRacerItems: HTMLCollectionOf<Element> = document.getElementsByClassName( "flex-item" )!;
    
    this.createWaitingRoomItems();
    
    for ( let index = 0; index < quadRacerItems.length; index++ ) {
      quadRacerItems[index].addEventListener("click", function() {
        console.log( quadRacerItems[index].innerHTML );

        // store the chosen quadRacer
        chosenQuadRacer = quadRacerItems[index].innerHTML;

        // remove chosen quadRacer from quadRacerList
        const quadIndex = game.quadRacerList.indexOf( chosenQuadRacer );
        if ( quadIndex > -1 ) game.quadRacerList.splice( quadIndex, 1 );

        // need to disable all buttons including this one
        const buttons = document.getElementsByTagName("button");
        for (const button of buttons) {
          button.disabled = true;
        }

        // send amended quadRacerList to server
        game.socket.emit( 'updateQuadRacers', game.quadRacerList );

        // the chosen quadRacer should be disabled
        (quadRacerItems[index] as HTMLButtonElement).disabled = true;

        // change the chosen quadRacer colour to grey
        (quadRacerItems[index] as HTMLElement).style.background = "gray";
        (quadRacerItems[index] as HTMLElement).style.color ="#383838";
        (quadRacerItems[index] as HTMLElement).style.border = "10px solid yellow"
      });
    }

    //x second timer for players to choose player and start game
    game.socket.emit( 'startTimer', true );
    game.socket.on( '30SecondsWaitingRoom', function( data: number ) {
      timer = data;
      console.log(timer, data);
      // when timer finished players move to gameplay or gets kicked out of server
      if( timer == -1) {
        // continue to gameplay
        // TODO: and players is more than 1 maybe?
        if( chosenQuadRacer !== undefined ) {
          game.userModel = chosenQuadRacer;
          game.currentState = game.GAMESTATES.INIT;
          game.onInitState();
        } else {
          // kick out this player
          game.socket.emit( 'kickOutPlayer', game.socket.id );
          game.currentState = game.GAMESTATES.EXPELLED;
          game.onExpelledState();
        }
      }
    });

    // we need to keep requesting the quadRacerList from the server
    game.socket.on( 'sendQuadRacerList', function( data: string[]) {
      game.quadRacerList = data;
      
      // we need to update changes made by other players
      let diff = game.quadRacerFullList.filter( x => !game.quadRacerList.includes(x));

      // then we need to go through them to make sure they are disabled
      for ( let index = 0; index < quadRacerItems.length; index++ ) {
        if (diff.includes(quadRacerItems[index].innerHTML)){
          // change the quadRacer to disabled and change colour to grey
          (quadRacerItems[index] as HTMLButtonElement).disabled = true;
          (quadRacerItems[index] as HTMLElement).style.background = "gray";
          (quadRacerItems[index] as HTMLElement).style.color ="#383838"
        }
      }
    });
  }

  onExpelledState() {
    // remove the container div 
    const container: HTMLElement = document.getElementById( "waiting-room-container" )!;
    container.remove();

    // create a new container
    const containerDiv = document.createElement( "div" );
    containerDiv.className = ( "expelled-container" );
    containerDiv.id = ( 'expelled-container' );
    document.body.appendChild( containerDiv );

    // create a new div element with a title
    const expelledDiv = document.createElement( "div" );
    expelledDiv.className = ( 'expelled-title' );
    const newContent = document.createTextNode( "Game Closed" );
    expelledDiv.appendChild( newContent );
    containerDiv.appendChild( expelledDiv )

    // add paragraph
    const expelledParagraph = document.createElement( "p" );
    expelledParagraph.className = ( 'expelled-para');
    const paraContent = document.createTextNode( "You have been kicked out because you didn't choose a player within the timeframe or there were more than 10 players. Try again later" );
    expelledParagraph.appendChild( paraContent );
    containerDiv.appendChild( expelledParagraph );
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

  // TODO: set the player model to the model chosen by the player
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
