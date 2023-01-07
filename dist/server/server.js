"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
dotenv.config();
const port = process_1.default.env.PORT;
const FPS = 30;
class App {
    constructor() {
        this.clients = [];
        const app = (0, express_1.default)();
        // create virtual paths
        app.use(express_1.default.static(path_1.default.join(__dirname, '../client')));
        this.server = new http_1.default.Server(app);
        this.io = new socket_io_1.Server(this.server);
        this.io.sockets.on('connection', (socket) => {
            socket.userData = {
                position: { x: 0, y: 0, z: 0 },
                quaternion: { isQuaternion: true, _x: 0, _y: 0, _z: 0, _w: 0 },
                action: 'idle_02',
            };
            //console.log( socket.constructor.name )
            const client = {
                // id: socket.id,
                position: { x: 0, y: 0, z: 0 },
                quaternion: { isQuaternion: true, _x: 0, _y: 0, _z: 0, _w: 0 },
                action: 'idle_02',
            };
            this.clients.push(client);
            // socket.data = client; // default values
            // console.log( 'socket data', socket.data );
            // console.log( 'connected with socket_id: ', socket.id );
            socket.emit('setId', { id: socket.id });
            // socket.on('updateClient', (data) => {
            //   const client = this.clients.find(client => client.id === socket.id);
            //   if (!util.isDeepStrictEqual(client.position, data.position) || !util.isDeepStrictEqual(client.quaternion, data.quaternion) || client.action !== data.action) {
            //     client.position = data.position;
            //     client.quaternion = data.quaternion;
            //     client.action = data.action;
            //     // console.log('client update data: ' + JSON.stringify(data));
            //     console.log('client data', client)
            //   }
            // });
            socket.on('init', function (data) {
                console.log('socket init', data.model);
                console.log('socket data', socket.userData);
                socket.userData.model = data.model;
                socket.userData.position = data.position;
                socket.userData.quaternion = data.quaternion;
                socket.userData.action = data.action;
            });
            socket.on('update', function (data) {
                // socket.data.id = data.id,
                socket.userData.position = data.position;
                socket.userData.quaternion = data.quaternion;
                socket.userData.model = data.model;
                socket.userData.action = data.action;
                // console.log('socket update', socket.data)
            });
            socket.on('disconnect', () => {
                socket.broadcast.emit('deletePlayer', { id: socket.id });
                console.log('removing player : ' + socket.id, ' deleting now');
                // if( this.clients ) {
                //   // get index of client.id matching socket.id
                //   let index = this.clients.findIndex(function(client) {
                //     return client.id === socket.id;
                //   });
                //   // remove the client info
                //   this.clients = [...this.clients.slice(0, index), ...this.clients.slice(index + 1)];
                //   console.log( 'socket disconnected : ' + socket.id, ' deleting now' );
                //   console.log(this.clients); // display the updated list of clients
                //   this.io.emit( 'removeClient', socket.id );
                // }
            });
        });
        // TODO: Adding and removing of client socket not working properly now that I am using array instead of object
        setInterval(() => {
            let pack = [];
            const nsp = this.io.of('/');
            // for(let id in this.io.sockets.sockets){
            this.io.sockets.sockets.forEach((socket) => {
                if (socket.userData.model !== undefined) {
                    pack.push({
                        id: socket.id,
                        model: socket.userData.model,
                        position: socket.userData.position,
                        quaternion: socket.userData.quaternion,
                        action: socket.userData.action,
                    });
                }
            });
            // }
            if (pack.length > 0) {
                this.io.emit('remoteData', pack);
                // console.log('pack size is > 0');
            }
            // this.io.fetchSockets()
            // .then((sockets) => {
            //   // console.log('no of sockets:', sockets.length)
            //   sockets.forEach((socket: ISocket ) => {
            //     if(socket.data.model !== undefined){
            //       console.log('socket data model', socket)
            //     //socket.data should be socket.userData...
            //       pack.push({
            //         id: socket.id,
            //         model: socket.data.model,
            //         position: socket.data.position,
            //         quaternion: socket.data.quaternion,
            //         action: socket.data.action,
            //       });
            //       // console.log('pack size', pack.length)
            //     }
            //   });
            //   if(pack.length > 0) {
            //     this.io.emit('remoteData', pack);
            //     // console.log('pack size is > 0');
            //   }
            // })
            // .catch(console.log)
        }, 1000 / FPS);
    }
    Start() {
        this.server.listen(port, function () {
            console.log('Listening on PORT ' + port);
        });
    }
}
new App().Start();
