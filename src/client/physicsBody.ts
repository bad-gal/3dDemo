import * as CANNON from 'cannon-es';
import { threeToCannon, ShapeType } from 'three-to-cannon';

export default class PhysicsBody {
  model: THREE.Group;
  shape: ShapeType | undefined;
  mass: number;

  constructor( model: THREE.Group, shape?: ShapeType, mass?: number) {
    this.model = model;
    this.mass = mass !== undefined ? mass : 0;
    if(shape !== undefined) this.shape = shape;
  }

  createBody():CANNON.Body {
    // Convert the object mesh into a Cannon.Shape
    const result = this.shape !== undefined ? threeToCannon(this.model, {type: this.shape}) : threeToCannon(this.model);

    // TODO: Remove once happy
    console.log("physicsBody.createBody for: " + this.model.name, result)

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
}
