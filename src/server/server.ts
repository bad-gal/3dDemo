import express from 'express';
import * as dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import process from 'process';
import util from 'node:util';

dotenv.config();

const port = process.env.PORT;
const FPS = 30;

class App {
  private server: http.Server;
  private io: Server;
  private clients: any = [];

  constructor() {
    const app = express();
    // create virtual paths
    app.use(express.static( path.join( __dirname, '../client' )));

    this.server = new http.Server( app );
    this.io = new Server( this.server );

    this.io.on( 'connection', ( socket: Socket ) => {
      console.log( socket.constructor.name )

      const client = {
        id: socket.id,
        position: { x: 0, y: 0,z: 0 },
        quaternion: { isQuaternion: true, _x: 0, _y: 0, _z: 0, _w: 0 },
        action: 'idle_02',
      }
      this.clients.push(client);

      console.log( this.clients );
      console.log( 'connected with socket_id: ', socket.id );
      socket.emit( 'newPlayer', client );

      socket.on('updateClient', (data) => {
        const client = this.clients.find(client => client.id === socket.id);

        if (!util.isDeepStrictEqual(client.position, data.position) || !util.isDeepStrictEqual(client.quaternion, data.quaternion) || client.action !== data.action) {
          client.position = data.position;
          client.quaternion = data.quaternion;
          client.action = data.action;
          // console.log('client update data: ' + JSON.stringify(data));
          console.log('client data', client)
        }
      });

      socket.on( 'disconnect', () => {
        if( this.clients ) {
          // get index of client.id matching socket.id
          let index = this.clients.findIndex(function(client) {
            return client.id === socket.id;
          });

          // remove the client info
          this.clients = [...this.clients.slice(0, index), ...this.clients.slice(index + 1)];
          console.log( 'socket disconnected : ' + socket.id, ' deleting now' );
          console.log(this.clients); // display the updated list of clients
          this.io.emit( 'removeClient', socket.id );
        }
      });
    });

    // TODO: Adding and removing of client socket not working properly now that I am using array instead of object
    setInterval(() => {
      // this.io.emit( 'clients', this.clients );
      this.tick();
    }, 1000 / FPS );
  }

  tick() {
    this.io.emit("clients", this.clients);
    for(const player of this.clients) {
      // console.log('player', player)// console.log(player, player.id)// console.log(player.x, player.y);// const inputs = inputsMap[player.id];
    }
  }

  public Start() {
    this.server.listen( port, function() {
      console.log( 'Listening on PORT ' + port );
    });
  }
}

new App().Start();
