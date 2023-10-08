import express from 'express';
import * as dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import process from 'process';
import GameObjects from './game_objects';

dotenv.config();

interface ISocket extends Socket {
  name?: string;
  userData?: any;
}

const port = process.env.PORT;
const FPS = 30;
const app = express();
app.use(express.static( path.join( __dirname, '../client' )));

const server = new http.Server( app );
const io = new Server( server );

const WAITING_TIME = 30;
let waitingRoomTimeRemaining = WAITING_TIME;
let startWaitingRoomTimer = false;

const GAME_TIMER = 120;
let gameTimeRemaining = GAME_TIMER;
let gameTimerStart = false; // when true, we have received the go-ahead that the game has started

const GAME_END_TIMER = 10;
let gameEndTimeRemaining = GAME_END_TIMER;
let gameEndTimer = false; // when true, there is x seconds until game resets

// waiting room timer
let waitingRoomInterval;
function waitingRoomTimer () {
  if (waitingRoomInterval) {
    clearInterval(waitingRoomInterval);
  }
  waitingRoomInterval = setInterval(() => {
    if (startWaitingRoomTimer) {
      if (waitingRoomTimeRemaining >= 0) {
        waitingRoomTimeRemaining -= 1;
        console.log(waitingRoomTimeRemaining)
        console.log("");
        io.emit('30SecondsWaitingRoom', waitingRoomTimeRemaining);
      } else {
        clearInterval(waitingRoomInterval);
        startWaitingRoomTimer = false;
        waitingRoomTimeRemaining = 0;
      }
    }
  }, 1000);
}

// game timer
let gameTimerInterval;
function startGameTimer () {
  if(gameTimerInterval) {
    clearInterval(gameTimerInterval)
  }
  gameTimerInterval = setInterval(() => {
    if (gameTimerStart) {
      if (gameTimeRemaining <= 0) {
        clearInterval(gameTimerInterval);
        gameTimerStart = false;
        gameEndTimer = true;
        startEndGameTimer();
        io.emit('gameOver', true);
      } else {
        gameTimeRemaining--;
      }
      io.emit('gameTimer', gameTimeRemaining);
    }
  }, 1000);
}

let gameObjects = new GameObjects();
let quadRacerList = [
  "camouflage rider", "green rider", "lime rider", "mustard rider",
  "neon rider", "orange rider", "purple rider", "red rider", "red star rider",
  "blue rider",
];
let clientStartingPositions = new Map();
let coinLocations = gameObjects.createNewCoinLocations();
let movingSphereLocations = gameObjects.createMovingSpheres();
let movingHammerLocations = gameObjects.createMovingHammers();
let spikeLocations = gameObjects.createStaticSpikes();
let movingBallLocations = gameObjects.createMovingBalls();
let movingPlatformLocations = gameObjects.createMovingPlatforms();

let positionX = undefined;
let playerXPositions = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
let playerCount = 0;

let quadListInterval
function startQuadListTimer() {
  if(quadListInterval) {
    clearInterval(quadListInterval)
  }
  quadListInterval = setInterval(() => {
    io.emit( 'sendQuadRacerList', quadRacerList )
    console.log('quadRacerList is emitting');
    console.log(' ');
  }, 2000/ FPS);
};

let endGameInterval;
function startEndGameTimer() {
  endGameInterval = setInterval(() => {
      if (gameEndTimeRemaining <= 0) {
        clearInterval(endGameInterval);

        gameObjects = new GameObjects();
        gameTimerStart = false;
        startWaitingRoomTimer = false;
        gameEndTimer = false;

        quadRacerList = [
          "camouflage rider", "green rider", "lime rider", "mustard rider",
          "neon rider", "orange rider", "purple rider", "red rider", "red star rider",
          "blue rider",
        ];
        clientStartingPositions = new Map();
        gameTimeRemaining = GAME_TIMER;
        waitingRoomTimeRemaining = WAITING_TIME;
        gameEndTimeRemaining = GAME_END_TIMER;
        coinLocations = gameObjects.createNewCoinLocations();
        movingSphereLocations = gameObjects.createMovingSpheres();
        movingHammerLocations = gameObjects.createMovingHammers();
        spikeLocations = gameObjects.createStaticSpikes();
        movingBallLocations = gameObjects.createMovingBalls();
        movingPlatformLocations = gameObjects.createMovingPlatforms();

        positionX = undefined;
        playerXPositions = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
        playerCount = 0;


        if (gameTimerInterval) clearInterval(gameTimerInterval);
        if (updateGameInterval) clearInterval(updateGameInterval);
        if (waitingRoomInterval) clearInterval(waitingRoomInterval);
        if (quadListInterval) clearInterval(quadListInterval);

        // send call to clients to go back to the initial screen
        console.log('GameTimer')
        console.log("");
        console.log("calling for game to be reset")
        console.log("");
        io.emit('resetGame');
      } else {
        gameEndTimeRemaining--;
      }
  }, 1000);
}

// this seems to be working now, the players appear in the same game (on reset back to menu)and the objects
// move at the correct speed.

// what needs to be fixed is in the waiting area, when a player selects a rider it is not being
// reflected on the other player like it does on initial game.

// THE SOLUTION!
// the quadListInterval needs to be wrapped in function, because after the initial game the interval stops running.
// we should add the function to start the timer as soon as we enter the waiting room, so maybe at line 251
// after "startWaitingRoomTimer = data;"

let updateGameInterval
function updateGameDataTimer() {
  if(updateGameInterval) {
    clearInterval(updateGameInterval)
  }
  updateGameInterval = setInterval(() => {
    let pack = [];

    io.sockets.sockets.forEach((socket :ISocket) => {
      if( socket.userData.model !== undefined ) {
        pack.push({
          id: socket.id,
          model: socket.userData.model,
          position: socket.userData.position,
          quaternion: socket.userData.quaternion,
          action: socket.userData.action,
          collided: socket.userData.collided,
          score: socket.userData.score,
          physicsPosition: socket.userData.physicsPosition,
          physicsQuaternion: socket.userData.physicsQuaternion,
        });
      }
    });

    if( pack.length > 0 ) {
      io.emit( 'remoteData', pack );
    }

    if ( gameTimerStart === true) {
      io.emit( 'remoteMovingSphereData', gameObjects.updateMovingSphere(0.03, movingSphereLocations ));
      io.emit( 'remoteMovingHammerData', gameObjects.updateMovingHammers(0.03, movingHammerLocations ));
      io.emit( 'remoteMovingBallData', gameObjects.updateMovingBalls( 0.03, movingBallLocations ));
      io.emit( 'remoteMovingPlatformData', gameObjects.updateMovingPlatforms( 0.03, movingPlatformLocations ));
    }
  }, 1000 / FPS );
}

function createServer() {
  io.sockets.on( 'connection', ( socket: ISocket ) => {

    socket.emit( 'quadRacerList', quadRacerList );
    console.log('----------------------------------------');
    console.log('Initial quadRacerList', quadRacerList);
    console.log('----------------------------------------');

    socket.userData = {
      position: { x: 0, y: 0,z: 0 },
      quaternion: { isQuaternion: true, _x: 0, _y: 0, _z: 0, _w: 0 },
      action: 'idle_02',
      collided: { value: false, object: '' }
    }

    console.log( 'CONNECTED WITH', socket.id )
    console.log("");

    socket.emit( 'setId', { id: socket.id } );

    socket.on( 'init', function( data ) {
      socket.userData.model = data.model;
      socket.userData.position = data.position;
      socket.userData.quaternion = data.quaternion;
      socket.userData.action = data.action;
      socket.userData.collided = data.collided;
      socket.userData.score = data.score;
      socket.userData.physicsPosition = data.physicsPosition;
      socket.userData.physicsQuaternion = data.physicsQuaternion;
    });

    socket.on( 'update', function( data ) {
      socket.userData.position = data.position;
      socket.userData.quaternion = data.quaternion;
      socket.userData.model = data.model;
      socket.userData.action = data.action;
      socket.userData.collided = data.collided;
      socket.userData.score = data.score;
      socket.userData.physicsPosition = data.physicsPosition;
      socket.userData.physicsQuaternion = data.physicsQuaternion;
    });

    socket.on( 'updateQuadRacers', function( data ) {
      quadRacerList = data;
      console.log( data )
      console.log("");
    });

    socket.on( 'startTimer', function( data ) {
      if(!startWaitingRoomTimer) {
        startWaitingRoomTimer = data;
        console.log('starting timer', startWaitingRoomTimer, waitingRoomTimeRemaining)
        console.log("");
        waitingRoomTimer();
        startQuadListTimer();
      }
    });

    socket.on( 'kickOutPlayer', function( data ) {
      console.log( 'playerPositions', playerXPositions )
      console.log("");
      socket.broadcast.emit( 'deletePlayer', { id: data } );
      startWaitingRoomTimer = false;
      console.log( 'kickout stats' )
      console.log("");
      console.log('playerCount', playerCount);
      console.log("");
      // TODO: style expelled state screen, show countdown timer in sec b4 returning to menu
      // todo: add coundown timer to leaderboard b4 returning to menu, re-style leaderboard colours
      // need to test what happens when we have 3 players and 1 player gets kicked out
      // if (gameTimerInterval) clearInterval(gameTimerInterval);
      // if (updateGameInterval) clearInterval(updateGameInterval);
      if (waitingRoomInterval) clearInterval(waitingRoomInterval);
      // if (quadListInterval) clearInterval(quadListInterval);
      // if  clearInterval(endGameInterval);
      waitingRoomTimeRemaining = WAITING_TIME;
      socket.disconnect( true );
    });

    socket.on( 'getPlayerPosition', function( data ) {
      // if ( positionX === undefined ) {
        positionX = playerXPositions.shift();

        // we are storing the starting position so if the client leaves
        // we can add position back into playerXPositions
        clientStartingPositions.set( socket.id, positionX );
        playerCount++;
      // }

      console.log( playerXPositions, 'playerCount',playerCount, 'player position', positionX )
      console.log("");
      socket.emit( 'playerPosition', { position: { x: positionX, y: 0, z: 0 }} );
    });

    // send coin locations to clients
    socket.emit( 'coinLocations', coinLocations );

    // a client has collected a coin
    socket.on( 'updateCoins', function( data ) {
      let result = coinLocations.filter( coin => coin.x === data.x && coin.z === data.z );
      if ( result.length === 1 ) {
        result = result.flat();

        const index = coinLocations.indexOf( result );
        if ( index > -1 ) {
          coinLocations.splice(index, 1);
        }
        // emit the deleted coin location value to the rest of the clients
        socket.broadcast.emit( 'removeCoin', result );
      }
    });

    // moving balls have collided
    socket.on( 'changeBallDirection', function( data ) {
      let balls = movingBallLocations.filter( ball => ball.name === data[0]  || ball.name === data[1] );

      for( let i = 0; i < balls.length; i++ ) {
        const x = balls[i].directionX;
        balls[i].directionX = -x;
      }
    });

    // send moving sphere locations to clients
    socket.emit( 'movingSphereLocations', movingSphereLocations );

    // send moving hammer locations to clients
    socket.emit( 'movingHammerLocations', movingHammerLocations );

    // send spike locations to clients
    socket.emit( 'spikeLocations', spikeLocations );

    // send moving ball locations to clients
    socket.emit( 'movingBallLocations', movingBallLocations );

    // send moving platform locations to clients
    socket.emit( 'movingPlatformLocations', movingPlatformLocations );

    // when we receive the instruction to begin game
    socket.on( 'beginGame', function() {
      if(!gameTimerStart) {
        gameTimerStart = true;
        startGameTimer();
        console.log('starting the 3js game')
        console.log("");
      }
    });

    socket.on( 'disconnect', () => {
      const leavingModel = socket.userData.model;
      if ( leavingModel != null ) {
        quadRacerList.push( leavingModel );
        if(clientStartingPositions.size > 0) {
          gameObjects.refreshPlayerPositions( playerXPositions, clientStartingPositions, socket.id );
        }
      }
      console.log( 'playerPositions', playerXPositions )
      console.log("");
      console.log( 'removing player : ' + socket.id, ' deleting now' );
      console.log("");

      socket.broadcast.emit( 'deletePlayer', { id: socket.id } );
      if ( playerCount > 0 ) playerCount -= 1;

      // if there are no players, can we reset waitingRoomTimeRemaining to waitingTime
      // this way if the server is still running new players can join a new game
      if ( playerCount === 0 && waitingRoomTimeRemaining === 0 ) {
        waitingRoomTimeRemaining = WAITING_TIME;
      }
    });

    updateGameDataTimer();
  });

  server.listen( port, function() {
    console.log( 'Listening on PORT ' + port );
    console.log("");
  });
}

createServer();
