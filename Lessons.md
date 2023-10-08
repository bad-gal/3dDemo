Cannon-es.js / threeToCannon
Issues when converting THREE.Object3D into Cannon.Shape.HULL using threeToCannon
The mesh was producing a lot of errors in the console even though it displayed in runtime.
The error I was receiving was:"...looks like it points into the shape? The vertices follow. Make sure they are ordered CCW around the normal, using the right hand rule."
This error suggested that there were problems with the vertices/faces pointing inwards. After much research, I was
able to fix the errors by doing the following:

  When exporting from AssetForge, do not merge the object (uncheck this)
  - Import the asset into Blender
  - Duplicate the model (In Object Mode, select all meshes in the model, go to Object/Duplicate)
  - In the duplicated model - change the material to one material if there are numerous duplicate materials being used.e.g. mat, mat.001, mat.002 - do this by going to the Material properties of the selected mesh can changing the material to the original e.g. mat
  - Once this is done, select all the meshes of the object, Object/join will join the meshes into one object
  - Set the object position to x:0, y:0, z:0, check you are happy with the rotation and scale values
  - Save the blender file
  - With the joined object selected, export it as a GLTF file, checking "Selected Object"
