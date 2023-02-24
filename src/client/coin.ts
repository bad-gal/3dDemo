import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { randInt } from 'three/src/math/MathUtils';

export default class Coin {  
  game: any;
  root: any;
  animations: any;
  mixer: THREE.AnimationMixer | undefined;
  object: THREE.Object3D<THREE.Event> | undefined;
  points: number;
  boxHelper: any;

  constructor( game: any, coinData: {x: number, z: number, type: string} ) {

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

    const loader = new GLTFLoader();
    const coin = this;

    loader.load( filename, ( object ) => {
      object.scene.name = coinType;
      const mixer = new THREE.AnimationMixer( object.scene );

      coin.root = object;
      coin.mixer = mixer;
      let action = mixer.clipAction( object.animations[0] );
      action.play();
      coin.object = object.scene;
      game.scene.add( object.scene );

      object.scene.position.set( coinData.x, 1, coinData.z );

      const geometry = new THREE.BoxGeometry( 0.25, 0.25, 0.25 );
      const box = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xffbbaa } ) );

      this.boxHelper = new THREE.BoxHelper( box, 0xf542dd );
      this.boxHelper.visible = false;

      let boundaryBox = new THREE.Box3();
      boundaryBox.setFromObject( this.boxHelper );
      this.boxHelper.geometry.computeBoundingBox();
      this.boxHelper.update();

      object.scene.add( this.boxHelper );
    });
  }

  coinValue() {
    this.points;
  }

  update( delta: any ){
    this.mixer?.update( delta );
  }
}