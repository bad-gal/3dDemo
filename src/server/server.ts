import express from 'express';
import * as dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import process from 'process';

dotenv.config();

const port = process.env.PORT;
const FPS = 30;
const SPEED = 0.1;
const inputsMap = {};

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
      console.log( socket.constructor.name );

      // inputsMap[socket.id] = {
      //   up: false,
      //   down: false,
      //   left: false,
      //   right: false
      // };

      this.clients.push({
        id: socket.id,
        x: 0,
        y: 0,
      });

      console.log( this.clients );
      console.log( 'connected with socket_id: ', socket.id );
      socket.emit( 'id', socket.id );
    
      // socket.on( 'input', (inputs) => {
      //   inputsMap[socket.id] = inputs;
      // });

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
      this.io.emit( 'clients', this.clients );
      this.tick();
    }, 1000 / FPS );
  }

  tick() {
    for(const player of this.clients) {
      console.log(player, player.id)
      console.log(player.x, player.y);
      // const inputs = inputsMap[player.id];

      // if(inputs.right){
      //   player.x -= SPEED;
      // }
      // if(inputs.left){
      //   player.x += SPEED;
      // }
    }

    // this.io.emit("players", players);
  }

  public Start() {
    this.server.listen( port, function() {
      console.log( 'Listening on PORT ' + port );
    });
  }
}

new App().Start();
