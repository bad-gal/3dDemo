import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import PhysicsBody from './physicsBody';
import { ShapeType } from 'three-to-cannon';
import { Vector3, MathUtils, Scene } from 'three';

export default class RaceTrack {
  scene : Scene;
  physicsWorld : CANNON.World;
  material : CANNON.Material;

  constructor(scene: Scene, physicsWorld: CANNON.World, material: CANNON.Material){
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.material = material;
  }

  create() {
    const loader = new GLTFLoader();

    loader.load("assets/golf-track-large.glb", (object) => {
      object.scene.name = "golf track";
      object.scene.rotateOnWorldAxis(new Vector3(0, 1, 0), MathUtils.degToRad(180));
      object.scene.updateMatrix();
      object.scene.position.set(-55, -1, -245);
      this.scene.add(object.scene);
    });

    loader.load("assets/racetrack_trees_fences.glb", (object) => {
      object.scene.name = "grass_area";
      object.scene.rotateOnWorldAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
      object.scene.updateMatrix();
      object.scene.position.set(-80, 0, -3);
      this.scene.add(object.scene);

      const body = new PhysicsBody(object.scene, 'grass area plain', 'grass', 1, 2, ShapeType.HULL, 0, this.material);
      const result = body.createCustomBody();
      this.physicsWorld.addBody(result);
    });

    loader.load("assets/racetrack_grass_with_trees.glb", (object) => {
      object.scene.name = "grass_area";
      object.scene.rotateOnWorldAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
      object.scene.updateMatrix();
      object.scene.position.set(18, 0, -3);
      this.scene.add(object.scene);

      const body = new PhysicsBody(object.scene, 'grass area with trees', 'grass', 1, 2, ShapeType.HULL, 0, this.material);
      const result = body.createCustomBody();
      this.physicsWorld.addBody(result);
    });

    // create colliders at the sides of the racetrack
    const trackMaterial = new CANNON.Material;
    const trackBodies = [];
    const trackBoxShapes = [];

    const trackPositions = [
      new CANNON.Vec3(-2.5, 0, -30.6),
      new CANNON.Vec3(11.5, 0, -30.6),
      new CANNON.Vec3(-17.45, 0, -53.1),
      new CANNON.Vec3(26.45, 0, -53.1),
      new CANNON.Vec3(-32.4, 0, -89.3),
      new CANNON.Vec3(41.5, 0, -89.3),
      new CANNON.Vec3(-17.45, 0, -125.6),
      new CANNON.Vec3(26.45, 0, -125.6),
      new CANNON.Vec3(-2.5, 0, -140.2),
      new CANNON.Vec3(11.5, 0, -140.2),
      new CANNON.Vec3(-17.45, 0, -154.8),
      new CANNON.Vec3(26.45, 0, -154.8),
      new CANNON.Vec3(4.51, 0, -168.8),
      new CANNON.Vec3(-17, 0, -214),
      new CANNON.Vec3(26.02, 0, -198.91),
      new CANNON.Vec3(40, 0, -190.2),
      new CANNON.Vec3(18.52, 0, -227.1),
      new CANNON.Vec3(47.48, 0, -227.1),
      new CANNON.Vec3(12.49, 0, -257),
      new CANNON.Vec3(53.5, 0, -257),
      new CANNON.Vec3(32.9, 0, -286),
      new CANNON.Vec3(-30.95, 0, -199.1),
      new CANNON.Vec3(-53.68, 0, -243.62),
      new CANNON.Vec3(-90.394, 0, -257.62),
      new CANNON.Vec3(-75.5, 0, -230),
      new CANNON.Vec3(-104, 0, -215.2),
      new CANNON.Vec3(-133, 0, -228.6),
      new CANNON.Vec3(-155.6, 0, -243.6),
      new CANNON.Vec3(-178, 0, -287.9),
      new CANNON.Vec3(-164, 0, -301.9),
      new CANNON.Vec3(-192.85, 0, -332),
      new CANNON.Vec3(-192.6, 0, -346),
      new CANNON.Vec3(-221.5, 0, -234),
      new CANNON.Vec3(-207.5, 0, -227),
    ];

    for (let i = 0; i < trackPositions.length; i++) {
      trackBodies.push(new CANNON.Body({mass: 0, material: trackMaterial, collisionFilterGroup: 1}));
    }

    for (let i = 0; i < 2; i++) {
      trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 23.5)));
    }

    for (let i = 0; i < 2; i++) {
      trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(14, 1.2, 1)));
    }

    for (let i = 0; i < 2; i++) {
      trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 37)));
    }

    for (let i = 0; i < 2; i++) {
      trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(14.5, 1.2, 1)));
    }

    for (let i = 0; i < 2; i++) {
      trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 15.6)));
    }

    for (let i = 0; i < 2; i++) {
      trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(14.5, 1.2, 1)));
    }

    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(22.52, 1.2, 1)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 44.3)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 29.2)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 37.9)));

    for (let i = 0; i < 2; i++) {
      trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(6.5, 1.2, 1)));
    }

    for (let i = 0; i < 2; i++) {
      trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 30)));
    }

    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(21, 1.2, 1)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 45.5)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(22.8, 1.2, 1)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(74.6, 1.2, 1)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 14.65)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(29.7, 1.2, 1)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 16)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(23.6, 1.2, 1)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 45.09)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 45.09)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(15.6, 1.2, 1)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(29.2, 1.2, 1)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 114)));
    trackBoxShapes.push(new CANNON.Box(new CANNON.Vec3(1, 1.2, 106)));

    for (let i = 0; i < trackBodies.length; i++) {
      trackBodies[i].addShape( trackBoxShapes[i] );
      trackBodies[i].position = trackPositions[i];
      this.physicsWorld.addBody( trackBodies[i] );
    }
  }
}
