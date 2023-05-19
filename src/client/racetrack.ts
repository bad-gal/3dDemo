import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import PhysicsBody from './physicsBody';
import { ShapeType } from 'three-to-cannon';
import { Vector3, MathUtils } from 'three';


export default class RaceTrack {
  scene : THREE.Scene;
  physicsWorld : CANNON.World;

  constructor(scene: THREE.Scene, physicsWorld: CANNON.World){
    this.scene = scene;
    this.physicsWorld = physicsWorld;
  }

  create(){
    // Create a ground object
    const loader = new GLTFLoader();

    loader.load( "assets/ground.glb", ( object ) => {
      object.scene.name = "ground";
      object.scene.position.set( 16, 0, -20 );
      this.scene.add( object.scene );
    });

    // Create a static ground body
    const groundBody = new CANNON.Body( {  mass: 0 } );
    const groundShape = new CANNON.Box( new CANNON.Vec3( 32, 1, 32 ) );
    groundBody.addShape( groundShape );

    groundBody.position.set( 8, -1, -10 );
    this.physicsWorld.addBody( groundBody );


    loader.load( "assets/racetrack_grass_plain.glb", ( object ) => {
      object.scene.name = "grass_area";
      object.scene.rotateOnWorldAxis( new Vector3( 0, 1, 0 ), MathUtils.degToRad(90) );
      object.scene.updateMatrix();
      object.scene.position.set( -2, 0, -3 );
      this.scene.add( object.scene );

      const body = new PhysicsBody( object.scene, ShapeType.HULL );
      const result = body.createBody();
      result.quaternion.set(
        object.scene.quaternion.x,
        object.scene.quaternion.y,
        object.scene.quaternion.z,
        object.scene.quaternion.w
      )
      this.physicsWorld.addBody( result );
    });

    loader.load( "assets/racetrack_grass_with_trees_1.glb", ( object ) => {
      object.scene.name = "grass_area";
      object.scene.rotateOnWorldAxis( new Vector3( 0, 1, 0 ), MathUtils.degToRad(90) );
      object.scene.updateMatrix();
      object.scene.position.set( 8, 0, -3 );
      this.scene.add( object.scene );

      const body = new PhysicsBody( object.scene, ShapeType.HULL );
      const result = body.createBody();
      result.quaternion.set(
        object.scene.quaternion.x,
        object.scene.quaternion.y,
        object.scene.quaternion.z,
        object.scene.quaternion.w
      )
      this.physicsWorld.addBody( result );
    });
  }
}
