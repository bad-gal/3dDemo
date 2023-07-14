import * as THREE from 'three';
import {MathUtils, Vector3, Mesh, Group, Matrix4} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {ShapeType} from "three-to-cannon";
import PhysicsBody from "./physicsBody";
import * as CANNON from 'cannon-es';

export default class movingSphere {
  game: any;
  object: THREE.Object3D<THREE.Event> | undefined;
  body: CANNON.Body | undefined;

  constructor( game: any, data: { rotationZ: number, name: string, position: { x: number, y: number, z: number } }  ) {
    this.game = game;

    let sphereList = [
      { name: 'blue-trap-sphere', filename: 'assets/environment/blue-trap-circle.glb' },
      { name: 'green-trap-sphere', filename: 'assets/environment/green-trap-circle.glb' },
      { name: 'red-trap-sphere', filename: 'assets/environment/red-trap-circle.glb' },
    ];

    const name = data.name;
    const rnd = Math.floor( Math.random() * sphereList.length );
    const sphere = sphereList.filter( sp => sp.name === name );
    let filename = sphere[0].filename;

    const loader = new GLTFLoader();

    loader.load( filename, ( object ) => {
      object.scene.name = name;
      object.scene.position.set( data.position.x, data.position.y, data.position.z );
      game.scene.add(object.scene);
      this.object = object.scene;

      const mesh = object.scene.children.at(0) as Mesh;
      if(mesh !== null){
        mesh.geometry.center();  // Center the geometry
        mesh.geometry.computeBoundingBox();  // Compute bounding box

        // Now translate the object so that it sits on the XY plane
        let height
        if(mesh.geometry.boundingBox !== null){
          height = mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y;
          mesh.position.y = -height / 2;
        }
      }

      this.body = new CANNON.Body;
      const body = new PhysicsBody(
          object.scene,
          name,
          'obstacle',
          8, // 2^3
          4,
          ShapeType.BOX,
          0,
          game.wallMaterial);

      this.body = body.createCustomBody();
      game.physicsWorld.addBody(this.body);
    });
  };

  update( data: { rotationZ: number } ) {
    if (this.object !== undefined) {
      this.object.rotation.z = data.rotationZ;

      // Update the physics body to match the animated model
      this.body?.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
      this.body?.quaternion.set(this.object.quaternion.x, this.object.quaternion.y, this.object.quaternion.z, this.object.quaternion.w);
    }
  };
};
