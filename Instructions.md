Instructions:
Three.js, Typescript and Socket.io

! Make sure you have Node.js installed
! Make sure you have Typescript installed

Make a new folder e.g. 
mkdir [folder name]

cd into this folder

Initialize the project with NPM
npm init

Make changes if you want otherwise press enter several times to accept all defaults.

Install the Three.js library
npm install three --save-dev

Open the directory in an editor of your choice

Install Three.js type definition for use with Typescript
npm install @types/three --save-dev

Install the type definitions for use with Express and Node
npm i -D typescript @types/express @types/node

Install socket.io
npm install socket.io

Install dotenv locally
npm install dotenv --save

Install express
npm install express

npm install -D concurrently nodemon
npm install -D ts-node

Run the app locally
npm run dev

Blender to glb

Do not select the collect, but select the objects inside the collection
File/Export
Choose gtlf
In 'Include' choose 'selected objects'
In 'Transform' make sure Y+up is selected
In 'Animations' make sure the checkboxes are selected
Rename file and click export button

Blender Add textures

Select the image
Go to materials
Click on 'Use Nodes'
Click on Base Color
Select Image Texture
Select Add
Select the file that has the image you want
The texture is added to the model

#Blender Break Long Animations into separate ones for game
Open the specified Blender file
Open the "Dope Sheet"
Open another window and open the "Nonlinear Animation (NLA)"

##Duplicate the Long Animation
In NLA duplicate the animation several times to account for any mistakes that you may make
Right click on the Action Strip (the long animation) and select "duplicate"

##To make changes to the Action Strip
Right click on the strip, select "Start Tweaking Strip Actions (Full Stack)"
In the "Dope Sheet" click the checkbox "Manual Frame Range"
Enter the start and end frames for the strip.
Go back to the Active Strip in NLA and right click then select "Stop Tweaking Strip Action"
Rename the track and the action name (near the top of the NLA window)
Click on the "Push Down Action" next to the action name you just changed.

This is a good time to save the project 
NOTE: You can click on the star on the track that you want to play to see the selected frames animation, when you click the play button

In the "Active Strip" you can move the from start to 0 if you want

https://gist.github.com/nickjanssen/666517984aff72eaf798