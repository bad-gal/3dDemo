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
const crypto_1 = require("crypto");
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
        let playerXPositions = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
        let playerCount = 0;
        let quadRacerList = [
            "camouflage rider", "green rider", "lime rider", "mustard rider",
            "neon rider", "orange rider", "purple rider", "red rider", "red star rider",
            "blue rider",
        ];
        let clientStartingPositions = new Map();
        let startTimer = false;
        const waitingTime = 5;
        let waitingRoomTimeRemaining = waitingTime;
        // store locations of coins to be displayed in game
        // might be some extra work to do as coins may be too close together in some instances
        let coinsLength = (0, crypto_1.randomInt)(30, 55);
        let coinTypes = ['bronze', 'silver', 'gold'];
        let coinLocations = [];
        for (let i = 0; i < coinsLength; i++) {
            let x = (0, crypto_1.randomInt)(-20, 20);
            let z = (0, crypto_1.randomInt)(-20, 20);
            let coinIndex = (0, crypto_1.randomInt)(0, 3);
            coinLocations.push({ x: x, z: z, type: coinTypes[coinIndex] });
        }
        // remove any duplicate location values
        coinLocations = [...new Set(coinLocations)];
        this.io.sockets.on('connection', (socket) => {
            // send list of quadRacers to clients
            socket.emit('quadRacerList', quadRacerList);
            socket.userData = {
                position: { x: 0, y: 0, z: 0 },
                quaternion: { isQuaternion: true, _x: 0, _y: 0, _z: 0, _w: 0 },
                action: 'idle_02',
                collided: false,
            };
            console.log('CONNECTED WITH', socket.id);
            console.log('player count', playerCount);
            socket.emit('setId', { id: socket.id });
            socket.on('disconnect', () => {
                const leavingModel = socket.userData.model;
                if (leavingModel != null) {
                    quadRacerList.push(leavingModel);
                    this.refreshPlayerPositions(playerXPositions, clientStartingPositions, socket.id);
                }
                console.log('playerPositions', playerXPositions);
                console.log('removing player : ' + socket.id, ' deleting now');
                socket.broadcast.emit('deletePlayer', { id: socket.id });
                if (playerCount > 0)
                    playerCount -= 1;
                // if there are no players, can we reset waitingRoomTimeRemaining to waitingTime
                // this way if the server is still running new players can join a new game
                if (playerCount == 0 && waitingRoomTimeRemaining == 0) {
                    waitingRoomTimeRemaining = waitingTime;
                }
            });
            socket.on('init', function (data) {
                socket.userData.model = data.model;
                socket.userData.position = data.position;
                socket.userData.quaternion = data.quaternion;
                socket.userData.action = data.action;
                socket.userData.collided = data.collided;
                socket.userData.score = data.score;
            });
            socket.on('update', function (data) {
                socket.userData.position = data.position;
                socket.userData.quaternion = data.quaternion;
                socket.userData.model = data.model;
                socket.userData.action = data.action;
                socket.userData.collided = data.collided;
                socket.userData.score = data.score;
            });
            socket.on('updateQuadRacers', function (data) {
                quadRacerList = data;
                console.log(data);
            });
            socket.on('startTimer', function (data) {
                startTimer = data;
            });
            socket.on('kickOutPlayer', function (data) {
                console.log('playerPositions', playerXPositions);
                socket.broadcast.emit('deletePlayer', { id: data });
                waitingRoomTimeRemaining = 0;
                startTimer = false;
                console.log('kickout stats', waitingRoomTimeRemaining, startTimer);
                socket.disconnect(true);
            });
            let positionX;
            socket.on('getPlayerPosition', function (data) {
                if (positionX === undefined) {
                    positionX = playerXPositions.shift();
                    // we are storing the starting position so if the client leaves
                    // we can add position back into playerXPositions
                    clientStartingPositions.set(socket.id, positionX);
                    playerCount++;
                }
                console.log(playerXPositions, playerCount);
                socket.emit('playerPosition', { position: { x: positionX, y: 0, z: 0 } });
            });
            // send coin locations to clients
            socket.emit('coinLocations', coinLocations);
            // a client has collected a coin
            socket.on('updateCoins', function (data) {
                let result = coinLocations.filter(coin => coin.x == data.x && coin.z == data.z);
                if (result.length == 1) {
                    result = result.flat();
                    const index = coinLocations.indexOf(result);
                    if (index > -1) {
                        coinLocations.splice(index, 1);
                    }
                    // emit the deleted coin location value to the rest of the clients
                    socket.broadcast.emit('removeCoin', result);
                }
            });
        });
        setInterval(() => {
            this.io.emit('sendQuadRacerList', quadRacerList);
        }, 2000 / FPS);
        setInterval(() => {
            if (startTimer) {
                if (waitingRoomTimeRemaining == -1) {
                    clearTimeout(waitingRoomTimeRemaining);
                    startTimer = false;
                    waitingRoomTimeRemaining = 0; //waitingTime;
                }
                else {
                    waitingRoomTimeRemaining--;
                }
                this.io.emit('30SecondsWaitingRoom', waitingRoomTimeRemaining);
            }
        }, 1000);
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
                        score: socket.userData.score,
                    });
                }
            });
            if (pack.length > 0) {
                this.io.emit('remoteData', pack);
            }
        }, 1000 / FPS);
    }
    refreshPlayerPositions(playerXPositions, positionMap, socket_id) {
        const leavingPlayerPosition = positionMap.get(socket_id);
        playerXPositions.unshift(leavingPlayerPosition);
        playerXPositions.sort(function (a, b) {
            return a - b;
        });
    }
    Start() {
        this.server.listen(port, function () {
            console.log('Listening on PORT ' + port);
        });
    }
}
new App().Start();
