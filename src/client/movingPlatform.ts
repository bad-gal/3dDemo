import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon-es';
import CustomBody from "./customBody";
import Player from "./player";

export default class movingPlatform {
  game: any;
  object: THREE.Object3D<THREE.Event> | undefined;
  body: CustomBody | undefined;
  bodyDistanceDeduction: number;
  platformDirection: string;
  player: Player | undefined;

  constructor(game: any, data: { name: string, platformDirection: string, position: { x: number, y: number, z: number}, direction: string }) {
    this.game = game;
    this.bodyDistanceDeduction = 2.8;

    let platformList = [
      { name: 'floorpad_blue', filename: 'assets/environment/floorpad_blue_large.glb' },
      { name: 'floorpad_green', filename: 'assets/environment/floorpad_green_large.glb' },
      { name: 'floorpad_red', filename: 'assets/environment/floorpad_red_large.glb' },
    ];

    const name = data.name;
    this.platformDirection  = data.platformDirection;
    const platform = platformList.filter( floor => floor.name === name );
    const filename = platform[0].filename;
    const loader = new GLTFLoader();

    loader.load( filename, ( object ) => {
      object.scene.name = name;
      object.scene.position.set( data.position.x, data.position.y, data.position.z );
      game.scene.add(object.scene);
      this.object = object.scene;

      this.body = new CustomBody({
        mass: 0,
        material: this.game.wallMaterial,
        shape: new CANNON.Box(new CANNON.Vec3(4.5, 3, 4.43)),
        collisionFilterGroup: 8,
        collisionFilterMask: 4,
      });

      this.body.position.set(data.position.x, data.position.y - this.bodyDistanceDeduction, data.position.z);
      this.body.customData = {
        name: name,
        type: 'moving platform',
      }
      game.physicsWorld.addBody(this.body);

      //check for collisions with player
      this.body.addEventListener("collide", ( e: any ) => {
        const player = e.body;
        const platform = e.target;

        if( platform.customData !== undefined ) {
          const playerType = player.customData.type;

          if(playerType === 'player') {
            this.player = game.player;
            if(this.player !== undefined && this.player.characterController !== undefined) {
              this.player.characterController.platformDirection = this.platformDirection;
              this.player.characterController.platformBody = this.body;
              this.player.characterController.platformObject  = this.object;
            }
          }
        }
      });

      game.physicsWorld.addEventListener('postStep', () => {
        // we only care if there are no contacts with this platform
        if(this.body !== undefined) {
          if( this.body.world?.contacts.length === 0 ) {
            if(this.player?.characterController !== undefined) {
              this.player.characterController.onPlatform = false;
              this.player.characterController.platformDirection = '';
              this.player.characterController.platformBody = undefined;
              this.player.characterController.platformObject = undefined;
            }
          }
        }
      });
    });
  };

  update( data: {  platformDirection: string, name: string, position: { x: number, y: number, z: number } } ) {
    const smoothing = 0.6;
    if (this.object !== undefined) {

      if( data.platformDirection === 'vertical') {
        this.object.position.y = data.position.y * smoothing;
      } else {
        this.object.position.x = data.position.x * smoothing;
      }

      // Update the physics body to match the animated model
      this.body?.position.set(this.object.position.x, this.object.position.y - this.bodyDistanceDeduction, this.object.position.z);
      this.body?.quaternion.set(this.object.quaternion.x, this.object.quaternion.y, this.object.quaternion.z, this.object.quaternion.w);
    }
  };
};
