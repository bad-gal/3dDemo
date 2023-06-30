import * as CANNON from 'cannon-es';
import { threeToCannon, ShapeType } from 'three-to-cannon';
import { Group } from "three";

// Define an interface for the custom data
interface CustomData {
  name: string;
  type: string;
}

class CustomBody extends CANNON.Body {
  public customData?: CustomData;

  constructor(options: any) {
      super(options);
  }
}

export default class PhysicsBody {
  model: Group;
  name: string;
  type: string;
  shape: ShapeType | undefined;
  mass: number;
  material: CANNON.Material | undefined;
  collisionGroup: number;
  collisionMask: number;

  constructor(
      model: Group,
      name: string,
      type: string,
      collisionGroup: number = 1,
      collisionMask: number = -1,
      shape?: ShapeType,
      mass?: number, material?: CANNON.Material) {
    this.model = model;
    this.name = name;
    this.type = type;
    this.collisionGroup = collisionGroup;
    this.collisionMask = collisionMask;
    this.mass = mass !== undefined ? mass : 0;
    if (material !== undefined) this.material = material
    if(shape !== undefined) this.shape = shape;
  }

  createCustomBody():CustomBody {
    // Convert the object mesh into a Cannon.Shape
    const result = this.shape !== undefined ? threeToCannon(this.model, {type: this.shape}) : threeToCannon(this.model);

    // Add physics to the object
    const body = new CustomBody( { mass: this.mass, material: this.material, collisionFilterGroup: this.collisionGroup, collisionFilterMask: this.collisionMask } );
    body.addShape(result?.shape as CANNON.Shape, result?.offset, result?.orientation);

    // Set the body position to the mesh position
    body.position.set(
      this.model.position.x,
      this.model.position.y,
      this.model.position.z
    );

    if (this.type == 'player') {
      console.log('physics player position = ', this.model.position)
    }

    // Set any rotations to the body
    body.quaternion.set(
      this.model.quaternion.x,
      this.model.quaternion.y,
      this.model.quaternion.z,
      this.model.quaternion.w
    )

    // Attach custom data to the body
    body.customData = {
      name: this.name,
      type: this.type,
    };

    // TODO: Remove once happy
    console.log("physicsBody.createBody for: " + body.customData.name, result)

    // return Custom body to be added to the physics world
    return body;
  }
}
