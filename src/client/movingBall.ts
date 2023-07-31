import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {ShapeType} from "three-to-cannon";
import PhysicsBody from "./physicsBody";
import * as CANNON from 'cannon-es';

export default class movingBall {
  game: any;
  object: THREE.Object3D<THREE.Event> | undefined;
  body: CANNON.Body | undefined;

  constructor( game: any, data: { name: string, position: { x: number, y: number, z: number }}) {
    this.game = game;

    let ballList = [
      {name: 'ball1', filename: 'assets/environment/ball1.glb'},
      {name: 'ball2', filename: 'assets/environment/ball2.glb'},
      {name: 'ball3', filename: 'assets/environment/ball3.glb'},
      {name: 'ball4', filename: 'assets/environment/ball4.glb'},
    ];

    const name = data.name;
    const ball = ballList.filter(b => b.name === name);
    let filename = ball[0].filename;

    const loader = new GLTFLoader();

    loader.load(filename, (object) => {
      object.scene.name = name;
      object.scene.position.set(data.position.x, data.position.y, data.position.z);
      game.scene.add(object.scene);
      this.object = object.scene;

      this.body = new CANNON.Body;
      const body = new PhysicsBody(object.scene, name, 'obstacle', ShapeType.SPHERE,8, 4 | 8,  1, game.wallMaterial);

      this.body = body.createCustomBody();
      game.physicsWorld.addBody(this.body);
    });
  };

  update( data: { rotation: number, position: { x: number, y: number, z: number }}) {
    if( this.object !== undefined ) {
      this.object.position.set( data.position.x, data.position.y, data.position.z );
      this.object.rotation.y = data.rotation;
      this.object.rotation.x = data.rotation;

      // Update the physics body to match the animated model
      this.body?.position.set( this.object.position.x, this.object.position.y, this.object.position.z );
      this.body?.quaternion.set( this.object.quaternion.x, this.object.quaternion.y, this.object.quaternion.z, this.object.quaternion.w );
      console.log('data:', data.position.y, 'object:', this.body?.position.y);
    }
  }
};
