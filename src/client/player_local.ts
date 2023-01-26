import { Vector3 } from "three";
import Player from "./player";


export default class PlayerLocal extends Player {
  socket: any;
  
  constructor( game: any, camera: any, socket: any ) {
    super( game, camera );

    const player = this;
    
    player.id = socket.id;
    
    socket.emit('getPlayerPosition', 'getPlayerPosition');

    socket.on( 'playerPosition', function( data: any ) {
      player.position = new Vector3( data.position.x, data.position.y, data.position.z );
		});

		socket.on( 'remoteData', function( data: any ) {
			game.remoteData = data;
		});

    socket.on( 'deletePlayer', function( data: { id: string; } ) {
			const players = game.remotePlayers.filter( function( player: { id: string; } ) {
				if ( player.id == data.id ) {
					return player;
				}
			});

			if ( players.length>0 ) {
				let index = game.remotePlayers.indexOf( players[0] );
				if ( index!=-1 ) {
					game.remotePlayers.splice( index, 1 );
					game.scene.remove( players[0].object );
				}
      }
      else{
        let index = game.initialisingPlayers.indexOf( data.id );
        if ( index!=-1 ){
          const player = game.initialisingPlayers[index];
          player.deleted = true;
          game.initialisingPlayers.splice( index, 1 );
        }
      }
		})
    this.socket = socket;
  }
  
  initSocket() {
    this.socket.emit( 'init',{
      model: this.model,
      position: this.position,
      quaternion: this.object?.quaternion,
      velocity: this.characterController?.velocity,
      action: this.characterController?.currentAction,
      collided: this.collided,
    })
  }

  updateSocket() {
    if ( this.socket !== undefined ) {
      this.socket.emit( 'update', {
        model: this.model,
        position: this.characterController?.model.position,
        quaternion: this.characterController?.model.quaternion,
        velocity: this.characterController?.velocity,
        action: this.characterController?.currentAction,
        collided: this.collided,
      })
    }
  }
  updatePlayerData() {
    this.updateSocket();
  }
}
