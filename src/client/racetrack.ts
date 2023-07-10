import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import PhysicsBody from './physicsBody';
import { ShapeType } from 'three-to-cannon';
import { Vector3, MathUtils, Scene } from 'three';

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

      this.addToPhysics(object.scene, name, objectType, ShapeType.BOX);
      this.cloneObject( object.scene, { x: 5, y: -0.25, z: -39.5 }, name, objectType );
      this.cloneObject( object.scene, { x: 5, y: -0.25, z: -66 }, name, objectType );
      this.cloneObject( object.scene, { x: 5, y: -0.25, z: -92.5 }, name, objectType );
    });

    const objectType = 'fence';

    // red fence
    loader.load("assets/environment/red-fence.glb", (object) => {
      const name = 'red-fence';
      object.scene.name = name;
      object.scene.rotateOnWorldAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
      object.scene.updateMatrix();
      object.scene.position.set(-1.64, 0.3, -2.25);
      this.scene.add(object.scene);

      this.addToPhysics(object.scene, name, objectType, ShapeType.BOX);
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -6.61 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -28.8 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -33.16 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -55.35 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -59.71 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -81.9 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -86.22 }, name, objectType );

      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -2.25 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -6.61 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -28.8 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -33.16 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -55.35 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -59.71 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -81.9 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -86.22 }, name, objectType );
    });

    // green fence
    loader.load("assets/environment/green-fence.glb", (object) => {
      const name = 'green-fence';
      object.scene.name = name;
      object.scene.rotateOnWorldAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
      object.scene.updateMatrix();
      object.scene.position.set(-1.64, 0.3, -11.1);
      this.scene.add(object.scene);

      this.addToPhysics(object.scene, name, objectType, ShapeType.BOX);
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -15.46 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -37.65 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -42.01 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -64.2 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -68.56 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -90.75 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -95.07 }, name, objectType );

      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -11.1 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -15.46 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -37.65 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -42.01 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -64.2 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -68.56 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -90.75 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -95.07 }, name, objectType );
    });

    // blue fence
    loader.load("assets/environment/blue-fence.glb", (object) => {
      const name = 'blue-fence';
      object.scene.name = name;
      object.scene.rotateOnWorldAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
      object.scene.updateMatrix();
      object.scene.position.set(-1.64, 0.3, -19.95 );
      this.scene.add(object.scene);

      this.addToPhysics(object.scene, name, objectType, ShapeType.BOX);
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -24.31 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -46.5 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -50.86 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -73.05 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -77.41 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -99.6 }, name, objectType );
      this.cloneObject( object.scene, { x: -1.64, y: 0.3, z: -103.92 }, name, objectType );

      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -19.95 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -24.31 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -46.5 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -50.86 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -73.05 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -77.41 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -99.6 }, name, objectType );
      this.cloneObject( object.scene, { x: 7.2, y: 0.3, z: -103.92 }, name, objectType );
    });

    // blue spike
    loader.load("assets/environment/blue-spike-trap.glb", ( object ) => {
      const name = 'blue-spike';
      object.scene.name = name;
      object.scene.position.set(4, 0.3, -6);
      this.scene.add(object.scene);

      this.addToPhysics(object.scene, name, 'obstacle', ShapeType.BOX);
    });
  };

  addToPhysics(object: THREE.Group, name: string, type: string, shape: ShapeType) {
    let body = new PhysicsBody(object, name, type, 1, 4, shape, 0, this.wallMaterial);
    let result = body.createCustomBody();
    this.physicsWorld.addBody(result);
  };

  cloneObject(object: THREE.Group, position: { x: number, y: number, z: number }, name: string, type: string, degToRotate?: number ) {
    let dupe = object.clone(true);

    if ( degToRotate !== undefined ) {
      dupe.rotateOnWorldAxis(new Vector3(0, 1, 0), MathUtils.degToRad(degToRotate));
      dupe.updateMatrix();
    }

    dupe.position.set( position.x, position.y, position.z );
    this.scene.add(dupe);

    let body = new PhysicsBody(dupe, name, type, 1, 4, ShapeType.BOX, 0, this.wallMaterial);
    let result = body.createCustomBody();
    this.physicsWorld.addBody(result);
  };
};
