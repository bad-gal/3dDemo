import * as THREE from 'three';
import * as CANNON from "cannon-es";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {MathUtils, Mesh, Vector3} from "three";
import PhysicsBody from "./physicsBody";
import {ShapeType} from "three-to-cannon";

export default class Hammer {
  game: any;
  root: any;
  object: THREE.Object3D<THREE.Event> | undefined;
  body: CANNON.Body | undefined;
  direction: number;

  constructor(game: any) {
    this.game = game;
    const name = 'hammer;'
    const filename = 'assets/environment/green-hammer.glb';
    const loader = new GLTFLoader();
    this.direction = 1;

    loader.load( filename, ( object ) => {
      object.scene.name = name;
      // object.scene.rotateOnWorldAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
      // object.scene.updateMatrix();
      object.scene.position.set( 8.3, 1, -14 );

      // we need to rotate the object 90 degrees in the X and Y axis
      let axis = new THREE.Vector3(0, 1, 0); // Rotate around Y axis
      let angle = Math.PI / 2; // 90 degrees
      object.scene.rotateOnAxis(axis, angle);
      object.scene.updateMatrix();

      axis = new THREE.Vector3(1, 0, 0); // Rotate around X axis
      angle = Math.PI / 2; // 90 degrees
      object.scene.rotateOnAxis(axis, angle);
      object.scene.updateMatrix();

      game.scene.add(object.scene);
      this.object = object.scene;

      // this.body = new CANNON.Body;
      // const body = new PhysicsBody(
      //     object.scene, name, 'obstacle', 8, // 2^3
      //     4, ShapeType.BOX, 0, game.wallMaterial
      // );
      //
      // this.body = body.createCustomBody();
      // game.physicsWorld.addBody(this.body);
    });
  }

  update() {
    const toRadians = (angle: number) => angle * (Math.PI / 180);
    const minAngle = toRadians(0);
    const maxAngle = toRadians(90);
    const rotationSpeed = toRadians( 1.9 );

    if( this.object?.rotation !== undefined) {
      this.object.rotation.y += rotationSpeed * this.direction;

      // Change direction if the max or min angle is reached
      if ( this.object.rotation.y > maxAngle ) {
        this.direction = -1;
      } else if ( this.object.rotation.y < minAngle ) {
        this.direction = 1;
      }
    }
  }
};
