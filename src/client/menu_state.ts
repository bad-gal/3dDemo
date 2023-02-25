export default class MenuState {
  gameState: any;

  constructor(game:any) {
    this.gameState = game;
  }

  createMenuItems() {
    // hide score panel
    const scorePanel = document.getElementById("score-info");
    if ( scorePanel !== null ) scorePanel.style.visibility='hidden';

    // create a container
    const containerDiv = document.createElement("div");
    containerDiv.className = ("container");
    containerDiv.id = ('container');
    document.body.appendChild(containerDiv);

    // create a new div element
    const menuDiv = document.createElement("div");
    menuDiv.className = ('menu-title');
    const newContent = document.createTextNode("Welcome to 3D Demo");

    // add the text node to the newly created div
    menuDiv.appendChild(newContent);
    containerDiv.appendChild(menuDiv)

    // add paragraph
    const menuParagraph = document.createElement("p");
    menuParagraph.className = ('menu-para');
    const paraContent = document.createTextNode("Play this exciting demo of a 3D racing game with friends. Click button to join the waiting room. Let the fun begin!!!");
    menuParagraph.appendChild(paraContent);
    containerDiv.appendChild(menuParagraph);

    // add button
    const btn = document.createElement("button");
    btn.className = ('btn waiting');
    btn.id = ('joinButton');
    btn.innerHTML = "Join Waiting Room";
    containerDiv.appendChild(btn);
  }

  onMenuState() {
    const game = this.gameState;

    // get the list of quadRacers
    this.gameState.socket.on( 'quadRacerList', function( data: string[]) {
      game.quadRacerList = data;
    });

    // get the player id and it's initial position
    this.gameState.socket.once( 'setId', function( data: any ) {
			game.initPlayerId = data.id;
      console.log( 'setId connected', data );
		});

    this.createMenuItems();

    const waitingBtn: HTMLElement = document.getElementById("joinButton")!;
    
    waitingBtn.addEventListener("click", function() {
      game.currentState = game.GAMESTATES.WAITING_ROOM;
      game.onWaitingRoomState();
    });
  };
}