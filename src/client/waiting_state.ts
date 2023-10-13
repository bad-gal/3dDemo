export default class WaitingState {
  gameState: any;

  constructor(game:any) {
    this.gameState = game;
  }

  createWaitingRoomItems() {
    // remove the container div
    const container: HTMLElement = document.getElementById( "container" )!;
    container.remove();

    // create a new container
    const containerDiv = document.createElement( "div" );
    containerDiv.className = ( "waiting-room-container" );
    containerDiv.id = ( 'waiting-room-container' );
    document.body.appendChild( containerDiv );

    // create a new div element with a title
    const menuDiv = document.createElement( "div" );
    menuDiv.className = ( 'waiting-room-title' );
    const newContent = document.createTextNode( "Waiting Room" );
    menuDiv.appendChild( newContent );
    containerDiv.appendChild( menuDiv )

    // add paragraphs
    const menuParagraph = document.createElement( "p" );
    menuParagraph.className = ( 'waiting-room-para');
    const paraContent = document.createTextNode( "Choose a player" );
    menuParagraph.appendChild( paraContent );
    containerDiv.appendChild( menuParagraph );

    const instructionsParagraph = document.createElement( "p" );
    instructionsParagraph.className = ( 'instructions-para');
    const instructionsContent = document.createTextNode( "Instructions: use the arrow keys to move your player when the game begins " );
    instructionsParagraph.appendChild( instructionsContent );
    containerDiv.appendChild( instructionsParagraph );

    const timerParagraph = document.createElement( "p" );
    timerParagraph.className = ( 'timer-para');
    timerParagraph.id = ( 'timer-text' )
    const timerContent = document.createTextNode( " " );
    timerParagraph.appendChild( timerContent );
    containerDiv.appendChild( timerParagraph );

    // list of player images
    let playerImgs = new Map();

    playerImgs.set( this.gameState.quadRacerFullList[0], 'camouflage_racer.png' );
    playerImgs.set( this.gameState.quadRacerFullList[1], 'green_racer.png' );
    playerImgs.set( this.gameState.quadRacerFullList[2], 'lime_racer.png' );
    playerImgs.set( this.gameState.quadRacerFullList[3], 'mustard_racer.png' );
    playerImgs.set( this.gameState.quadRacerFullList[4], 'neon_racer.png' );
    playerImgs.set( this.gameState.quadRacerFullList[5], 'orange_racer.png' );
    playerImgs.set( this.gameState.quadRacerFullList[6], 'purple_racer.png' );
    playerImgs.set( this.gameState.quadRacerFullList[7], 'red_racer.png' );
    playerImgs.set( this.gameState.quadRacerFullList[8], 'red_star_racer.png' );
    playerImgs.set( this.gameState.quadRacerFullList[9], 'blue_racer.png' );

    // create flexbox with list of quadRacers
    const flex = document.createElement( "ul" );
    flex.className = ( "player-container" );

    for ( let index = 0; index < this.gameState.quadRacerFullList.length; index++ ) {
      let data = document.createElement( "button" );
      data.className = ( "flex-item" );
      data.id = ( this.gameState.quadRacerFullList[index] );
      let imgStr = "assets/images/" + playerImgs.get(this.gameState.quadRacerFullList[index]);
      data.style.background = "url(" + imgStr + ")";
      flex.appendChild( data );
    }
    containerDiv.appendChild( flex );
  }

  onWaitingRoomState() {
    const game = this.gameState;
    let timer;

    let chosenQuadRacer: string;

    // player can click to select a quadRacer
    let quadRacerItems: HTMLCollectionOf<Element> = document.getElementsByClassName( "flex-item" )!;

    this.createWaitingRoomItems();

    for ( let index = 0; index < quadRacerItems.length; index++ ) {
      quadRacerItems[index].addEventListener("click", function() {

        // store the chosen quadRacer
        chosenQuadRacer = quadRacerItems[index].id;

        // remove chosen quadRacer from quadRacerList
        const quadIndex = game.quadRacerList.indexOf( chosenQuadRacer );
        if ( quadIndex > -1 ) game.quadRacerList.splice( quadIndex, 1 );

        // need to disable all buttons including this one
        const buttons = document.getElementsByTagName("button");
        for (const button of buttons) {
          button.disabled = true;
        }

        // send amended quadRacerList to server
        game.socket.emit( 'updateQuadRacers', game.quadRacerList );

        // the chosen quadRacer should be disabled
        (quadRacerItems[index] as HTMLButtonElement).disabled = true;

        // add border and lower opacity around chosen quadRacer
        (quadRacerItems[index] as HTMLElement).style.color ="#383838";
        (quadRacerItems[index] as HTMLElement).style.opacity = '0.3';
        (quadRacerItems[index] as HTMLElement).style.border = "10px solid #94524A";
      });
    }

    //x second timer for players to choose player and start game
    game.socket.emit( 'startTimer', true );
    game.socket.on( '30SecondsWaitingRoom', function( data: number ) {
      timer = data;
      let timerText = document.getElementById( 'timer-text')
      if ( timerText !== null ) {
        timerText.innerHTML = "Game will start in " + timer + " seconds."
      }

      // when timer finished players move to gameplay or gets kicked out of server
      if( timer == -1) {
        // continue to gameplay
        if( chosenQuadRacer !== undefined ) {
          game.userModel = chosenQuadRacer;
          game.currentState = game.GAMESTATES.INIT;
          game.onInitState();
        } else {
          // kick out this player
          game.socket.emit( 'kickOutPlayer', game.socket.id );
          game.currentState = game.GAMESTATES.EXPELLED;
          game.onExpelled();
        }
      }
    });

    // we need to keep requesting the quadRacerList from the server
    game.socket.on( 'sendQuadRacerList', function( data: string[]) {
      game.quadRacerList = data;

      // we need to update changes made by other players
      let diff = game.quadRacerFullList.filter( (x: any) => !game.quadRacerList.includes(x));

      // then we need to go through them to make sure they are disabled
      for ( let index = 0; index < quadRacerItems.length; index++ ) {
        if (diff.includes(quadRacerItems[index].id)){
          if (quadRacerItems[index].id !== chosenQuadRacer) {
            // if taken image does not exist add it
            if ( document.getElementById( "taken " + quadRacerItems[index].id ) === null ) {
              let img = document.createElement( "img" );
              img.className = ( "img-overlay-taken" );
              img.id = ( "taken " + quadRacerItems[index].id )
              img.src = ( "assets/images/taken-img.png" );
              quadRacerItems[index].appendChild( img );

              (quadRacerItems[index] as HTMLButtonElement).disabled = true;
              (quadRacerItems[index] as HTMLElement).style.opacity = '0.3';
              (quadRacerItems[index] as HTMLElement).style.border = "10px solid #2F0A28"
            }
          }
        }
      }
    });
  }
}