import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {ShapeType} from "three-to-cannon";
import PhysicsBody from "./physicsBody";
import * as CANNON from 'cannon-es';

export default class movingSpike {
  game: any;
  object: THREE.Object3D<THREE.Event> | undefined;
  body: CANNON.Body | undefined;

  constructor( game: any, data: { name: string, position: { x: number, y: number, z: number }}) {
    this.game = game;

    let spikeList = [
      { name: 'blue-spike', filename: 'assets/environment/blue-spike-trap.glb' },
      { name: 'green-spike', filename: 'assets/environment/green-spike-trap.glb' },
      { name: 'red-spike', filename: 'assets/environment/red-spike-trap.glb' },
    ];

    const name = data.name;
    const spike = spikeList.filter( sp => sp.name === name );
    let filename = spike[0].filename;

    const loader = new GLTFLoader();

    loader.load( filename, (object) => {
      object.scene.name = name;
      object.scene.position.set( data.position.x, data.position.y, data.position.z );
      game.scene.add(object.scene);
      this.object = object.scene;

      this.body = new CANNON.Body;
      const body = new PhysicsBody( object.scene, name, 'obstacle', 8, 4, ShapeType.BOX, 0, game.wallMaterial );

      this.body = body.createCustomBody();
      game.physicsWorld.addBody(this.body);
    });
  };

  update( data: { position: { x: number, y: number, z: number } }) {
    if (this.object !== undefined) {
      this.object.position.y = data.position.y;
      this.object.position.x = data.position.x;

      // Update the physics body to match the animated model
      this.body?.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
      this.body?.quaternion.set(this.object.quaternion.x, this.object.quaternion.y, this.object.quaternion.z, this.object.quaternion.w);
    }
  };
};
