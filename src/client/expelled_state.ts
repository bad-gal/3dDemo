export default class ExpelledState {
  gameState: any;

  constructor(game:any) {
    this.gameState = game;
  }

  onExpelledState() {
    // remove the container div 
    const container: HTMLElement = document.getElementById( "waiting-room-container" )!;
    container.remove();

    // create a new container
    const containerDiv = document.createElement( "div" );
    containerDiv.className = ( "expelled-container" );
    containerDiv.id = ( 'expelled-container' );
    document.body.appendChild( containerDiv );

    // create a new div element with a title
    const expelledDiv = document.createElement( "div" );
    expelledDiv.className = ( 'expelled-title' );
    const newContent = document.createTextNode( "Game Closed" );
    expelledDiv.appendChild( newContent );
    containerDiv.appendChild( expelledDiv )

    // add paragraph
    const expelledParagraph = document.createElement( "p" );
    expelledParagraph.className = ( 'expelled-para');
    const paraContent = document.createTextNode( "You have been kicked out because a game is already underway, you didn't choose a player within the timeframe or there were more than 10 players. Try again later" );
    expelledParagraph.appendChild( paraContent );
    containerDiv.appendChild( expelledParagraph );
  }
}