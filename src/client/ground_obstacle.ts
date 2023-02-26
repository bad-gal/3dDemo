import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class GroundObstacle {
  game: any;
  root: any;
  object: THREE.Object3D<THREE.Event> | undefined;
  points: number;

  constructor( game: any, data: { type: string, position: { x: number, z: number } } ) {
    this.game = game;
    this.points = -2;

    let groundObstacleTypes = [
      { type: 'barrel_side', filename: 'assets/obstacles/poison_barrel_side.glb' },
      { type: 'barrel', filename: 'assets/obstacles/poison_barrel_up.glb' },
    ]

    let type = data.type;
    let result = groundObstacleTypes.filter(obs => obs.type == type);
    let filename = result[0].filename;

    const loader = new GLTFLoader();
    const groundObstacle = this;

    loader.load( filename, ( gltf ) => {
      gltf.scene.name = type;
      groundObstacle.root = gltf;
      groundObstacle.object = gltf.scene;
      game.scene.add( gltf.scene );

      gltf.scene.position.set( data.position.x, 0, data.position.z );
    });
  }

  update(delta: any) {

  }
}
