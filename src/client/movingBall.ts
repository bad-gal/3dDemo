import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon-es';
import CustomBody from "./customBody";

export default class movingBall {
  game: any;
  object: THREE.Object3D<THREE.Event> | undefined;
  body: CustomBody | undefined;

  constructor( game: any, data: { name: string, position: { x: number, y: number, z: number }}) {
    this.game = game;

    let ballList = [
      {name: 'ball1', filename: 'assets/environment/ball1.glb'},
      {name: 'ball2', filename: 'assets/environment/ball2.glb'},
      {name: 'ball3', filename: 'assets/environment/ball3.glb'},
      {name: 'ball4', filename: 'assets/environment/ball4.glb'},
    ];

    const name = data.name;
    const baseName = name.split('_')
    const ball = ballList.filter(b => b.name === baseName[0]);
    let filename = ball[0].filename;

    const loader = new GLTFLoader();

    loader.load(filename, (object) => {
      object.scene.name = name;
      object.scene.position.set(data.position.x, data.position.y, data.position.z);
      game.scene.add(object.scene);
      this.object = object.scene;

      this.body = new CustomBody({
        mass: 0,
        material: game.ballMaterial,
        shape: new CANNON.Sphere(1.2),
        collisionFilterGroup: 8,
        collisionFilterMask: 4,
      });

      this.body.customData = {
        name: name,
        type: 'obstacle',
      }

      this.body.position.set(this.object.position.x , this.object.position.y, this.object.position.z);
      // this.body.angularVelocity.set(0,0,0);
      game.physicsWorld.addBody(this.body);
    });
  };

  update( data: { rotation: number, position: { x: number, y: number, z: number }}) {
    if( this.object !== undefined && this.body !== undefined) {
      this.object.position.x = data.position.x;

      this.object.rotation.y = data.rotation;
      this.object.rotation.x = data.rotation;

      this.body.velocity.set(0,0,0);
      this.body.position.set(this.object.position.x, this.object.position.y, this.object.position.z)
    }
  };
};
