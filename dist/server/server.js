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
// import { io } from 'socket.io-client';
dotenv.config();
const port = process_1.default.env.PORT;
const FPS = 30;
const SPEED = 0.1;
const inputsMap = {};
class App {
    constructor() {
        this.clients = [];
        const app = (0, express_1.default)();
        // create virtual paths
        app.use(express_1.default.static(path_1.default.join(__dirname, '../client')));
        this.server = new http_1.default.Server(app);
        this.io = new socket_io_1.Server(this.server);
        this.io.on('connection', (socket) => {
            console.log(socket.constructor.name);
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
            console.log(this.clients);
            console.log('connected with socket_id: ', socket.id);
            socket.emit('id', socket.id);
            // socket.on( 'input', (inputs) => {
            //   inputsMap[socket.id] = inputs;
            // });
            socket.on('disconnect', () => {
                if (this.clients) {
                    // get index of client.id matching socket.id
                    let index = this.clients.findIndex(function (client) {
                        return client.id === socket.id;
                    });
                    // remove the client info
                    this.clients = [...this.clients.slice(0, index), ...this.clients.slice(index + 1)];
                    console.log('socket disconnected : ' + socket.id, ' deleting now');
                    console.log(this.clients); // display the updated list of clients
                    this.io.emit('removeClient', socket.id);
                }
            });
        });
        // TODO: Adding and removing of client socket not working properly now that I am using array instead of object
        setInterval(() => {
            this.io.emit('clients', this.clients);
            this.tick();
        }, 1000 / FPS);
    }
    tick() {
        for (const player of this.clients) {
            console.log(player, player.id);
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
    Start() {
        this.server.listen(port, function () {
            console.log('Listening on PORT ' + port);
        });
    }
}
new App().Start();
