import * as THREE from 'three';
import * as CANNON from "cannon-es";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {MathUtils, Mesh, Vector3} from "three";
import PhysicsBody from "./physicsBody";
import {ShapeType} from "three-to-cannon";

export default class Hammer {
  game: any;
  object: THREE.Object3D<THREE.Event> | undefined;
  body: CANNON.Body | undefined;

  constructor( game: any,
                  data: { rotationY: number, name: string, on_side: boolean, position: { x: number, y: number, z: number } }) {

    this.game = game;

    const hammerList =  [
      { name: 'blue-hammer', filename: 'assets/environment/blue-hammer.glb '},
      { name: 'green-hammer', filename: 'assets/environment/green-hammer.glb '},
      { name: 'red-hammer', filename: 'assets/environment/red-hammer.glb '},
    ];

    const name = data.name;
    const rnd = Math.floor( Math.random() * hammerList.length );
    const hammer = hammerList.filter( hm => hm.name === name );
    let filename = hammer[0].filename;

    const loader = new GLTFLoader();

    loader.load( filename, ( object ) => {
      object.scene.name = name;
      object.scene.position.set( data.position.x, data.position.y, data.position.z );

      // we need to rotate the object 90 degrees in the X and Y axis
      let axis = new THREE.Vector3(0, 1, 0); // Rotate around Y axis
      let angle = Math.PI / 2; // 90 degrees
      object.scene.rotateOnAxis(axis, angle);
      object.scene.updateMatrix();

       if( data.on_side) {
        axis = new THREE.Vector3(1, 0, 0); // Rotate around X axis
        angle = Math.PI / 2; // 90 degrees
        object.scene.rotateOnAxis(axis, angle);
        object.scene.updateMatrix();
      } else {
         axis = new THREE.Vector3(1, 0, 0); // Rotate around X axis
         angle = Math.PI; // 180 degrees
         object.scene.rotateOnAxis(axis, angle);
         object.scene.updateMatrix();
      }

      game.scene.add(object.scene);
      this.object = object.scene;

      this.body = new CANNON.Body;
      const body = new PhysicsBody(
          object.scene, name, 'obstacle', 8, // 2^3
          4, ShapeType.BOX, 0, game.wallMaterial
      );

      this.body = body.createCustomBody();
      game.physicsWorld.addBody(this.body);
    });
  }

  update(data: { rotationY: number }) {
    if (this.object !== undefined) {
      this.object.rotation.y = data.rotationY;

      // Update the physics body to match the animated model
      this.body?.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
      this.body?.quaternion.set(this.object.quaternion.x, this.object.quaternion.y, this.object.quaternion.z, this.object.quaternion.w);
    }
  }
};
