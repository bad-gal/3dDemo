import * as CANNON from 'cannon-es';
import { threeToCannon, ShapeType } from 'three-to-cannon';

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
  model: THREE.Group;
  name: string;
  type: string;
  shape: ShapeType | undefined;
  mass: number;

  constructor( model: THREE.Group, name: string, type: string, shape?: ShapeType, mass?: number) {
    this.model = model;
    this.name = name;
    this.type = type;
    this.mass = mass !== undefined ? mass : 0;
    if(shape !== undefined) this.shape = shape;
  }

  createBody():CANNON.Body {
    // Convert the object mesh into a Cannon.Shape
    const result = this.shape !== undefined ? threeToCannon(this.model, {type: this.shape}) : threeToCannon(this.model);

    // Add physics to the object
    const body = new CANNON.Body( { mass: this.mass } );
    body.addShape(result?.shape as CANNON.Shape, result?.offset, result?.orientation);

    // Set the body position to the mesh position
    body.position.x = this.model.position.x;
    body.position.y = this.model.position.y;
    body.position.z = this.model.position.z;

    // return Cannon.Body to be added to the physics world
    return body;
  }

  createCustomBody():CustomBody {
    // Convert the object mesh into a Cannon.Shape
    const result = this.shape !== undefined ? threeToCannon(this.model, {type: this.shape}) : threeToCannon(this.model);

    // Add physics to the object
    const body = new CustomBody( { mass: this.mass } );
    body.addShape(result?.shape as CANNON.Shape, result?.offset, result?.orientation);

    // Set the body position to the mesh position
    body.position.set(
      this.model.position.x,
      this.model.position.y,
      this.model.position.z
    );

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
