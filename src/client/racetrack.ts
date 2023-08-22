import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import PhysicsBody from './physicsBody';
import { ShapeType } from 'three-to-cannon';
import { Vector3, MathUtils, Scene } from 'three';
import CustomBody from "./customBody";

export default class RaceTrack {
  scene : Scene;
  physicsWorld : CANNON.World;
  material : CANNON.Material;
  wallMaterial : CANNON.Material;

  constructor(scene: Scene, physicsWorld: CANNON.World, material: CANNON.Material, wallMaterial: CANNON.Material){
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.material = material;
    this.wallMaterial = wallMaterial;
  }

  create() {
    const loader = new GLTFLoader();

    // floorpads
    loader.load("assets/environment/floorpad.glb", (object) => {
      const name = 'floor pad';
      const objectType = 'floor';
      object.scene.name = name;
      object.scene.rotateOnWorldAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
      object.scene.updateMatrix();
      object.scene.position.set(5, -0.25, -13);
      this.scene.add(object.scene);

      this.addPhysicsShape(object.scene, name, objectType, {x: object.scene.position.x - 2.15, y: -3, z: -39.5});
      this.duplicateFloorpads(object.scene, { x: 5, y: -0.25, z: -39.5 });
      this.duplicateFloorpads(object.scene, { x: 5, y: -0.25, z: -66});
      this.duplicateFloorpads(object.scene, { x: 5, y: -0.25, z: -119.75 });
    });

    // blue spike
    loader.load("assets/environment/blue-spike-trap.glb", ( object ) => {
      const name = 'blue-spike';
      object.scene.name = name;
      object.scene.position.set(0.775, 0.3, -7.5);
      this.scene.add(object.scene);
      this.addToPhysics(object.scene, name, 'obstacle', ShapeType.BOX);
    });

    // red spike
    loader.load("assets/environment/red-spike-trap.glb", ( object ) => {
      const name = 'red-spike';
      object.scene.name = name;
      object.scene.position.set(2.75, 0.3, -7.5);
      this.scene.add(object.scene);

      this.addToPhysics(object.scene, name, 'obstacle', ShapeType.BOX);
      this.cloneObject( object.scene, { x: -1.2, y: 0.3, z: -7.5 }, name, 'obstacle' );
      this.cloneObject( object.scene, { x: 6.7, y: 0.3, z: -7.5 }, name, 'obstacle' );
    });

    // green spike
    loader.load("assets/environment/green-spike-trap.glb", ( object ) => {
      const name = 'red-spike';
      object.scene.name = name;
      object.scene.position.set(4.725, 0.3, -7.5);
      this.scene.add(object.scene);
      this.addToPhysics(object.scene, name, 'obstacle', ShapeType.BOX);
    });
  };

  addPhysicsShape(object: THREE.Group, name: string, type: string, position: {x: number, y: number, z: number}) {
    let body = new CustomBody({
      mass: 0,
      material: this.wallMaterial,
      shape: new CANNON.Box(new CANNON.Vec3(4.425406455993652, 3, 39.74178457260132)),
      collisionFilterGroup: 1,
      collisionFilterMask: 4,
    });

    body.position.set(position.x , position.y, position.z);

    body.customData = {
      name: name,
      type: type,
    }

    this.physicsWorld.addBody(body);
  };

  duplicateFloorpads(object: THREE.Group, position: { x: number, y: number, z: number }) {
    let dupe = object.clone(true);
    dupe.position.set( position.x, position.y, position.z );
    this.scene.add(dupe);
  };

  addToPhysics(object: THREE.Group, name: string, type: string, shape: ShapeType, mass?: number) {
    let massSize;
    mass === undefined ? massSize = 0 : massSize = mass;

    let body = new PhysicsBody(object, name, type, shape,1, 4, massSize, this.wallMaterial);
    let result = body.createCustomBody();
    this.physicsWorld.addBody(result);
  };

  cloneObject(object: THREE.Group, position: { x: number, y: number, z: number }, name: string, type: string, degToRotate?: number, mass?: number ) {
    let dupe = object.clone(true);

    if ( degToRotate !== undefined ) {
      dupe.rotateOnWorldAxis(new Vector3(0, 1, 0), MathUtils.degToRad(degToRotate));
      dupe.updateMatrix();
    }

    dupe.position.set( position.x, position.y, position.z );
    this.scene.add(dupe);

    let massSize;
    mass === undefined ? massSize = 0 : massSize = mass;

    let body = new PhysicsBody(dupe, name, type, ShapeType.BOX,1, 4, massSize, this.wallMaterial);
    let result = body.createCustomBody();
    this.physicsWorld.addBody(result);
  };
};
