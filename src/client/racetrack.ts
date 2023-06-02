import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import PhysicsBody from './physicsBody';
import { ShapeType } from 'three-to-cannon';
import { Vector3, MathUtils, Scene } from 'three';

export default class RaceTrack {
  scene : Scene;
  physicsWorld : CANNON.World;
  material : CANNON.Material;

  constructor(scene: Scene, physicsWorld: CANNON.World, material: CANNON.Material){
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.material = material;
  }

  create(){
    const loader = new GLTFLoader();

    loader.load( "assets/racetrack_grass_plain.glb", ( object ) => {
      object.scene.name = "grass_area";
      object.scene.rotateOnWorldAxis( new Vector3( 0, 1, 0 ), MathUtils.degToRad(90) );
      object.scene.updateMatrix();
      object.scene.position.set( -2, 0, -3 );
      this.scene.add( object.scene );

      const body = new PhysicsBody( object.scene, 'grass area single tree', 'grass', ShapeType.HULL, 0, this.material );
      const result = body.createCustomBody();
      this.physicsWorld.addBody( result );
    });

    loader.load( "assets/racetrack_grass_with_trees_1.glb", ( object ) => {
      object.scene.name = "grass_area";
      object.scene.rotateOnWorldAxis( new Vector3( 0, 1, 0 ), MathUtils.degToRad(90) );
      object.scene.updateMatrix();
      object.scene.position.set( 8, 0, -3 );
      this.scene.add( object.scene );

      const body = new PhysicsBody( object.scene, 'grass area with trees', 'grass', ShapeType.HULL, 0, this.material );
      const result = body.createCustomBody();
      this.physicsWorld.addBody( result );
    });
  }
}
