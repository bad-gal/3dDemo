import * as CANNON from 'cannon-es';
import { threeToCannon, ShapeType } from 'three-to-cannon';
import { Group, Box3, Vector3 } from "three";
import CustomBody from "./customBody";

export default class PhysicsBody {
  model: Group | undefined;
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
    this.model = model !== undefined  ? model : undefined;
    this.name = name;
    this.type = type;
    this.collisionGroup = collisionGroup != undefined ? collisionGroup : 1;
    this.collisionMask = collisionMask != undefined ? collisionMask : -1;
    this.mass = mass !== undefined ? mass : 0;
    if (material !== undefined) this.material = material
    if(shape !== undefined) this.shape = shape;
  }

  createUserDefinedBody(vectorSize: CANNON.Vec3, posX: number, posY: number, posZ: number):CustomBody {
    const body = new CustomBody({ mass: this.mass, material: this.material, collisionFilterGroup: this.collisionGroup, collisionFilterMask: this.collisionMask });
    const bodyShape = new CANNON.Box( vectorSize );
    body.addShape(bodyShape);
    body.position.set(posX, posY, posZ);
    body.customData = {
      name: this.name,
      type: this.type,
    };
    return body;
  }

  createCustomBody():CustomBody {
    // Convert the object mesh into a Cannon.Shape

    if(this.model === undefined) {
      return this.createUserDefinedBody( new CANNON.Vec3(1,1,1), 0,0,0);
    } else {

      const result = this.shape !== undefined ? threeToCannon(this.model, {type: this.shape}) : threeToCannon(this.model);

      // Add physics to the object
      const body = new CustomBody({
        mass: this.mass,
        material: this.material,
        collisionFilterGroup: this.collisionGroup,
        collisionFilterMask: this.collisionMask
      });
      body.addShape(result?.shape as CANNON.Shape, result?.offset, result?.orientation);

      // Set the body position to the mesh position
      body.position.set(this.model.position.x, this.model.position.y, this.model.position.z);

      // Set any rotations to the body
      body.quaternion.set(this.model.quaternion.x, this.model.quaternion.y, this.model.quaternion.z, this.model.quaternion.w)

      // Attach custom data to the body
      body.customData = {
        name: this.name,
        type: this.type,
      };
      return body;
    }
  }
}
