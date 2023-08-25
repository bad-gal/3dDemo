import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon-es';
import CustomBody from "./customBody";

export default class movingPlatform {
  game: any;
  object: THREE.Object3D<THREE.Event> | undefined;
  body: CustomBody | undefined;
  bodyDistanceDeduction: number;

  constructor(game: any, data: { name: string, position: { x: number, y: number, z: number}, direction: string }) {
    this.game = game;
    this.bodyDistanceDeduction = 2.8;

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

      this.body = new CustomBody({
        mass: 0,
        material: this.game.wallMaterial,
        shape: new CANNON.Box(new CANNON.Vec3(4.5, 3, 4.43)),
        collisionFilterGroup: 8,
        collisionFilterMask: 4,
      });

      this.body.position.set(data.position.x, data.position.y - this.bodyDistanceDeduction, data.position.z);
      this.body.customData = {
        name: name,
        type: 'moving platform',
      }
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
      this.body?.position.set(this.object.position.x, this.object.position.y - this.bodyDistanceDeduction, this.object.position.z);
      this.body?.quaternion.set(this.object.quaternion.x, this.object.quaternion.y, this.object.quaternion.z, this.object.quaternion.w);
    }
  };
};
