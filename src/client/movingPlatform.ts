import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {ShapeType} from "three-to-cannon";
import PhysicsBody from "./physicsBody";
import * as CANNON from 'cannon-es';

export default class movingPlatform {
  game: any;
  object: THREE.Object3D<THREE.Event> | undefined;
  body: CANNON.Body | undefined;

  constructor(game: any, data: { name: string, position: { x: number, y: number, z: number}, direction: string }) {
    this.game = game;

    let platformList = [
      { name: 'floorpad_blue', filename: 'assets/environment/floorpad_blue_large.glb' },
      { name: 'floorpad_green', filename: 'assets/environment/floorpad_green_large.glb' },
      { name: 'floorpad_red', filename: 'assets/environment/floorpad_red_large.glb' },
    ];

    const name = data.name;
    const platform = platformList.filter( floor => floor.name === name );
    const filename = platform[0].filename;
    const loader = new GLTFLoader();

    loader.load( filename, ( object ) => {
      object.scene.name = name;
      object.scene.position.set( data.position.x, data.position.y, data.position.z );
      game.scene.add(object.scene);
      this.object = object.scene;

      this.body = new CANNON.Body;
      const body = new PhysicsBody(object.scene, name, 'floor' , ShapeType.BOX );

      this.body = body.createCustomBody();
      game.physicsWorld.addBody(this.body);
    });
  };

  update( data: {  space: string, position: { x: number, y: number, z: number } } ) {
    if (this.object !== undefined) {
      if( data.space === 'vertical') {
        this.object.position.y = data.position.y;
      } else {
        this.object.position.x = data.position.x;
      }

      // Update the physics body to match the animated model
      this.body?.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
      this.body?.quaternion.set(this.object.quaternion.x, this.object.quaternion.y, this.object.quaternion.z, this.object.quaternion.w);
    }
  };
};
