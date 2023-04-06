"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GameObjects {
    constructor() {
        this.barrelLength_X = 6;
        this.barrelLength_Z = 8;
    }
    createNewGroundObstacles() {
        const groundObstacleTypes = ['barrel', 'barrel_side'];
        let groundObstacleLocations = [];
        const BARREL_MIN = 2;
        const BARREL_MAX = 6;
        const LARGE_TRACK_BARREL_MIN = 6;
        const LARGE_TRACK_BARREL_MAX = 12;
        // ************** TRACK ONE - MAIN RUNWAY ***************
        const trackOneX = [];
        const trackOneZ = [];
        for (let i = (0 + (this.barrelLength_X / 2)); i < (18 - (this.barrelLength_X / 2)); i++) {
            trackOneX.push(i);
        }
        for (let i = (-2 - (this.barrelLength_Z / 2)); i > (-94 - (this.barrelLength_Z / 2)); i--) {
            trackOneZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(BARREL_MIN, BARREL_MAX); i++) {
            let randX = Math.floor(Math.random() * trackOneX.length);
            let randZ = Math.floor(Math.random() * trackOneZ.length);
            let x = trackOneX[randX];
            let z = trackOneZ[randZ];
            if (i > 0) {
                let intersected = false;
                ({ x, z, intersected } = this.checkIntersected(groundObstacleLocations, i, x, this.barrelLength_X, z, this.barrelLength_Z, intersected, trackOneX, trackOneZ));
            }
            const obstacleType = groundObstacleTypes[this.generateRandomIntInRange(0, 1)];
            groundObstacleLocations.push({ type: obstacleType, position: { x: x, z: z, } });
        }
        // ************** TRACK TWO - FIRST HORIZONTAL RUNWAY ***************
        const trackTwoX = [];
        const trackTwoZ = [];
        for (let i = (-60 + (this.barrelLength_X / 2)); i < (77 - (this.barrelLength_X / 2)); i++) {
            trackTwoX.push(i);
        }
        for (let i = (-99 - (this.barrelLength_Z / 2)); i > (-117 + (this.barrelLength_Z / 2)); i--) {
            trackTwoZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(LARGE_TRACK_BARREL_MIN, LARGE_TRACK_BARREL_MAX); i++) {
            let randX = Math.floor(Math.random() * trackTwoX.length);
            let randZ = Math.floor(Math.random() * trackTwoZ.length);
            let x = trackTwoX[randX];
            let z = trackTwoZ[randZ];
            if (i > 0) {
                let intersected = false;
                ({ x, z, intersected } = this.checkIntersected(groundObstacleLocations, i, x, this.barrelLength_X, z, this.barrelLength_Z, intersected, trackTwoX, trackTwoZ));
            }
            const obstacleType = groundObstacleTypes[this.generateRandomIntInRange(0, 1)];
            groundObstacleLocations.push({ type: obstacleType, position: { x: x, z: z, } });
        }
        // ************** TRACK THREE  - RIGHT RUNWAY ***************
        const trackThreeX = [];
        const trackThreeZ = [];
        for (let i = (60 + (this.barrelLength_X / 2)); i < (77 - (this.barrelLength_X / 2)); i++) {
            trackThreeX.push(i);
        }
        for (let i = (-117 - (this.barrelLength_Z / 2)); i > (-217 + (this.barrelLength_Z / 2)); i--) {
            trackThreeZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(BARREL_MIN, BARREL_MAX); i++) {
            let randX = Math.floor(Math.random() * trackThreeX.length);
            let randZ = Math.floor(Math.random() * trackThreeZ.length);
            let x = trackThreeX[randX];
            let z = trackThreeZ[randZ];
            if (i > 0) {
                let intersected = false;
                ({ x, z, intersected } = this.checkIntersected(groundObstacleLocations, i, x, this.barrelLength_X, z, this.barrelLength_Z, intersected, trackThreeX, trackThreeZ));
            }
            const obstacleType = groundObstacleTypes[this.generateRandomIntInRange(0, 1)];
            groundObstacleLocations.push({ type: obstacleType, position: { x: x, z: z, } });
        }
        // ************** TRACK FOUR  - LEFT RUNWAY ***************
        const trackFourX = [];
        const trackFourZ = [];
        for (let i = (-42 - (this.barrelLength_X / 2)); i > (-60 + (this.barrelLength_X / 2)); i--) {
            trackFourX.push(i);
        }
        for (let i = (-117 - (this.barrelLength_Z / 2)); i > (-217 + (this.barrelLength_Z / 2)); i--) {
            trackFourZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(BARREL_MIN, BARREL_MAX); i++) {
            let randX = Math.floor(Math.random() * trackFourX.length);
            let randZ = Math.floor(Math.random() * trackFourZ.length);
            let x = trackFourX[randX];
            let z = trackFourZ[randZ];
            if (i > 0) {
                let intersected = false;
                ({ x, z, intersected } = this.checkIntersected(groundObstacleLocations, i, x, this.barrelLength_X, z, this.barrelLength_Z, intersected, trackFourX, trackFourZ));
            }
            const obstacleType = groundObstacleTypes[this.generateRandomIntInRange(0, 1)];
            groundObstacleLocations.push({ type: obstacleType, position: { x: x, z: z, } });
        }
        // ************** TRACK FIVE  - SECOND HORIZONTAL RUNWAY ***************
        const trackFiveX = [];
        const trackFiveZ = [];
        for (let i = (77 - (this.barrelLength_X / 2)); i > (-58 + (this.barrelLength_X / 2)); i--) {
            trackFiveX.push(i);
        }
        for (let i = (-220 - (this.barrelLength_Z / 2)); i > (-236 + (this.barrelLength_Z / 2)); i--) {
            trackFiveZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(LARGE_TRACK_BARREL_MIN, LARGE_TRACK_BARREL_MAX); i++) {
            let randX = Math.floor(Math.random() * trackFiveX.length);
            let randZ = Math.floor(Math.random() * trackFiveZ.length);
            let x = trackFiveX[randX];
            let z = trackFiveZ[randZ];
            if (i > 0) {
                let intersected = false;
                ({ x, z, intersected } = this.checkIntersected(groundObstacleLocations, i, x, this.barrelLength_X, z, this.barrelLength_Z, intersected, trackFiveX, trackFiveZ));
            }
            const obstacleType = groundObstacleTypes[this.generateRandomIntInRange(0, 1)];
            groundObstacleLocations.push({ type: obstacleType, position: { x: x, z: z, } });
        }
        // ************** TRACK SIX  - FINAL RUNWAY ***************
        const trackSixX = [];
        const trackSixZ = [];
        for (let i = (0 + (this.barrelLength_X / 2)); i < (18 - (this.barrelLength_X / 2)); i++) {
            trackSixX.push(i);
        }
        for (let i = (-238 - (this.barrelLength_Z / 2)); i > (-331 + (this.barrelLength_Z / 2)); i--) {
            trackSixZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(LARGE_TRACK_BARREL_MIN, LARGE_TRACK_BARREL_MAX); i++) {
            let randX = Math.floor(Math.random() * trackSixX.length);
            let randZ = Math.floor(Math.random() * trackSixZ.length);
            let x = trackSixX[randX];
            let z = trackSixZ[randZ];
            if (i > 0) {
                let intersected = false;
                ({ x, z, intersected } = this.checkIntersected(groundObstacleLocations, i, x, this.barrelLength_X, z, this.barrelLength_Z, intersected, trackSixX, trackSixZ));
            }
            const obstacleType = groundObstacleTypes[this.generateRandomIntInRange(0, 1)];
            groundObstacleLocations.push({ type: obstacleType, position: { x: x, z: z, } });
        }
        // remove any duplicate location values
        groundObstacleLocations = [...new Set(groundObstacleLocations)];
        return groundObstacleLocations;
    }
    createNewCoinLocations(groundObstacleLocations) {
        const coinTypes = ['bronze', 'silver', 'gold'];
        const COINS_MIN = 30;
        const COINS_MAX = 50;
        const LARGE_TRACK_COINS_MIN = 100;
        const LARGE_TRACK_COINS_MAX = 200;
        let coinLocations = [];
        // ************** TRACK ONE - MAIN RUNWAY ***************
        let trackOneX = [];
        let trackOneZ = [];
        for (let i = 1; i < 18; i++) {
            trackOneX.push(i);
        }
        for (let i = 2; i > -121; i--) {
            trackOneZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(COINS_MIN, COINS_MAX); i++) {
            let randX = Math.floor(Math.random() * trackOneX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackOneZ.length));
            let x = trackOneX[randX];
            let z = trackOneZ[randZ];
            let coinIndex = this.generateRandomIntInRange(0, coinTypes.length - 1);
            coinLocations.push({ x: x, z: z, type: coinTypes[coinIndex] });
        }
        // ************** TRACK TWO - FIRST HORIZONAL RUNWAY ***************
        let trackTwoX = [];
        let trackTwoZ = [];
        for (let i = -60; i < 78; i++) {
            trackTwoX.push(i);
        }
        for (let i = -99; i > -118; i--) {
            trackTwoZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(LARGE_TRACK_COINS_MIN, LARGE_TRACK_COINS_MAX); i++) {
            let randX = Math.floor(Math.random() * trackTwoX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackTwoZ.length));
            let x = trackTwoX[randX];
            let z = trackTwoZ[randZ];
            let coinIndex = this.generateRandomIntInRange(0, coinTypes.length - 1);
            coinLocations.push({ x: x, z: z, type: coinTypes[coinIndex] });
        }
        // ************** TRACK THREE  - RIGHT RUNWAY ***************
        let trackThreeX = [];
        let trackThreeZ = [];
        for (let i = 60; i < 78; i++) {
            trackThreeX.push(i);
        }
        for (let i = -117; i > -218; i--) {
            trackThreeZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(LARGE_TRACK_COINS_MIN, LARGE_TRACK_COINS_MAX); i++) {
            let randX = Math.floor(Math.random() * trackThreeX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackThreeZ.length));
            let x = trackThreeX[randX];
            let z = trackThreeZ[randZ];
            let coinIndex = this.generateRandomIntInRange(0, coinTypes.length - 1);
            coinLocations.push({ x: x, z: z, type: coinTypes[coinIndex] });
        }
        // ************** TRACK FOUR  - LEFT RUNWAY ***************
        let trackFourX = [];
        let trackFourZ = [];
        for (let i = -60; i < -41; i++) {
            trackFourX.push(i);
        }
        for (let i = -118; i > -217; i--) {
            trackFourZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(LARGE_TRACK_COINS_MIN, LARGE_TRACK_COINS_MAX); i++) {
            let randX = Math.floor(Math.random() * trackFourX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackFourZ.length));
            let x = trackFourX[randX];
            let z = trackFourZ[randZ];
            let coinIndex = this.generateRandomIntInRange(0, coinTypes.length - 1);
            coinLocations.push({ x: x, z: z, type: coinTypes[coinIndex] });
        }
        // ************** TRACK FIVE  - SECOND HORIZONTAL RUNWAY ***************
        let trackFiveX = [];
        let trackFiveZ = [];
        for (let i = -58; i < 78; i++) {
            trackFiveX.push(i);
        }
        for (let i = -220; i > -237; i--) {
            trackFiveZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(LARGE_TRACK_COINS_MIN, LARGE_TRACK_COINS_MAX); i++) {
            let randX = Math.floor(Math.random() * trackFiveX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackFiveZ.length));
            let x = trackFiveX[randX];
            let z = trackFiveZ[randZ];
            let coinIndex = this.generateRandomIntInRange(0, coinTypes.length - 1);
            coinLocations.push({ x: x, z: z, type: coinTypes[coinIndex] });
        }
        // ************** TRACK SIX  - FINAL RUNWAY ***************
        let trackSixX = [];
        let trackSixZ = [];
        for (let i = 0; i < 18; i++) {
            trackSixX.push(i);
        }
        for (let i = -238; i > -332; i--) {
            trackSixZ.push(i);
        }
        for (let i = 0; i < this.generateRandomIntInRange(LARGE_TRACK_COINS_MIN, LARGE_TRACK_COINS_MAX); i++) {
            let randX = Math.floor(Math.random() * trackSixX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackSixZ.length));
            let x = trackSixX[randX];
            let z = trackSixZ[randZ];
            let coinIndex = this.generateRandomIntInRange(0, coinTypes.length - 1);
            coinLocations.push({ x: x, z: z, type: coinTypes[coinIndex] });
        }
        // remove any duplicate location values
        coinLocations = [...new Set(coinLocations)];
        // remove any coins that are intersected with barrels
        for (let i = 0; i < groundObstacleLocations.length; i++) {
            for (let j = coinLocations.length - 1; j >= 0; j--) {
                const obstacle = groundObstacleLocations[i];
                const obstacleX = obstacle.position.x;
                const obstacleZ = obstacle.position.z;
                const coin = coinLocations[j];
                const coinX = coin.x;
                const coinZ = coin.z;
                if (((coinX >= obstacleX && coinX <= obstacleX + (this.barrelLength_X / 2)) ||
                    (coinX + (this.barrelLength_X / 2) >= obstacleX && coinX + (this.barrelLength_X / 2) <= obstacleX + (this.barrelLength_X / 2))) &&
                    ((coinZ >= obstacleZ && coinZ <= obstacleZ + (this.barrelLength_Z / 2)) ||
                        (coinZ + (this.barrelLength_Z / 2) >= obstacleZ && coinZ + (this.barrelLength_Z / 2) <= obstacleZ + (this.barrelLength_Z / 2)))) {
                    coinLocations.splice(j, 1);
                }
            }
        }
        return coinLocations;
    }
    createNewMovingObstacles() {
        const MOVING_OBJECT_MIN = 12;
        const MOVING_OBJECT_MAX = 20;
        const MOVING_OBJECT_TYPES = ['strawberry', 'apple', 'banana', 'cherry', 'pear'];
        const movingObstacleLocations = [];
        // ************** TRACK ONE - MAIN RUNWAY ***************
        // no fruits on track one
        // ************** TRACK TWO - FIRST HORIZONAL RUNWAY ***************
        let trackTwoX = [];
        let trackTwoZ = [];
        for (let i = 0; i < this.generateRandomIntInRange(MOVING_OBJECT_MIN, MOVING_OBJECT_MAX); i++) {
            for (let i = -60; i < 78; i++) {
                trackTwoX.push(i);
            }
            for (let i = -99; i > -118; i--) {
                trackTwoZ.push(i);
            }
            let randX = Math.floor(Math.random() * trackTwoX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackTwoZ.length));
            let x = trackTwoX[randX];
            let y = this.generateRandomIntInRange(1, 4);
            let z = trackTwoZ[randZ];
            let velX = this.generateRandomIntInRange(5, 8);
            let velY = this.generateRandomIntInRange(5, 10);
            let velZ = this.generateRandomIntInRange(4, 9);
            const objectType = MOVING_OBJECT_TYPES[this.generateRandomIntInRange(0, MOVING_OBJECT_TYPES.length - 1)];
            movingObstacleLocations.push({ type: objectType, position: { x: x, y: y, z: z }, velocity: { x: velX, y: velY, z: velZ }, rotation: { x: 0, y: 0, z: 0 }, playArea: { minX: -70, maxX: 85, minZ: -120, maxZ: -90 } });
        }
        // ************** TRACK THREE  - RIGHT RUNWAY ***************
        let trackThreeX = [];
        let trackThreeZ = [];
        for (let i = 0; i < this.generateRandomIntInRange(MOVING_OBJECT_MIN, MOVING_OBJECT_MAX); i++) {
            for (let i = 60; i < 78; i++) {
                trackThreeX.push(i);
            }
            for (let i = -117; i > -218; i--) {
                trackThreeZ.push(i);
            }
            let randX = Math.floor(Math.random() * trackThreeX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackThreeZ.length));
            let x = trackThreeX[randX];
            let y = this.generateRandomIntInRange(1, 4);
            let z = trackThreeZ[randZ];
            let velX = this.generateRandomIntInRange(5, 8);
            let velY = this.generateRandomIntInRange(5, 10);
            let velZ = this.generateRandomIntInRange(4, 9);
            const objectType = MOVING_OBJECT_TYPES[this.generateRandomIntInRange(0, MOVING_OBJECT_TYPES.length - 1)];
            movingObstacleLocations.push({ type: objectType, position: { x: x, y: y, z: z }, velocity: { x: velX, y: velY, z: velZ }, rotation: { x: 0, y: 0, z: 0 }, playArea: { minX: 55, maxX: 85, minZ: -220, maxZ: -115 } });
        }
        // ************** TRACK FOUR  - LEFT RUNWAY ***************
        let trackFourX = [];
        let trackFourZ = [];
        for (let i = 0; i < this.generateRandomIntInRange(MOVING_OBJECT_MIN, MOVING_OBJECT_MAX); i++) {
            for (let i = -60; i < -41; i++) {
                trackFourX.push(i);
            }
            for (let i = -117; i > -218; i--) {
                trackFourZ.push(i);
            }
            let randX = Math.floor(Math.random() * trackFourX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackFourZ.length));
            let x = trackFourX[randX];
            let y = this.generateRandomIntInRange(1, 4);
            let z = trackFourZ[randZ];
            let velX = this.generateRandomIntInRange(5, 8);
            let velY = this.generateRandomIntInRange(5, 10);
            let velZ = this.generateRandomIntInRange(4, 9);
            const objectType = MOVING_OBJECT_TYPES[this.generateRandomIntInRange(0, MOVING_OBJECT_TYPES.length - 1)];
            movingObstacleLocations.push({ type: objectType, position: { x: x, y: y, z: z }, velocity: { x: velX, y: velY, z: velZ }, rotation: { x: 0, y: 0, z: 0 }, playArea: { minX: -55, maxX: -38, minZ: -220, maxZ: -115 } });
        }
        // ************** TRACK FIVE  - SECOND HORIZONTAL RUNWAY ***************
        let trackFiveX = [];
        let trackFiveZ = [];
        for (let i = 0; i < this.generateRandomIntInRange(MOVING_OBJECT_MIN, MOVING_OBJECT_MAX); i++) {
            for (let i = -60; i < 78; i++) {
                trackFiveX.push(i);
            }
            for (let i = -220; i > -237; i--) {
                trackFiveZ.push(i);
            }
            let randX = Math.floor(Math.random() * trackFiveX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackFiveZ.length));
            let x = trackFiveX[randX];
            let y = this.generateRandomIntInRange(1, 4);
            let z = trackFiveZ[randZ];
            let velX = this.generateRandomIntInRange(5, 8);
            let velY = this.generateRandomIntInRange(5, 10);
            let velZ = this.generateRandomIntInRange(4, 9);
            const objectType = MOVING_OBJECT_TYPES[this.generateRandomIntInRange(0, MOVING_OBJECT_TYPES.length - 1)];
            movingObstacleLocations.push({ type: objectType, position: { x: x, y: y, z: z }, velocity: { x: velX, y: velY, z: velZ }, rotation: { x: 0, y: 0, z: 0 }, playArea: { minX: -65, maxX: 80, minZ: -240, maxZ: -215 } });
        }
        // ************** TRACK SIX  - FINAL RUNWAY ***************
        let trackSixX = [];
        let trackSixZ = [];
        for (let i = 0; i < this.generateRandomIntInRange(MOVING_OBJECT_MIN, MOVING_OBJECT_MAX); i++) {
            for (let i = -10; i < 25; i++) {
                trackSixX.push(i);
            }
            for (let i = -238; i > -332; i--) {
                trackSixZ.push(i);
            }
            let randX = Math.floor(Math.random() * trackSixX.length);
            let randZ = Math.floor(Math.floor(Math.random() * trackSixZ.length));
            let x = trackSixX[randX];
            let y = this.generateRandomIntInRange(1, 4);
            let z = trackSixZ[randZ];
            let velX = this.generateRandomIntInRange(5, 8);
            let velY = this.generateRandomIntInRange(5, 10);
            let velZ = this.generateRandomIntInRange(4, 9);
            const objectType = MOVING_OBJECT_TYPES[this.generateRandomIntInRange(0, MOVING_OBJECT_TYPES.length - 1)];
            movingObstacleLocations.push({ type: objectType, position: { x: x, y: y, z: z }, velocity: { x: velX, y: velY, z: velZ }, rotation: { x: 0, y: 0, z: 0 }, playArea: { minX: -20, maxX: 30, minZ: -340, maxZ: -230 } });
        }
        return movingObstacleLocations;
    }
    updateMovingObstacles(delta, movingObstacles) {
        for (let i = 0; i < movingObstacles.length; i++) {
            let element = movingObstacles[i];
            let currentPosX = element.position.x;
            let currentPosY = element.position.y;
            let currentPosZ = element.position.z;
            let boundsMinX = element.playArea.minX;
            let boundsMaxX = element.playArea.maxX;
            let boundsMinZ = element.playArea.minZ;
            let boundsMaxZ = element.playArea.maxZ;
            if (currentPosX >= boundsMaxX) {
                element.velocity.x = -element.velocity.x;
            }
            else if (currentPosX <= boundsMinX) {
                element.velocity.x = Math.abs(element.velocity.x);
            }
            if (currentPosY > 11) {
                element.velocity.y = -element.velocity.y;
            }
            else if (currentPosY <= 0.25) {
                element.velocity.y = Math.abs(element.velocity.y);
            }
            if (currentPosZ >= boundsMaxZ) {
                element.velocity.z = -element.velocity.z;
            }
            else if (currentPosZ <= boundsMinZ) {
                element.velocity.z = Math.abs(element.velocity.z);
            }
            for (let j = 0; j < movingObstacles.length; j++) {
                if (element !== movingObstacles[j]) {
                    if (this.getDistance(currentPosX, currentPosY, currentPosZ, movingObstacles[j].position.x, movingObstacles[j].position.y, movingObstacles[j].position.z) < 0.5) {
                        let tempX = currentPosX;
                        let tempY = currentPosY;
                        let tempZ = currentPosZ;
                        currentPosX = movingObstacles[j].position.x;
                        currentPosY = movingObstacles[j].position.y;
                        currentPosZ = movingObstacles[j].position.z;
                        movingObstacles[j].position.x = tempX;
                        movingObstacles[j].position.y = tempY;
                        movingObstacles[j].position.z = tempZ;
                    }
                }
            }
            // mimic THREE js addScaledVector method
            let newPositionX = element.velocity.x * delta + currentPosX;
            let newPositionY = element.velocity.y * delta + currentPosY;
            let newPositionZ = element.velocity.z * delta + currentPosZ;
            // calculate the amount to rotate in the model
            const rotationAmount = 2 * Math.PI * (delta / 2);
            const rotationValue = movingObstacles[i].rotation.x + rotationAmount;
            movingObstacles[i].rotation.x = rotationValue;
            movingObstacles[i].rotation.y = 0;
            movingObstacles[i].rotation.z = rotationValue;
            if (rotationValue >= 2 * Math.PI) {
                movingObstacles[i].rotation.x = 0;
                movingObstacles[i].rotation.y = 0;
                movingObstacles[i].rotation.z = 0;
            }
            movingObstacles[i].position.x = newPositionX;
            movingObstacles[i].position.y = newPositionY;
            movingObstacles[i].position.z = newPositionZ;
            movingObstacles[i].velocity.x = element.velocity.x;
            movingObstacles[i].velocity.y = element.velocity.y;
            movingObstacles[i].velocity.z = element.velocity.z;
        }
        ;
        return movingObstacles;
    }
    refreshPlayerPositions(playerXPositions, positionMap, socket_id) {
        const leavingPlayerPosition = positionMap.get(socket_id);
        playerXPositions.unshift(leavingPlayerPosition);
        playerXPositions.sort(function (a, b) {
            return a - b;
        });
    }
    checkIntersected(groundObstacleLocations, i, x, barrelLengthX, z, barrelLengthZ, intersected, trackX, trackZ) {
        do {
            for (let j = 0; j < groundObstacleLocations.length; j++) {
                if (i !== j) {
                    const obstacle = groundObstacleLocations[j];
                    const obstacleX = obstacle.position.x;
                    const obstacleZ = obstacle.position.z;
                    if (((x >= obstacleX && x <= obstacleX + barrelLengthX) ||
                        (x + barrelLengthX >= obstacleX && x + barrelLengthX <= obstacleX + barrelLengthX)) &&
                        ((z >= obstacleZ && z <= obstacleZ + barrelLengthZ) ||
                            (z + barrelLengthZ >= obstacleZ && z + barrelLengthZ <= obstacleZ + barrelLengthZ))) {
                        intersected = true;
                        x = this.generateUniqueRandomIntInRange(trackX[0], trackX[trackX.length - 1], [x]);
                        z = this.generateUniqueRandomIntInRange(trackZ[0], trackZ[trackZ.length - 1], [z]);
                        break;
                    }
                    else {
                        intersected = false;
                    }
                }
            }
        } while (intersected);
        return { x, z, intersected };
    }
    getDistance(x1, y1, z1, x2, y2, z2) {
        let y = x2 - x1;
        let x = y2 - y1;
        let z = z2 - z1;
        return Math.sqrt(x * x + y * y + z * z);
    }
    generateRandomIntInRange(start, end) {
        return Math.floor(Math.random() * (end - start + 1) + start);
    }
    generateUniqueRandomIntInRange(start, end, existingValues) {
        let value;
        do {
            value = this.generateRandomIntInRange(start, end);
        } while (existingValues.includes(value));
        return value;
    }
}
exports.default = GameObjects;
