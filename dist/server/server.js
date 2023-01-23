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
        const app = (0, express_1.default)();
        // create virtual paths
        app.use(express_1.default.static(path_1.default.join(__dirname, '../client')));
        this.server = new http_1.default.Server(app);
        this.io = new socket_io_1.Server(this.server);
        let playerCount = 0;
        let positionsInUse = new Map();
        let playerXPositions = [0, 2, 4, 6, 8];
        let quadRacerList = [
            "camouflage rider", "green rider", "lime rider", "mustard rider",
            "neon rider", "orange rider", "purple rider", "red rider", "red star rider",
            "blue rider",
        ];
        this.io.sockets.on('connection', (socket) => {
            // send list of quadRacers to clients
            socket.emit('quadRacerList', quadRacerList);
            let positionX = playerXPositions[playerCount];
            if (positionsInUse.size == 0) {
                console.log('positionsInUse.size', positionsInUse.size);
                positionX = playerXPositions[0];
            }
            else {
                // loop through playerXPositions to find a value that isn't taken by positionsInUse 
                for (let index = 0; index < playerXPositions.length; index++) {
                    if (!Array.from(positionsInUse.values()).includes(playerXPositions[index])) {
                        console.log('index', index);
                        positionX = playerXPositions[index];
                        break;
                    }
                }
                ;
            }
            // store positions that are taken by the client
            positionsInUse.set(socket.id, positionX);
            console.log('positions in use', positionsInUse);
            socket.userData = {
                position: { x: positionX, y: 0, z: 0 },
                quaternion: { isQuaternion: true, _x: 0, _y: 0, _z: 0, _w: 0 },
                action: 'idle_02',
                collided: false,
            };
            playerCount += 1;
            console.log('CONNECTED WITH', socket.id);
            console.log('player count', playerCount);
            socket.emit('setId', { id: socket.id, position: { x: positionX, y: 0, z: 0 } });
            socket.on('disconnect', () => {
                console.log('removing player : ' + socket.id, ' deleting now');
                socket.broadcast.emit('deletePlayer', { id: socket.id });
                // remove the position from the list, another client is free to use it
                positionsInUse.delete(socket.id);
                playerCount -= 1;
            });
            socket.on('init', function (data) {
                socket.userData.model = data.model;
                socket.userData.position = data.position;
                socket.userData.quaternion = data.quaternion;
                socket.userData.action = data.action;
                socket.userData.collided = data.collided;
            });
            socket.on('update', function (data) {
                socket.userData.position = data.position;
                socket.userData.quaternion = data.quaternion;
                socket.userData.model = data.model;
                socket.userData.action = data.action;
                socket.userData.collided = data.collided;
            });
            socket.on('updateQuadRacers', function (data) {
                quadRacerList = data;
                console.log(data);
            });
        });
        setInterval(() => {
            this.io.emit('sendQuadRacerList', quadRacerList);
        }, 2000 / FPS);
        setInterval(() => {
            let pack = [];
            this.io.sockets.sockets.forEach((socket) => {
                if (socket.userData.model !== undefined) {
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
            if (pack.length > 0) {
                this.io.emit('remoteData', pack);
            }
        }, 1000 / FPS);
    }
    Start() {
        this.server.listen(port, function () {
            console.log('Listening on PORT ' + port);
        });
    }
}
new App().Start();
