import * as THREE from 'three';

export default class ThirdPersonCameraController {
  currentPosition: THREE.Vector3;
  currentLookAt: THREE.Vector3;
  params: any;
  target: any;
  constructor( params: 
    { 
      target: any;
    }
  ) 
  {
    this.params = params;
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();  
  }

  calculateOffset() {
    const idealOffset = new THREE.Vector3( 1, 2, 12 );
    const player = this.params.target.model;
    idealOffset.applyQuaternion( player.quaternion );
    idealOffset.add( this.params.target.model.position );
    return idealOffset;
  }

  calculateLookAt() {
    const idealLookAt = new THREE.Vector3( 0, 2, 3 );
    const player = this.params.target.model;
    idealLookAt.applyQuaternion( player.quaternion );
    idealLookAt.add( player.position );
    return idealLookAt;
  }

  isTargetUpsideDown() {
    const player = this.params.target.model;
    // Assuming object is your model
    let quaternion = player.quaternion;

// Create the original up vector
    let originalUp = new THREE.Vector3(0, 1, 0);

// Create a new vector for the transformed up axis
    let transformedUp = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion);

// Check if the model is upside down
    return originalUp.dot(transformedUp) < 0;
  }

  update(timeElapsed:number) {
    const idealOffset = this.calculateOffset();
    const idealLookAt = this.calculateLookAt();

    const t = 1.0 - Math.pow( 0.001, timeElapsed );

    this.currentPosition.lerp( idealOffset, t );
    this.currentLookAt.lerp( idealLookAt, t );
    this.params.target.camera.position.copy( this.currentPosition );


    const upsideDown = this.isTargetUpsideDown();
    if ( upsideDown ) {
      if( this.currentLookAt.y < 1 ) {
        this.currentLookAt.y = 1;
      }
    }
    this.params.target.camera.lookAt( this.currentLookAt );
  }
}
