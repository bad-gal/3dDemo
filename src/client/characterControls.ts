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
  acceleration = new THREE.Vector3(1, 0.25, 20.0);
  velocity = new THREE.Vector3();

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
    let [moveForward, moveBackward, moveLeft, moveRight] = [false, false, false, false];
    let play = '';
    
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = this.model.quaternion.clone();
    const acc = this.acceleration.clone();
    let inputVector = new THREE.Vector3();

    // keyboard controls
    if (keysPressed['w'] || keysPressed['ArrowUp']) {
      if (this.velocity.z > 0) {
        this.velocity.setZ(0)
      } else {
        this.velocity.z -= acc.z * delta;
      }
      play = 'drive_fast';
      moveForward = true;
    }

    if (keysPressed['s'] || keysPressed['ArrowDown']) {
      if (this.velocity.z < 0) {
        this.velocity.setZ(0)
      } else {
        this.velocity.z += acc.z * delta;
      }
      play = 'drive';
      moveBackward = true;
    }

    if (keysPressed['a'] || keysPressed['ArrowLeft']) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * delta * this.acceleration.y);
      _R.multiply(_Q);
      if (this.velocity.z !== 0) {
        this.velocity.setZ(0)
      }
      play = 'drive_turn_left';
      moveLeft = true;
    }

    if (keysPressed['d'] || keysPressed['ArrowRight']) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * delta * this.acceleration.y);
      _R.multiply(_Q);
      if (this.velocity.z !== 0) {
        this.velocity.setZ(0)
      }
      play = 'drive_turn_right';
      moveRight = true;
    }

    
    if (moveBackward !== false || moveForward !== false || moveLeft !== false || moveRight !== false) {
      this.model.quaternion.copy(_R);
      inputVector.applyQuaternion(this.camera.quaternion);

      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(this.model.quaternion);
      forward.normalize();

      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(this.model.quaternion);
      sideways.normalize();

      sideways.multiplyScalar(this.velocity.x * delta);
      forward.multiplyScalar(this.velocity.z * delta);

      this.model.position.add(forward);
      this.model.position.add(sideways);

      console.log('position', this.model.position)
    }
    
    // I think I need to use keyup also as it is not working properly when changing animations
    
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
    } else if (play === ''){
      play = 'idle_02';
    }

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