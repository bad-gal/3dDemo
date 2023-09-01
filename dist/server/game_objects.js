"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GameObjects {
    createNewCoinLocations() {
        const coinTypes = ['bronze', 'silver', 'gold'];
        const COINS_MIN = 200;
        const COINS_MAX = 400;
        let coinLocations = [];
        let trackX = [];
        let trackZ = [];
        for (let i = 0; i < 6; i++) {
            trackX.push(i);
        }
        for (let i = -3; i > -130; i--) {
            trackZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(COINS_MIN, COINS_MAX); i++) {
            let randX = Math.floor(Math.random() * trackX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackZ.length));
            let x = trackX[randX];
            let z = trackZ[randZ];
            let coinIndex = this.generateRandomIntInRange(0, coinTypes.length - 1);
            coinLocations.push({ x: x, z: z, type: coinTypes[coinIndex] });
        }
        // remove any duplicate location values
        coinLocations = [...new Set(coinLocations)];
        return coinLocations;
    }
    createMovingSpheres() {
        const sphereTypes = ['blue-trap-sphere', 'green-trap-sphere', 'red-trap-sphere'];
        let sphereNames = [];
        for (let i = 0; i < 6; i++) {
            let index = this.generateRandomIntInRange(0, sphereTypes.length - 1);
            sphereNames.push(sphereTypes[index]);
        }
        return [
            { direction: 1, rotationZ: 0, angle: 1.9, name: sphereNames[0], position: { x: 2, y: 6, z: -6 } },
            { direction: 1, rotationZ: 0, angle: 3.4, name: sphereNames[1], position: { x: 2, y: 6, z: -9 } },
            { direction: 1, rotationZ: 0, angle: 2.7, name: sphereNames[2], position: { x: 2, y: 6, z: -27 } },
            { direction: 1, rotationZ: 0, angle: 1.5, name: sphereNames[3], position: { x: 2, y: 6, z: -30 } },
            { direction: 1, rotationZ: 0, angle: 3.8, name: sphereNames[4], position: { x: 2, y: 6, z: -73 } },
            { direction: 1, rotationZ: 0, angle: 2.2, name: sphereNames[5], position: { x: 2, y: 6, z: -77 } },
        ];
    }
    ;
    updateMovingSphere(delta, movingSpheres) {
        let minAngle = GameObjects.toRadians(-45);
        let maxAngle = GameObjects.toRadians(45);
        for (let i = 0; i < movingSpheres.length; i++) {
            let rotationSpeed = GameObjects.toRadians(movingSpheres[i].angle);
            let rotationZ = movingSpheres[i].rotationZ;
            rotationZ += rotationSpeed * movingSpheres[i].direction;
            movingSpheres[i].rotationZ = rotationZ;
            // Change direction if the max or min angle is reached
            if (rotationZ > maxAngle) {
                movingSpheres[i].direction = -1;
            }
            else if (rotationZ < minAngle) {
                movingSpheres[i].direction = 1;
            }
        }
        return movingSpheres;
    }
    ;
    createMovingHammers() {
        const hammerTypes = ['blue-hammer', 'green-hammer', 'red-hammer'];
        let hammerNames = [];
        for (let i = 0; i < 3; i++) {
            let index = this.generateRandomIntInRange(0, hammerTypes.length - 1);
            hammerNames.push(hammerTypes[index]);
        }
        return [
            { direction: -1, rotationY: 0, angle: 2.1, name: hammerNames[0], minAngle: 0, maxAngle: 90, on_side: true, position: { x: 8.3, y: 1, z: -14 } },
            { direction: -1, rotationY: 0, angle: 3.5, name: hammerNames[1], minAngle: -90, maxAngle: 0, on_side: true, position: { x: -2.6, y: 1, z: -14 } },
            { direction: -1, rotationY: 0, angle: 4.9, name: hammerNames[2], minAngle: 0, maxAngle: 359, on_side: false, position: { x: 3, y: 1, z: -19 } },
        ];
    }
    ;
    updateMovingHammers(delta, movingHammers) {
        for (let i = 0; i < movingHammers.length; i++) {
            let minAngle = GameObjects.toRadians(movingHammers[i].minAngle);
            let maxAngle = GameObjects.toRadians(movingHammers[i].maxAngle);
            let rotationSpeed = GameObjects.toRadians(movingHammers[i].angle);
            let rotationY = movingHammers[i].rotationY;
            rotationY += rotationSpeed * movingHammers[i].direction;
            movingHammers[i].rotationY = rotationY;
            // Change direction if the max or min angle is reached
            if (rotationY > maxAngle) {
                movingHammers[i].direction = -1;
            }
            else if (rotationY < minAngle) {
                movingHammers[i].direction = 1;
            }
        }
        return movingHammers;
    }
    ;
    createMovingPlatforms() {
        const platformTypes = ['floorpad_blue', 'floorpad_red', 'floorpad_green'];
        return [
            { name: platformTypes[0], platformDirection: 'vertical', direction: -1, speed: 3.9, position: { x: 2.784, y: -0.25, z: -83.7 } },
            { name: platformTypes[1], platformDirection: 'horizontal', direction: -1, speed: 6.4, position: { x: 2.784, y: -0.25, z: -92.5 } },
            { name: platformTypes[2], platformDirection: 'vertical', direction: 1, speed: 4.7, position: { x: 2.784, y: -0.25, z: -101.5 } }
        ];
    }
    updateMovingPlatforms(delta, movingPlatforms) {
        const verticalMin = -5;
        const verticalMax = 5;
        const horizontalMin = -1;
        const horizontalMax = 10;
        for (let i = 0; i < movingPlatforms.length; i++) {
            if (movingPlatforms[i].platformDirection === 'vertical') {
                let posY = movingPlatforms[i].position.y;
                posY += movingPlatforms[i].speed * movingPlatforms[i].direction * delta;
                movingPlatforms[i].position.y = posY;
                if (posY > verticalMax) {
                    movingPlatforms[i].direction = -1;
                }
                else if (posY < verticalMin) {
                    movingPlatforms[i].direction = 1;
                }
            }
            else {
                let posX = movingPlatforms[i].position.x;
                posX += movingPlatforms[i].speed * movingPlatforms[i].direction * delta;
                movingPlatforms[i].position.x = posX;
                if (posX > horizontalMax) {
                    movingPlatforms[i].direction = -1;
                }
                else if (posX < horizontalMin) {
                    movingPlatforms[i].direction = 1;
                }
            }
        }
        return movingPlatforms;
    }
    ;
    createStaticSpikes() {
        const spikeTypes = ['blue-spike', 'green-spike', 'red-spike'];
        let spikeNames = [];
        for (let i = 0; i < 20; i++) {
            let index = Math.floor(Math.random() * spikeTypes.length);
            spikeNames.push(spikeTypes[index]);
        }
        return [
            { name: spikeNames[0], position: { x: -1.2, y: 0, z: -36 } },
            { name: spikeNames[1], position: { x: 0.775, y: 0, z: -36 } },
            { name: spikeNames[2], position: { x: 2.75, y: 0, z: -36 } },
            { name: spikeNames[3], position: { x: 4.725, y: 0, z: -36 } },
            { name: spikeNames[4], position: { x: 6.7, y: 0, z: -36 } },
            { name: spikeNames[5], position: { x: -0.6, y: 0, z: -39 } },
            { name: spikeNames[6], position: { x: 1.9, y: 0, z: -39 } },
            { name: spikeNames[7], position: { x: 3.5, y: 0, z: -39 } },
            { name: spikeNames[8], position: { x: 5.7, y: 0, z: -39 } },
            { name: spikeNames[9], position: { x: 7.1, y: 0, z: -39 } },
            { name: spikeNames[10], position: { x: -1.2, y: 0, z: -41 } },
            { name: spikeNames[11], position: { x: 0.775, y: 0, z: -41 } },
            { name: spikeNames[12], position: { x: 2.75, y: 0, z: -41 } },
            { name: spikeNames[13], position: { x: 4.25, y: 0, z: -41 } },
            { name: spikeNames[14], position: { x: 6.34, y: 0, z: -41 } },
            { name: spikeNames[15], position: { x: -1.2, y: 0, z: -43 } },
            { name: spikeNames[16], position: { x: 0.775, y: 0, z: -43 } },
            { name: spikeNames[17], position: { x: 2.75, y: 0, z: -43 } },
            { name: spikeNames[18], position: { x: 4.725, y: 0, z: -43 } },
            { name: spikeNames[19], position: { x: 6.7, y: 0, z: -43 } },
        ];
    }
    ;
    createMovingBalls() {
        const ballTypes = ['ball1', 'ball2', 'ball3', 'ball4'];
        let ballNames = [];
        for (let i = 0; i < 6; i++) {
            let index = this.generateRandomIntInRange(0, ballTypes.length - 1);
            ballNames.push(ballTypes[index]);
        }
        return [
            { directionX: -1, speed: 6.6, name: ballNames[0] + "_0", rotation: 0.2, position: { x: 2, y: 1, z: -50 } },
            { directionX: 1, speed: 8.4, name: ballNames[1] + "_1", rotation: 0.4, position: { x: 4, y: 1, z: -55 } },
            { directionX: -1, speed: 10.0, name: ballNames[2] + "_2", rotation: 0.6, position: { x: -1, y: 1, z: -60 } },
            { directionX: 1, speed: 7.3, name: ballNames[3] + "_4", rotation: 0.8, position: { x: 3, y: 1, z: -65 } },
            { directionX: -1, speed: 9.1, name: ballNames[4] + "_5", rotation: 0.3, position: { x: 6, y: 1, z: -70 } },
            { directionX: 1, speed: 6.9, name: ballNames[5] + "_6", rotation: 0.5, position: { x: 5, y: 1, z: -75 } },
        ];
    }
    ;
    updateMovingBalls(delta, movingBalls) {
        const minX = -1;
        const maxX = 7;
        for (let i = 0; i < movingBalls.length; i++) {
            let posX = movingBalls[i].position.x;
            if (posX > maxX) {
                movingBalls[i].directionX = -1;
            }
            else if (posX < minX) {
                movingBalls[i].directionX = 1;
            }
            posX += movingBalls[i].speed * movingBalls[i].directionX * delta;
            movingBalls[i].position.x = posX;
            movingBalls[i].rotation += 1.6 * delta;
        }
        return movingBalls;
    }
    ;
    refreshPlayerPositions(playerXPositions, positionMap, socket_id) {
        const leavingPlayerPosition = positionMap.get(socket_id);
        playerXPositions.unshift(leavingPlayerPosition);
        playerXPositions.sort(function (a, b) {
            return a - b;
        });
    }
    generateRandomIntInRange(start, end) {
        return Math.floor(Math.random() * (end - start + 1) + start);
    }
    static toRadians(angle) {
        return angle * (Math.PI / 180);
    }
}
exports.default = GameObjects;
