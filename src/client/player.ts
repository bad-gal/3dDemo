import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CharacterControls } from './characterControls';
import { ThirdPersonCameraController } from './third_person_camera_controller';

export default class Player {
  local: boolean;
  options: any;
  id: any;
  model: any;
  game: any;
  animations: any;
  root: any;
  mixer: THREE.AnimationMixer | undefined;
  object: THREE.Object3D<THREE.Event> | undefined;
  deleted: undefined;
  collider: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> | undefined;
  characterControls: CharacterControls | undefined;
  thirdPersonCamera: ThirdPersonCameraController | undefined;
  
  // private action = '';
  action: string;
  animationsMap: any;
  constructor(game: any, camera: any, options?: any) {
    this.local = true;
    let model: string;
    let filename: any;
    this.action = '';
    const quadRacers: {name: string; filename: string}[]  = [
      {name: "camouflage rider", filename: "assets/camouflage_rider_quad.glb"},
      {name: "green rider", filename:"assets/green_rider_quad.glb"},
      {name: "lime rider", filename:"assets/lime_rider_quad.glb"},
      {name: "mustard rider", filename:"assets/mustard_rider_quad.glb"},
      {name: "neon rider", filename:"assets/neon_rider_quad.glb"},
      {name: "orange rider", filename:"assets/orange_rider_quad.glb"},
      {name: "purple rider", filename:"assets/purple_rider_quad.glb"},
      {name: "red rider", filename:"assets/red_rider_quad.glb"},
      {name: "red star rider", filename:"assets/red_star_rider_quad.glb"},
      {name: "blue rider", filename:"assets/blue_rider_quad.glb"},
    ]

    if(options === undefined) {
      model = quadRacers[Math.floor(Math.random()*quadRacers.length )].name;
    } 
    else if (typeof options === 'object') {
      this.local = false;
      this.options = options;
      this.id = options.id;
      model = options.model;
    } 
    else {
      model = options;
    }

    this.model = model;
    this.game = game;
    this.animations = this.game.animations;

    const loader = new GLTFLoader();
    const player = this;
  
    let clips: THREE.AnimationClip[];
    const fps = 30;
    
    const animationsFrameLocations = [
      {
          name: 'jump_down',
          frameStart: 10,
          frameEnd: 40,
      },
      {
          name: 'jump_up',
          frameStart: 40,
          frameEnd: 70,
      },
      {
          name: 'idle_01',
          frameStart: 75,
          frameEnd: 175,
      },
      {
          name: 'idle_02',
          frameStart: 175,
          frameEnd: 275,
      },
      {
          name: 'idle_03',
          frameStart: 275,
          frameEnd: 375,
      },
      {
          name: 'drive',
          frameStart: 380,
          frameEnd: 400,
      },
      {
          name: 'drive_turn_left',
          frameStart: 405,
          frameEnd: 425,
      },
      {
          name: 'drive_turn_right',
          frameStart: 435,
          frameEnd: 455,
      },
      {
          name: 'drive_fast',
          frameStart: 460,
          frameEnd: 480,
      },
      {
          name: 'drive_fast_left',
          frameStart: 485,
          frameEnd: 505,
      },
      {
          name: 'drive_fast_right',
          frameStart: 515,
          frameEnd: 535,
      },
      {
          name: 'drive_nitro',
          frameStart: 540,
          frameEnd: 560,
      },
      {
          name: 'drive_obstacle_01',
          frameStart: 565,
          frameEnd: 605,
      },
      {
          name: 'drive_obstacle_02',
          frameStart: 605,
          frameEnd: 645,
      },
      {
          name: 'drive_obstacle_03',
          frameStart: 650,
          frameEnd: 675,
      },
      {
          name: 'drive_hit_left',
          frameStart: 675,
          frameEnd: 695,
      },
      {
          name: 'drive_hit_right',
          frameStart: 695,
          frameEnd: 715,
      },
      {
          name: 'drive_kick_left',
          frameStart: 715,
          frameEnd: 735,
      },
      {
          name: 'drive_kick_right',
          frameStart: 735,
          frameEnd: 755,
      },
      {
          name: 'drive_fail_01',
          frameStart: 760,
          frameEnd: 805,
      },
      {
          name: 'drive_fail_02',
          frameStart: 810,
          frameEnd: 845,
      },
      {
          name: 'drive_trick_01',
          frameStart: 850,
          frameEnd: 900,
      },
      {
          name: 'drive_trick_01_loop',
          frameStart: 860,
          frameEnd: 890,
      },
      {
          name: 'drive_trick_02',
          frameStart: 900,
          frameEnd: 950,
      },
      {
          name: 'drive_trick_02_loop',
          frameStart: 910,
          frameEnd: 940,
      },
      {
          name: 'drive_trick_03',
          frameStart: 950,
          frameEnd: 1000,
      },
      {
          name: 'drive_trick_03_loop',
          frameStart: 960,
          frameEnd: 990,
      },
      {
          name: 'drive_trick_04',
          frameStart: 1000,
          frameEnd: 1050,
      },
      {
          name: 'drive_trick_04_loop',
          frameStart: 1015,
          frameEnd: 1035,
      },
      {
          name: 'drive_trick_05',
          frameStart: 1050,
          frameEnd: 1100,
      },
      {
          name: 'drive_trick_05_loop',
          frameStart: 1065,
          frameEnd: 1085,
      },
      {
          name: 'drive_trick_06',
          frameStart: 1100,
          frameEnd: 1150,
      },
      {
          name: 'drive_trick_06_loop',
          frameStart: 1115,
          frameEnd: 1135,
      },
      {
          name: 'drive_trick_07',
          frameStart: 1150,
          frameEnd: 1200,
      },
      {
          name: 'drive_trick_07_loop',
          frameStart: 1165,
          frameEnd: 1185,
      },
      {
          name: 'drive_trick_08',
          frameStart: 1200,
          frameEnd: 1250,
      },
      {
          name: 'drive_trick_08_loop',
          frameStart: 1215,
          frameEnd: 1235,
      },
      {
          name: 'drive_trick_09',
          frameStart: 1250,
          frameEnd: 1300,
      },
      {
          name: 'drive_trick_09_loop',
          frameStart: 1265,
          frameEnd: 1285,
      },
      {
          name: 'drive_trick_10',
          frameStart: 1300,
          frameEnd: 1360,
      },
      {
          name: 'drive_trick_10_loop',
          frameStart: 1320,
          frameEnd: 1340,
      },
      {
          name: 'turn_180',
          frameStart: 1370,
          frameEnd: 1400,
      },
      {
          name: 'turn_360',
          frameStart: 1410,
          frameEnd: 1450,
      },
      {
          name: 'salto',
          frameStart: 1460,
          frameEnd: 1500,
      },
    ];

    this.animationsMap = new Map();
    filename = quadRacers.find(racer => racer.name === model)?.filename;

    loader.load( filename, ( object ) => {
      object.scene.name = model;
      
      const mixer = new THREE.AnimationMixer(object.scene);
      clips = object.animations;
      let action;
      
      // store the animations from the model in an array
      animationsFrameLocations.forEach( (clip) => {
          let animClip = THREE.AnimationUtils.subclip ( clips[1], clip.name, clip.frameStart, clip.frameEnd, fps );
          action = mixer.clipAction( animClip );
          this.animationsMap.set(clip.name, action);
      });

      player.root = object;
      player.mixer = mixer;
      player.object = object.scene;
      
      if (player.deleted === undefined) {
        game.scene.add( object.scene );
      }

      if(player.local) {
        console.log("PLAYER IS LOCAL")
        let characterControls = new CharacterControls( object.scene, mixer, this.animationsMap, camera, 'idle_02');
        let thirdPersonCamera = new ThirdPersonCameraController({target: characterControls});
        player.characterControls = characterControls;
        player.thirdPersonCamera = thirdPersonCamera;
        // without the ignore we get TS2339: Property 'initSocket' does not exist on type 'Player'
        // even though initSocket is a valid property of PlayerLocal which extends Player
        //@ts-ignore
        if(player.initSocket !== undefined){
          //@ts-ignore
          player.initSocket();
        }
      } 
      else {
        console.log("PLAYER IS REMOTE")
        const geometry = new THREE.BoxGeometry(100,300,100);
				const material = new THREE.MeshBasicMaterial({visible:false});
				const box = new THREE.Mesh(geometry, material);
				box.name = "Collider";
				box.position.set(0, 150, 0);
				player.object.add(box);
				player.collider = box;
        console.log('player userData', player.object.userData)
				player.object.userData.id = player.id;
				player.object.userData.remotePlayer = true;
				const players = game.initialisingPlayers.splice(game.initialisingPlayers.indexOf(player), 1);
				game.remotePlayers.push(players[0]);
        if(action === '') action = 'idle_02';
      }      
    });
  }
  

  update(delta: any){
    this.mixer?.update(delta);

    if(this.game.remoteData.length > 0){
      let found = false;
      for(let data of this.game.remoteData){
        if(data.id != this.id) continue;

        //player found
        this.object?.position.set(data.position.x, data.position.y, data.position.z);
        this.object?.quaternion.set(data.quaternion._x, data.quaternion._y, data.quaternion._z, data.quaternion._w);
        this.action = data.action;
        if(!this.local) {
          // DEBUGGING: we now have the remote player moving in idle, need to check other animations
          const clip = this.animationsMap.get(data.action);
          clip.play();
        }
      
        found = true;
      }
      if(!found) this.game.remotePlayer(this);
    }
  }
}