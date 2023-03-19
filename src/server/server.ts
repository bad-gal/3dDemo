import express from 'express';
import * as dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import process from 'process';

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
    const WAITING_TIME = 10;//20;
    let waitingRoomTimeRemaining = WAITING_TIME;
    const PLAY_AREA_MIN =  -70;
    const PLAY_AREA_MAX = 70;

    // ===========================================================
    // Flying obstacles (fruits)
    // ===========================================================
    const movingObstacleLocations = this.createMovingObstacles(PLAY_AREA_MIN, PLAY_AREA_MAX);

    // ===========================================================
    // Ground obstacles (barrels)
    // ===========================================================
    const groundObstacleTypes = ['barrel', 'barrel_side'];
    const groundObstacleLocations = [];
    const BARREL_LENGTH_X = 2;
    const BARREL_LENGTH_Z = 3;
    const BARREL_MIN = 8;
    const BARREL_MAX = 21;

    for( let i = 0; i < this.generateRandomIntInRange( BARREL_MIN, BARREL_MAX ); i++ ) {
      let xValues = Array.from( Array(141), (_, i) => i+ PLAY_AREA_MIN ).filter( num => num < -BARREL_LENGTH_X || num > BARREL_LENGTH_X );
      let zValues = Array.from( Array(141), (_, i) => i+ PLAY_AREA_MIN ).filter( num => num < -BARREL_LENGTH_Z || num > BARREL_LENGTH_Z );
      let x = this.generateRandomIntInRange( xValues[0], xValues[xValues.length - 1] );
      let z = this.generateRandomIntInRange( zValues[0], zValues[zValues.length - 1] );

      if ( i > 0 ) {
        let intersected = false;

        do {
          for ( let j = 0; j < i; j++ ) {
            const obstacle = groundObstacleLocations[j];
            const obstacleX = obstacle.position.x;
            const obstacleZ = obstacle.position.z;

            if (
              (( x >= obstacleX && x <= obstacleX + BARREL_LENGTH_X ) ||
                ( x + BARREL_LENGTH_X >= obstacleX && x + BARREL_LENGTH_X <= obstacleX + BARREL_LENGTH_X )) &&
              (( z >= obstacleZ && z <= obstacleZ + BARREL_LENGTH_Z ) ||
                ( z + BARREL_LENGTH_Z >= obstacleZ && z + BARREL_LENGTH_Z <= obstacleZ + BARREL_LENGTH_Z ))
            ) {
              intersected = true;
              x = this.generateUniqueRandomIntInRange( xValues[0], xValues[xValues.length - 1], [x] );
              z = this.generateUniqueRandomIntInRange( zValues[0], zValues[zValues.length - 1], [z] );
              break;
            }
            else {
              intersected = false;
            }
          }
        }
        while( intersected )
      }

      const obstacleType = groundObstacleTypes[this.generateRandomIntInRange( 0, 1 )];
      groundObstacleLocations.push( { type: obstacleType, position: { x: x, z: z } } );
    }

    // ===========================================================
    // Coins
    // store locations of coins to be displayed in game
    // ===========================================================
    const coinTypes = ['bronze', 'silver', 'gold'];
    let coinLocations = []
    const COINS_MIN = 300;
    const COINS_MAX = 500;

    for ( let i = 0; i < this.generateRandomIntInRange( COINS_MIN, COINS_MAX ); i++ ) {
      let x = this.generateRandomIntInRange( PLAY_AREA_MIN, PLAY_AREA_MAX );
      let z = this.generateRandomIntInRange( PLAY_AREA_MIN, PLAY_AREA_MAX );

      // we need to make sure that the coin is not intersecting with barrels
      let intersected = false;

      do {
        for( let j = 0; j < groundObstacleLocations.length; j++ ) {
          const obstacle = groundObstacleLocations[j];
          const obstacleX = obstacle.position.x;
          const obstacleZ = obstacle.position.z;

          if (
            (( x >= obstacleX && x <= obstacleX + BARREL_LENGTH_X ) ||
              ( x + BARREL_LENGTH_X >= obstacleX && x + BARREL_LENGTH_X <= obstacleX + BARREL_LENGTH_X )) &&
            (( z >= obstacleZ && z <= obstacleZ + BARREL_LENGTH_Z ) ||
              ( z + BARREL_LENGTH_Z >= obstacleZ && z + BARREL_LENGTH_Z <= obstacleZ + BARREL_LENGTH_Z ))
          ) {
            intersected = true;
            x = this.generateUniqueRandomIntInRange( PLAY_AREA_MIN, PLAY_AREA_MAX, [x]);
            z = this.generateUniqueRandomIntInRange( PLAY_AREA_MIN, PLAY_AREA_MAX, [z]);
            break;
          }
          else {
            intersected = false;
          }
        }
      }
      while ( intersected )

      let coinIndex = this.generateRandomIntInRange( 0, coinTypes.length - 1 );
      coinLocations.push( { x: x, z: z, type: coinTypes[coinIndex] } )
    }

    // remove any duplicate location values
    coinLocations = [...new Set( coinLocations )]

    this.io.sockets.on( 'connection', ( socket: ISocket ) => {
      // send list of quadRacers to clients
      socket.emit( 'quadRacerList', quadRacerList );

      socket.userData = {
        position: { x: 0, y: 0,z: 0 },
        quaternion: { isQuaternion: true, _x: 0, _y: 0, _z: 0, _w: 0 },
        action: 'idle_02',
        collided: { value: false, object: '' }
      }

      console.log('CONNECTED WITH', socket.id)
      console.log('player count', playerCount)
      socket.emit( 'setId', { id: socket.id } );

      socket.on( 'disconnect', () => {
        const leavingModel = socket.userData.model;
        if ( leavingModel != null ) {
          quadRacerList.push( leavingModel );
          this.refreshPlayerPositions(playerXPositions, clientStartingPositions, socket.id);
        }
        console.log('playerPositions', playerXPositions)
        console.log( 'removing player : ' + socket.id, ' deleting now' );

        socket.broadcast.emit('deletePlayer', { id: socket.id });
        if ( playerCount > 0 ) playerCount -= 1;

        // if there are no players, can we reset waitingRoomTimeRemaining to waitingTime
        // this way if the server is still running new players can join a new game
        if ( playerCount == 0 && waitingRoomTimeRemaining == 0 ) {
          waitingRoomTimeRemaining = WAITING_TIME;
        }
      });

      socket.on('init', function(data){
        socket.userData.model = data.model;
        socket.userData.position = data.position;
        socket.userData.quaternion = data.quaternion;
        socket.userData.action = data.action;
        socket.userData.collided = data.collided;
        socket.userData.score = data.score;
      });

      socket.on('update', function(data){
        socket.userData.position = data.position;
        socket.userData.quaternion = data.quaternion;
        socket.userData.model = data.model;
        socket.userData.action = data.action;
        socket.userData.collided = data.collided;
        socket.userData.score = data.score;
      });

      socket.on( 'updateQuadRacers', function( data ) {
        quadRacerList = data;
        console.log(data)
      });

      socket.on( 'startTimer', function( data ) {
        startTimer = data;
      });

      socket.on( 'kickOutPlayer', function( data ) {
        console.log('playerPositions', playerXPositions)
        socket.broadcast.emit('deletePlayer', { id: data });
        waitingRoomTimeRemaining = 0;
        startTimer = false;
        console.log('kickout stats', waitingRoomTimeRemaining, startTimer)
        socket.disconnect(true);
      });

      let positionX

      socket.on( 'getPlayerPosition', function( data ) {
         if (positionX === undefined) {
            positionX = playerXPositions.shift();

            // we are storing the starting position so if the client leaves
            // we can add position back into playerXPositions
            clientStartingPositions.set(socket.id, positionX);
            playerCount++;
          }

        console.log(playerXPositions, 'playerCount',playerCount)
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

          const index = coinLocations.indexOf(result);
          if (index > -1) {
            coinLocations.splice(index, 1);
          }
          // emit the deleted coin location value to the rest of the clients
          socket.broadcast.emit( 'removeCoin', result);
        }
      });

      // send flying obstacles to clients
      socket.emit( 'fruitObstaclesDataInitial', movingObstacleLocations );

      // begin updating fruit
      socket.on('fruitStart', function() {
        fruitStart = true;
      });
    });

    setInterval(() => {
      this.io.emit( 'sendQuadRacerList', quadRacerList)
    }, 2000/ FPS);

    setInterval(() => {
      if( startTimer ){
        if( waitingRoomTimeRemaining == -1 ) {
          clearTimeout( waitingRoomTimeRemaining );
          startTimer = false;
          waitingRoomTimeRemaining = 0; //waitingTime;
        }
        else {
          waitingRoomTimeRemaining--;
        }
        this.io.emit( '30SecondsWaitingRoom', waitingRoomTimeRemaining );
      }
    }, 1000);

    setInterval(() => {
      let pack = [];

      this.io.sockets.sockets.forEach((socket :ISocket) => {
        if(socket.userData.model !== undefined) {
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


      if(pack.length > 0) {
        this.io.emit('remoteData', pack);
      }

      if (fruitStart == true) {
        this.io.emit( 'remoteFruitObstaclesData', this.updateMovingObstacles(0.03, movingObstacleLocations ))
      }

    }, 1000 / FPS );
  }

  private createMovingObstacles(PLAY_AREA_MIN: number, PLAY_AREA_MAX: number) {
    const MOVING_OBJECT_MIN = 14;
    const MOVING_OBJECT_MAX = 29;
    const SIZE = 2; //all fruits except apple have the same x,z size
    const APPLE_SIZE = 3;

    const MOVING_OBJECT_TYPES = ['strawberry', 'apple', 'banana', 'cherry', 'pear'];
    const movingObstacleLocations = [];

    for (let i = 0; i < this.generateRandomIntInRange(MOVING_OBJECT_MIN, MOVING_OBJECT_MAX); i++) {
      let x = this.generateRandomIntInRange(PLAY_AREA_MIN, PLAY_AREA_MAX);
      let y = this.generateRandomIntInRange(1, 4);
      let z = this.generateRandomIntInRange(PLAY_AREA_MIN, PLAY_AREA_MAX);

      let velX = this.generateRandomIntInRange(5, 8);
      let velY = this.generateRandomIntInRange(5, 10);
      let velZ = this.generateRandomIntInRange(4, 9);

      const objectType = MOVING_OBJECT_TYPES[this.generateRandomIntInRange(0, MOVING_OBJECT_TYPES.length - 1)];

      if (i > 0) {
        let intersected = false;

        do {
          for (let j = 0; j < i; j++) {
            const obstacle = movingObstacleLocations[j];
            const obstacleX = obstacle.position.x;
            const obstacleZ = obstacle.position.z;
            const obstacleSize = obstacle.type == 'apple' ? APPLE_SIZE : SIZE;
            const size = objectType == 'apple' ? APPLE_SIZE : SIZE;

            if (((x >= obstacleX && x <= obstacleX + obstacleSize) ||
              (x + size >= obstacleX && x + size <= obstacleX + obstacleSize)) &&
              ((z >= obstacleZ && z <= obstacleZ + obstacleSize) ||
                (z + size >= obstacleZ && z + size <= obstacleZ + obstacleSize))) {
              intersected = true;
              x = this.generateUniqueRandomIntInRange(PLAY_AREA_MIN, PLAY_AREA_MAX, [x]);
              z = this.generateUniqueRandomIntInRange(PLAY_AREA_MIN, PLAY_AREA_MAX, [z]);
              break;
            }
            else {
              intersected = false;
            }
          }
        }
        while (intersected);
      }

      movingObstacleLocations.push({ type: objectType, position: { x: x, y: y, z: z }, velocity: { x: velX, y: velY, z: velZ }, rotation: { x: 0, y: 0, z: 0 } });
    }
    return movingObstacleLocations;
  }

  private generateRandomIntInRange(start: number, end: number): number {
    return Math.floor(Math.random() * (end - start + 1) + start);
  }

  private generateUniqueRandomIntInRange(start: number, end: number, existingValues: number[]): number {
    let value: number;
    do {
      value = this.generateRandomIntInRange(start, end);
    } while (existingValues.includes(value));
    return value;
  }

  private refreshPlayerPositions(playerXPositions: number[], positionMap: Map<string, number>, socket_id: any) {
    const leavingPlayerPosition = positionMap.get(socket_id);

    playerXPositions.unshift(leavingPlayerPosition);
    playerXPositions.sort(function (a, b) {
      return a - b;
    });
  }

  private updateMovingObstacles( delta: number,  movingObstacles: { type: string, position: { x: number, y: number, z: number }, velocity: { x: number, y: number, z: number }, rotation: { x: number, y: number, z: number } }[] ) {

    let bounds = {
      minX: -70, minY: 0.25, minZ: -70,
      maxX: 70, maxY: 11, maxZ: 70,
    };

    for(let i = 0; i < movingObstacles.length; i++ ) {

      let element = movingObstacles[i];

      let currentPosX = element.position.x;
      let currentPosY = element.position.y;
      let currentPosZ = element.position.z;

      if ( currentPosX >= bounds.maxX ) {
        element.velocity.x = -element.velocity.x;
      } else if ( currentPosX <= bounds.minX ) {
        element.velocity.x = Math.abs(element.velocity.x);
      }
      if ( currentPosY >= bounds.maxY){
        element.velocity.y = -element.velocity.y;
      } else if ( currentPosY <= bounds.minY) {
        element.velocity.y = Math.abs(element.velocity.y);
      }
      if ( currentPosZ >= bounds.maxZ ) {
        element.velocity.z = -element.velocity.z;
      } else if ( currentPosZ <= bounds.minZ) {
        element.velocity.z = Math.abs(element.velocity.z);
      }

      // mimic THREE js addScaledVector method
      let newPositionX =  element.velocity.x * delta + currentPosX
      let newPositionY =  element.velocity.y * delta + currentPosY
      let newPositionZ =  element.velocity.z * delta + currentPosZ

      // calculate the amount to rotate in the model
      const rotationAmount = 2 * Math.PI * (delta / 2);
      const rotationValue = movingObstacles[i].rotation.x + rotationAmount;

      movingObstacles[i].rotation.x = rotationValue;
      movingObstacles[i].rotation.y = 0;
      movingObstacles[i].rotation.z = rotationValue;

      if( rotationValue >= 2 * Math.PI ) {
        movingObstacles[i].rotation.x = 0;
        movingObstacles[i].rotation.y = 0;
        movingObstacles[i].rotation.z = 0;
      }

      // console.log( 'newPositions', newPositionX, newPositionY, newPositionZ )
      movingObstacles[i].position.x = newPositionX;
      movingObstacles[i].position.y = newPositionY;
      movingObstacles[i].position.z = newPositionZ;
      movingObstacles[i].velocity.x = element.velocity.x;
      movingObstacles[i].velocity.y = element.velocity.y;
      movingObstacles[i].velocity.z = element.velocity.z;
      // console.log('array', movingObstacles)
    };

    return movingObstacles;
  }

  public Start() {
    this.server.listen( port, function() {
      console.log( 'Listening on PORT ' + port );
    });
  }
}

new App().Start();
