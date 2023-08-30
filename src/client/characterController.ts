import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CustomBody from "./customBody";
import {Object3D} from "three";

export default class CharacterController {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  animationsMap: Map<string, THREE.AnimationAction> = new Map();
  camera: THREE.Camera
  currentAction: string;
  fadeDuration: number = 0.2;
  acceleration = new CANNON.Vec3( 1, 0.25, 20.0);
  velocity = new CANNON.Vec3(0,0,0);
  startingPosition = new THREE.Vector3();
  riderPhysicsBody = new CANNON.Body();
  onPlatform: boolean;
  platformBody: CustomBody | undefined;
  platformDirection: string;
  platformObject: Object3D | undefined;

  constructor(
    model: THREE.Group,
    mixer: THREE.AnimationMixer,
    animationsMap: Map<string,
    THREE.AnimationAction>,
    camera: THREE.Camera,
    currentAction: string,
    initialPosition: any,
    riderPhysicsBody: CANNON.Body,
  ) {
    this.onPlatform = false;
    this.platformBody = undefined;
    this.platformDirection = 'none';
    this.platformObject = undefined;

    this.riderPhysicsBody = riderPhysicsBody;
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.currentAction = currentAction;
    this.riderPhysicsBody.position.set( initialPosition.x, initialPosition.y, initialPosition.z );
    this.riderPhysicsBody.velocity.set(0, 0, 0)
    this.startingPosition.set( initialPosition.x, initialPosition.y, initialPosition.z );
    this.camera = camera;

    this.animationsMap.forEach(( value, key ) => {
      if( key === currentAction ) {
        value.play();
      }
    });
  };

  public update( delta: number, collided: { value: boolean, object: string }, keysPressed: { [key: string]: boolean; } = {} ) {
    let noKeysPressed = Object.values(keysPressed).every(this.checkActiveKeys);
    let play = '';

    if( noKeysPressed === true ) {
      play = 'idle_02';
      this.velocity = new CANNON.Vec3(0, 0, 0);

      if ( this.currentAction !== play ) {
        this.playAnimation(play);
      }
    }
    else {
      this.userInput( delta, keysPressed );
    }

    if(this.onPlatform)  {
      if(this.platformDirection === 'vertical'){
        if(this.platformBody !== undefined && this.platformObject !== undefined) {
          this.riderPhysicsBody.position.y = this.platformObject.position.y;
        }
      }
      else if (this.platformDirection === 'horizontal') {
        if(this.platformBody !== undefined && this.platformObject !== undefined) {
          const relativeX = this.riderPhysicsBody.position.x - this.platformObject.position.x;
          this.riderPhysicsBody.position.x -= relativeX;
        }
      }
    }

    this.updatePlayerMesh();
    this.mixer.update( delta );
  };

  updatePlayerMesh() {
    this.model.position.set(
      this.riderPhysicsBody.position.x,
      this.riderPhysicsBody.position.y,
      this.riderPhysicsBody.position.z
    );

    this.model.quaternion.set(
      this.riderPhysicsBody.quaternion.x,
      this.riderPhysicsBody.quaternion.y,
      this.riderPhysicsBody.quaternion.z,
      this.riderPhysicsBody.quaternion.w
    );
  }

  checkActiveKeys( key: boolean ) {
    return !key;
  }

  userInput( delta: number, keysPressed: { [key: string]: boolean; } = {} ) {
    let [moveForward, moveBackward, moveLeft, moveRight] = [false, false, false, false];
    let play = '';

    const acc = this.acceleration.clone();
    let inputVector = new THREE.Vector3();

    if ( keysPressed['ArrowUp'] ) {
      if ( this.velocity.z > 0) {
        this.velocity.z = 0;
      }
      else {
        this.velocity.z -= acc.z * delta;
      }
      play = 'drive_fast';
      moveForward = true;
    }

    if ( keysPressed['ArrowDown'] ) {
      if ( this.velocity.z < 0 ) {
        this.velocity.z =  0;
      }
      else {
        this.velocity.z += acc.z * delta;
      }
      play = 'drive';
      moveBackward = true;
    }

    if ( keysPressed['ArrowLeft'] ) {
      this.rotatePlayer(delta, 4.0 * Math.PI)
      play = 'drive_turn_left';
      moveLeft = true;
    }

    if ( keysPressed['ArrowRight'] ) {
      this.rotatePlayer(delta, 4.0 * -Math.PI)
      play = 'drive_turn_right';
      moveRight = true;
    }

    if ( moveBackward || moveForward || moveLeft || moveRight ) {
      inputVector.applyQuaternion( this.camera.quaternion );

      const forward = new THREE.Vector3( 0, 0, 1 );
      forward.applyQuaternion(new THREE.Quaternion(this.riderPhysicsBody.quaternion.x, this.riderPhysicsBody.quaternion.y, this.riderPhysicsBody.quaternion.z, this.riderPhysicsBody.quaternion.w ))
      forward.normalize();

      const sideways = new THREE.Vector3(1,0,0);
      sideways.applyQuaternion(new THREE.Quaternion(this.riderPhysicsBody.quaternion.x, this.riderPhysicsBody.quaternion.y, this.riderPhysicsBody.quaternion.z, this.riderPhysicsBody.quaternion.w ))
      sideways.normalize();

      sideways.multiplyScalar( this.velocity.x * delta );
      forward.multiplyScalar( this.velocity.z * delta );

      this.riderPhysicsBody.position.x += forward.x
      this.riderPhysicsBody.position.z += forward.z
      this.riderPhysicsBody.position.x += sideways.x
      this.riderPhysicsBody.position.z += sideways.z

      if (this.currentAction !== play) {
        this.playAnimation(play);
      }
    }
  }

  private playAnimation(play: string) {
    const toPlay = this.animationsMap.get(play);
    const current = this.animationsMap.get(this.currentAction);

    current?.fadeOut(this.fadeDuration);
    toPlay?.reset().fadeIn(this.fadeDuration).play();
    this.currentAction = play;
  }

  private rotatePlayer(delta: number, rotation: number ) {
    // create a quaternion for the rotation
    let quaternion = new CANNON.Quaternion();
    let angle = rotation * delta * this.acceleration.y
    quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);

    // rotate the body
    this.riderPhysicsBody.quaternion.mult(quaternion, this.riderPhysicsBody.quaternion);

    if ( this.velocity.z !== 0 ) this.velocity.z = 0;
  }
}
