import express from 'express';
import * as dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import process from 'process';
import GameObjects from './game_objects';

dotenv.config();

const port = process.env.PORT;
const FPS = 30;

interface ISocket extends Socket {
  name?: string;
  userData?: any;
}

class App {
  private server: http.Server;
  private io: Server;

  constructor() {
    const app = express();
    // create virtual paths
    app.use(express.static( path.join( __dirname, '../client' )));

    this.server = new http.Server( app );
    this.io = new Server( this.server );

    let gameObjects = new GameObjects();

    let gameTimerStart = false;
    let fruitStart = false;

    let playerXPositions : Array<number> = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
    let playerCount = 0;
    let quadRacerList = [
      "camouflage rider", "green rider", "lime rider", "mustard rider",
      "neon rider", "orange rider", "purple rider", "red rider", "red star rider",
      "blue rider",
    ];
    let clientStartingPositions = new Map();
    let startTimer = false;
    const WAITING_TIME = 15;
    let waitingRoomTimeRemaining = WAITING_TIME;

    let GAME_TIMER = 120;
    let fruitTimerOn = false;

    const movingObstacleLocations = gameObjects.createNewMovingObstacles();
    const groundObstacleLocations = gameObjects.createNewGroundObstacles();
    const coinLocations = gameObjects.createNewCoinLocations( groundObstacleLocations );

    this.io.sockets.on( 'connection', ( socket: ISocket ) => {
      // send list of quadRacers to clients
      socket.emit( 'quadRacerList', quadRacerList );

      socket.userData = {
        position: { x: 0, y: 0,z: 0 },
        quaternion: { isQuaternion: true, _x: 0, _y: 0, _z: 0, _w: 0 },
        action: 'idle_02',
        collided: { value: false, object: '' }
      }

      console.log( 'CONNECTED WITH', socket.id )
      console.log( 'player count', playerCount )
      socket.emit( 'setId', { id: socket.id } );

      socket.on( 'disconnect', () => {
        const leavingModel = socket.userData.model;
        if ( leavingModel != null ) {
          quadRacerList.push( leavingModel );
          gameObjects.refreshPlayerPositions( playerXPositions, clientStartingPositions, socket.id );
        }
        console.log( 'playerPositions', playerXPositions )
        console.log( 'removing player : ' + socket.id, ' deleting now' );

        socket.broadcast.emit( 'deletePlayer', { id: socket.id } );
        if ( playerCount > 0 ) playerCount -= 1;

        // if there are no players, can we reset waitingRoomTimeRemaining to waitingTime
        // this way if the server is still running new players can join a new game
        if ( playerCount == 0 && waitingRoomTimeRemaining == 0 ) {
          waitingRoomTimeRemaining = WAITING_TIME;
        }
      });

      socket.on( 'init', function( data ) {
        socket.userData.model = data.model;
        socket.userData.position = data.position;
        socket.userData.quaternion = data.quaternion;
        socket.userData.action = data.action;
        socket.userData.collided = data.collided;
        socket.userData.score = data.score;
      });

      socket.on( 'update', function( data ) {
        socket.userData.position = data.position;
        socket.userData.quaternion = data.quaternion;
        socket.userData.model = data.model;
        socket.userData.action = data.action;
        socket.userData.collided = data.collided;
        socket.userData.score = data.score;
      });

      socket.on( 'updateQuadRacers', function( data ) {
        quadRacerList = data;
        console.log( data )
      });

      socket.on( 'startTimer', function( data ) {
        startTimer = data;
      });

      socket.on( 'kickOutPlayer', function( data ) {
        console.log( 'playerPositions', playerXPositions )
        socket.broadcast.emit( 'deletePlayer', { id: data } );
        waitingRoomTimeRemaining = 0;
        startTimer = false;
        console.log( 'kickout stats', waitingRoomTimeRemaining, startTimer )
        socket.disconnect( true );
      });

      let positionX

      socket.on( 'getPlayerPosition', function( data ) {
         if ( positionX === undefined ) {
            positionX = playerXPositions.shift();

            // we are storing the starting position so if the client leaves
            // we can add position back into playerXPositions
            clientStartingPositions.set( socket.id, positionX );
            playerCount++;
          }

        console.log( playerXPositions, 'playerCount',playerCount )
        socket.emit( 'playerPosition', { position: { x: positionX, y: 0, z: 0 }} );
      });

      // send coin locations to clients
      socket.emit( 'coinLocations', coinLocations );

      // send obstacles to clients
      socket.emit( 'groundObstacleLocations', groundObstacleLocations );

      // a client has collected a coin
      socket.on( 'updateCoins', function( data ) {
        let result = coinLocations.filter( coin => coin.x == data.x && coin.z == data.z );
        if ( result.length == 1 ) {
          result = result.flat();

          const index = coinLocations.indexOf( result );
          if ( index > -1 ) {
            coinLocations.splice(index, 1);
          }
          // emit the deleted coin location value to the rest of the clients
          socket.broadcast.emit( 'removeCoin', result );
        }
      });

      // send flying obstacles to clients
      socket.emit( 'fruitObstaclesDataInitial', movingObstacleLocations );

      // begin updating fruit
      socket.on( 'fruitStart', function() {
        gameTimerStart = true;
      });
    });

    setInterval(() => {
      this.io.emit( 'sendQuadRacerList', quadRacerList )
    }, 2000/ FPS);

    setInterval(() => {
      if( startTimer ){
        if( waitingRoomTimeRemaining == -1 ) {
          clearTimeout( waitingRoomTimeRemaining );
          startTimer = false;
          waitingRoomTimeRemaining = 0;
        }
        else {
          waitingRoomTimeRemaining--;
        }
        this.io.emit( '30SecondsWaitingRoom', waitingRoomTimeRemaining );
      }
    }, 1000);

    // game timer
    setInterval(() => {
      if ( fruitTimerOn ) {
        if ( !fruitStart ) {
          fruitStart = true;
          this.io.emit( 'setVisibilityMoveableObjects', fruitStart ); // send visibility to clients
        }

        if ( GAME_TIMER <= 0 ) {
          clearTimeout( GAME_TIMER );
          fruitTimerOn = false;
          fruitStart = false;
          this.io.emit( 'setVisibilityMoveableObjects', fruitStart );
        }
        else {
          if ( fruitTimerOn ) GAME_TIMER--;
        }
        this.io.emit( 'gameTimer', GAME_TIMER );
      }
    }, 1000 );

    setInterval(() => {
      let pack = [];

      this.io.sockets.sockets.forEach((socket :ISocket) => {
        if( socket.userData.model !== undefined ) {
          pack.push({
            id: socket.id,
            model: socket.userData.model,
            position: socket.userData.position,
            quaternion: socket.userData.quaternion,
            action: socket.userData.action,
            collided: socket.userData.collided,
            score: socket.userData.score,
          });
        }
      });

      if( pack.length > 0 ) {
        this.io.emit( 'remoteData', pack );
      }

      if ( gameTimerStart == true) {
        this.io.emit( 'remoteFruitObstaclesData', gameObjects.updateMovingObstacles(0.03, movingObstacleLocations ));
        if ( !fruitTimerOn ) {
          fruitTimerOn = true;
        }
      }

    }, 1000 / FPS );
  }

  public Start() {
    this.server.listen( port, function() {
      console.log( 'Listening on PORT ' + port );
    });
  }
}

new App().Start();
