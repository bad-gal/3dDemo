import * as CANNON from 'cannon-es';
import { threeToCannon, ShapeType } from 'three-to-cannon';
import { Group, Box3, Vector3 } from "three";

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
      shape?: ShapeType,
      collisionGroup?: number,
      collisionMask?: number,
      mass?: number, material?: CANNON.Material) {
    this.model = model;
    this.name = name;
    this.type = type;
    this.collisionGroup = collisionGroup != undefined ? collisionGroup : 1;
    this.collisionMask = collisionMask != undefined ? collisionMask : -1;
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
    body.position.set( this.model.position.x, this.model.position.y, this.model.position.z );

    // Set any rotations to the body
    body.quaternion.set( this.model.quaternion.x, this.model.quaternion.y, this.model.quaternion.z, this.model.quaternion.w )

    // Attach custom data to the body
    body.customData = {
      name: this.name,
      type: this.type,
    };

    // TODO: Remove once happy
    //console.log("physicsBody.createBody for: " + body.customData.name, result)

    // return Custom body to be added to the physics world
    return body;
  }

  //TODO: Remove unless this is fixed or some other use can be made for it
  createReducedSizeBody():CustomBody {
    let boundingBox = new Box3().setFromObject(this.model);

    // Compute the size of the bounding box
    let size = new Vector3();
    boundingBox.getSize(size);
    console.log(size);

    // Make the body slightly smaller
    let slightlySmallerSize = size.clone().multiplyScalar(0.8);
    let halfExtents = new CANNON.Vec3(slightlySmallerSize.x / 2, slightlySmallerSize.y / 2, slightlySmallerSize.z / 2);

    // Create the cannon-es shape with a slightly smaller size
    let boxShape = new CANNON.Box(halfExtents);
    const body = new CustomBody({ mass: this.mass, material: this.material, collisionFilterGroup: this.collisionGroup, collisionFilterMask: this.collisionMask })
    body.addShape(boxShape);

    // Set the body position to the mesh position
    body.position.set(
        this.model.position.x,
        this.model.position.y / 2,
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
    return body;
  }
}
