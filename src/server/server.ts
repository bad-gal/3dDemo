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
    let playerXPositions = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
    let playerCount = 0;
    let quadRacerList = [
      "camouflage rider", "green rider", "lime rider", "mustard rider",
      "neon rider", "orange rider", "purple rider", "red rider", "red star rider",
      "blue rider",
    ];
    let startTimer = false;
    const waitingTime = 10; // should be 30
    let waitingRoomTimeRemaining = waitingTime;

    this.io.sockets.on( 'connection', ( socket: ISocket ) => {
      // send list of quadRacers to clients
      socket.emit( 'quadRacerList', quadRacerList );

      socket.userData = {
        position: { x: 0, y: 0,z: 0 },
        quaternion: { isQuaternion: true, _x: 0, _y: 0, _z: 0, _w: 0 },
        action: 'idle_02',
        collided: false,
      }

      console.log('CONNECTED WITH', socket.id)
      console.log('player count', playerCount)
      socket.emit( 'setId', { id: socket.id } );

      socket.on( 'disconnect', () => {
        console.log( 'removing player : ' + socket.id, ' deleting now' );
        socket.broadcast.emit('deletePlayer', { id: socket.id });
        playerCount -= 1;
      });

      socket.on('init', function(data){    
        socket.userData.model = data.model;
        socket.userData.position = data.position;
        socket.userData.quaternion = data.quaternion;
        socket.userData.action = data.action;
        socket.userData.collided = data.collided;
      });

      socket.on('update', function(data){
        socket.userData.position = data.position;
        socket.userData.quaternion = data.quaternion;
        socket.userData.model = data.model;
        socket.userData.action = data.action;
        socket.userData.collided = data.collided;
      });

      socket.on( 'updateQuadRacers', function( data ) {
        quadRacerList = data;
        console.log(data)
      });

      socket.on( 'startTimer', function( data ) {
        startTimer = data;
      });

      socket.on( 'kickOutPlayer', function( data ) {
        socket.broadcast.emit('deletePlayer', { id: data });
        playerCount--;
        socket.disconnect(true);
      });

      // socket.emit( 'playerPosition', { position: { x: positionX, y: 0, z: 0 }} );
      socket.on( 'getPlayerPosition', function( data ) {
        let positionX = playerXPositions.shift();
        playerCount++;
        console.log(playerXPositions, playerCount)
        socket.emit( 'playerPosition', { position: { x: positionX, y: 0, z: 0 }} );
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
          waitingRoomTimeRemaining = waitingTime
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
          });
        }
      });

      if(pack.length > 0) {
        this.io.emit('remoteData', pack);
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
