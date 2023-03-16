import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class MovingObstacle {
  game: any;
  root: any;
  object: THREE.Object3D<THREE.Event> | undefined;
  points: number;
  boxHelper: THREE.Box3Helper | undefined;
  velocity: THREE.Vector3;

  constructor( game: any, data: { type: string, position: {x: number, y: number, z: number}, velocity: {x: number, y: number, z: number} }) {
    this.game = game;
    this.points = -3;
    this.velocity = new THREE.Vector3( data.velocity.x, data.velocity.y, data.velocity.z );

    let obstacleTypes = [
      { type: 'apple', filename: 'assets/obstacles/apple.glb' },
      { type: 'banana', filename: 'assets/obstacles/banana.glb' },
      { type: 'cherry', filename: 'assets/obstacles/cherry.glb' }, // is a group of two meshes
      { type: 'strawberry', filename: 'assets/obstacles/strawberry.glb' },
      { type: 'pear', filename: 'assets/obstacles/pear.glb' },
    ]

    let type = data.type;
    let result = obstacleTypes.filter(obs => obs.type == type);
    let filename = result[0].filename;

    const loader = new GLTFLoader();
    const obstacle = this;

    loader.load( filename, ( gltf ) => {
      gltf.scene.name = type;
      obstacle.root = gltf;
      obstacle.object = gltf.scene;
      game.scene.add( gltf.scene );

      gltf.scene.position.set( data.position.x, data.position.y, data.position.z );

      // Set the initial rotation of the model
      gltf.scene.rotation.x = 0;
      gltf.scene.rotation.y = 0;
      gltf.scene.rotation.z = 0;

      // get the mesh of the object and create a boxhelper around it for collision detection
      const mesh = gltf.scene.children[0]
      const box = new THREE.Box3().setFromObject(mesh);
      this.boxHelper = new THREE.Box3Helper(box, new THREE.Color(0xffbbaa))
      this.boxHelper.visible = true
      gltf.scene.add(this.boxHelper)
    });
  }

  update(data: { type: string, position: { x: number, y: number, z: number }, velocity: { x: number, y: number, z: number }, rotation: { x: number, y: number, z: number }}){
    this.object?.position.set( data.position.x, data.position.y, data.position.z);
    this.velocity.set(data.velocity.x, data.velocity.y, data.velocity.z);
    this.object?.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
  }
}
