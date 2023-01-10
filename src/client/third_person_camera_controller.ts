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

    idealOffset.applyQuaternion( this.params.target.model.quaternion );
    idealOffset.add( this.params.target.model.position );
    return idealOffset;
  }

  calculateLookAt() {
    const idealLookat = new THREE.Vector3( 0, 1, 3 );
    
    idealLookat.applyQuaternion( this.params.target.model.quaternion );
    idealLookat.add( this.params.target.model.position );
    return idealLookat;
  }

  update(timeElapsed:number) {
    const idealOffset = this.calculateOffset();
    const idealLookat = this.calculateLookAt();

    const t = 1.0 - Math.pow( 0.001, timeElapsed );

    this.currentPosition.lerp( idealOffset, t );
    this.currentLookAt.lerp( idealLookat, t );
    this.params.target.camera.position.copy( this.currentPosition );
    this.params.target.camera.lookAt( this.currentLookAt );
  }
}
