import express from 'express';
import * as dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import process from 'process';
dotenv.config();

const port = process.env.PORT;

class App {
  private server: http.Server;
  private io: Server;
  private clients: any = {};

  constructor() {
    const app = express();
    // create virtual paths
    app.use(express.static( path.join( __dirname, '../client' )));

    this.server = new http.Server( app );
    this.io = new Server( this.server );

    this.io.on( 'connection', ( socket: Socket ) => {
      console.log( socket.constructor.name );
      this.clients[ socket.id ] = {};
      console.log( this.clients );
      console.log( 'connected with socket_id: ', socket.id );
      socket.emit( 'id', socket.id );
    
      socket.on( 'disconnect', () => {
        console.log( 'socket disconnected : ' + socket.id );
        if ( this.clients && this.clients[ socket.id ] ) {
          console.log('deleting ' + socket.id);
          delete this.clients[ socket.id ];
          this.io.emit( 'removeClient', socket.id );
        }
      });
    });

    setInterval(() => {
      this.io.emit( 'clients', this.clients )
    }, 50);
  }

  public Start() {
    this.server.listen( port, function() {
      console.log( 'Listening on PORT ' + port );
    });
  }
}

new App().Start();
