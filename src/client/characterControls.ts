import * as THREE from 'three';

const W = 'w'
const A = 'a'
const S = 's'
const D = 'd'
// const SHIFT = 'shift'

export class CharacterControls {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  animationsMap: Map<string, THREE.AnimationAction> = new Map();
  camera: THREE.Camera
  toggleDrive: boolean = true;
  currentAction: string;

  driveDirection = new THREE.Vector3();
  rotateAngle = new THREE.Vector3( 0, 1, 0);
  rotateQuarternion: THREE.Quaternion = new THREE.Quaternion();
  cameraTarget = new THREE.Vector3();

  fadeDuration: number = 0.2;
  driveFastVelocity = 5;
  driveBasicVelocity = 2;

  constructor( model: THREE.Group, mixer: THREE.AnimationMixer, animationsMap: Map<string, THREE.AnimationAction>, camera: THREE.Camera, currentAction: string) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.currentAction = currentAction;

    this.animationsMap.forEach(( value, key ) => {
      if( key === currentAction) {
        value.play();
      }
    });
    this.camera = camera;
  };

  public switchDriveToggle() {
    this.toggleDrive = !this.toggleDrive
  };

  public update( delta: number, keysPressed: { [key: string]: boolean; } = {} ) {
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    // keyboard controls
    if (keysPressed['w'] || keysPressed['ArrowUp']) {
      moveForward = true;
    }

    if (keysPressed['s'] || keysPressed['ArrowDown']) {
        moveBackward = true;
    }

    if (keysPressed['a'] || keysPressed['ArrowLeft']) {
        moveLeft = true;
    }

    if (keysPressed['d'] || keysPressed['ArrowRight']) {
        moveRight = true;
    }

    // exit if no movement was instigated by player
    if (moveBackward === false && moveForward === false && moveLeft === false && moveRight === false) {
      return;
    }

    let inputVector = new THREE.Vector3();

    // react to changes
    if (moveForward) {
      inputVector.z -= 1;
    }
    if (moveBackward) {
        inputVector.z += 1;
    }
    if (moveLeft) {
        inputVector.x -= 1;
    }
    if (moveRight) {
        inputVector.x += 1;
    }
    inputVector.applyQuaternion(this.camera.quaternion);

    var velocity = new THREE.Vector3();
    velocity.add(inputVector);
    velocity.multiplyScalar(2);
    velocity.multiplyScalar(delta);
    velocity.y = 0;

    if (inputVector.lengthSq() > 0) {

    }
    this.model.position.add(velocity);
    
    // if( keysPressed['a'] == true || keysPressed['w'] == true || keysPressed['s'] == true || keysPressed['d'] == true ) {
    //   directionPressed = true;
    //   // I haven't figured out speed and movement of the racer yet
    // }
     
    // I think I need to use keyup also as it is not working properly when changing animations
    let play = '';
    if( keysPressed['t'] == true ) {
      play = 'drive_fast';
      console.log('I want to play drive fast');
    } else if( keysPressed['n'] == true ) {
      play = 'drive_nitro';
      console.log('I want to play nitro');
    } else if( keysPressed['1'] == true ) {
      play = 'drive_trick_01';
      console.log('I want to play trick 1');
    } else if( keysPressed['2'] == true ) {
      play = 'drive_trick_02';
      console.log('I want to play trick 2');
    } else if( keysPressed['3'] == true ) {
      play = 'drive_trick_03';
      console.log('I want to play trick 3');
    } else if( keysPressed['4'] == true ) {
      play = 'drive_trick_04';
      console.log('I want to play trick 4');
    } else {
      play = 'idle_02';
    }

    // if ( directionPressed && this.toggleDrive ) {
    //   play = 'drive_fast';
    //   console.log('drive_fast');
    // } else if ( directionPressed ) {
    //   play = 'drive';
    //   console.log('drive');
    // } else {
    //   play = 'idle_02';
    // }

    if ( this.currentAction != play ) {
      const toPlay = this.animationsMap.get( play );
      const current = this.animationsMap.get( this.currentAction );

      current?.fadeOut( this.fadeDuration );
      toPlay?.reset().fadeIn( this.fadeDuration ).play();
      this.currentAction = play;
    }
    this.mixer.update( delta );
  };
}