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

    let playerCount = 0;
    let positionsInUse:  Map<string, number> = new Map();
    let playerXPositions = [0, 2, 4, 6, 8];

    this.io.sockets.on( 'connection', ( socket: ISocket ) => {
      let positionX = playerXPositions[playerCount];

      if ( positionsInUse.size == 0 ) {
        console.log('positionsInUse.size', positionsInUse.size)
        positionX = playerXPositions[0];
      }
      else  {
        // loop through playerXPositions to find a value that isn't taken by positionsInUse 
        for( let index = 0; index < playerXPositions.length; index++){
          if ( !Array.from( positionsInUse.values()).includes( playerXPositions[index] )) {
            console.log('index', index)
            positionX = playerXPositions[index];
            break;
          }
        };
      }

      // store positions that are taken by the client
      positionsInUse.set( socket.id, positionX );
      console.log('positions in use', positionsInUse)

      socket.userData = {
        position: { x: positionX, y: 0,z: 0 },
        quaternion: { isQuaternion: true, _x: 0, _y: 0, _z: 0, _w: 0 },
        action: 'idle_02',
      }

      playerCount += 1;

      console.log('CONNECTED WITH', socket.id)
      console.log('player count', playerCount)
      socket.emit( 'setId', {id: socket.id, position: { x: positionX, y: 0, z: 0} } );

      socket.on( 'disconnect', () => {
        console.log( 'removing player : ' + socket.id, ' deleting now' );
        socket.broadcast.emit('deletePlayer', { id: socket.id });
        // remove the position from the list, another client is free to use it
        positionsInUse.delete(socket.id);
        playerCount -= 1;
      });

      socket.on('init', function(data){    
        socket.userData.model = data.model;
        socket.userData.position = data.position;
        socket.userData.quaternion = data.quaternion;
        socket.userData.action = data.action;
      });

      socket.on('update', function(data){
        socket.userData.position = data.position;
        socket.userData.quaternion = data.quaternion;
        socket.userData.model = data.model;
        socket.userData.action = data.action;
      });
    });

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
