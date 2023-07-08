import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import PhysicsBody from './physicsBody';
import { ShapeType } from 'three-to-cannon';

export default class Coin {
  game: any;
  root: any;
  animations: any;
  mixer: THREE.AnimationMixer | undefined;
  object: THREE.Object3D<THREE.Event> | undefined;
  points: number;
  name: string;

  constructor( game: any, coinData: {x: number, z: number, type: string}, id: number ) {

    this.game = game;

    let coinList = [
      {type: "bronze", filename: "assets/coin-bronze.glb", points: 1},
      {type: "silver", filename: "assets/coin-silver.glb", points: 2},
      {type: "gold", filename: "assets/coin-gold.glb", points: 5},
    ]

    let coinType = coinData.type;
    let res = coinList.filter(coin => coin.type == coinType)
    this.points = res[0].points;
    let filename = res[0].filename;
    this.name = `${coinType}-${id}`;
    const loader = new GLTFLoader();
    const coin = this;

    loader.load( filename, ( object ) => {
      object.scene.name = this.name;
      const mixer = new THREE.AnimationMixer( object.scene );

      coin.root = object;
      coin.mixer = mixer;
      let action = mixer.clipAction( object.animations[0] );
      action.play();
      coin.object = object.scene;
      object.scene.position.set( coinData.x, 1, coinData.z );
      game.scene.add( object.scene );

      const body = new PhysicsBody(
          object.scene,
          this.name,
          'coin',
          8, // 2^3
          4,
          ShapeType.BOX,
          0,
          game.coinMaterial);

      const result = body.createCustomBody();
      result.collisionResponse = false;
      game.physicsWorld.addBody(result);
    });
  }

  coinValue() {
    return this.points;
  }

  update( delta: any ){
    this.mixer?.update( delta );
  }
}