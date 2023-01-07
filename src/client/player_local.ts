import { Player } from "./player";
import { io } from 'socket.io-client';

export default class PlayerLocal extends Player {
  socket: any;
  
  constructor(game: any, camera: any) {
    super(game, camera);

  
    const player = this;
    const socket = io().connect();

    socket.on('setId', function(data){
			player.id = data.id;
      console.log('setId connected', data.id)
		});
    
		socket.on('remoteData', function(data: any){
			game.remoteData = data;
      // console.log('remoteData',data)
		});

    socket.on('deletePlayer', function(data: { id: string; }){
      console.log('rd', game.remotePlayers)
			const players = game.remotePlayers.filter(function(player: { id: string; }){
        
				if (player.id == data.id){
					return player;
				}
			});
			if (players.length>0){
				let index = game.remotePlayers.indexOf(players[0]);
				if (index!=-1){
					game.remotePlayers.splice( index, 1 );
					game.scene.remove(players[0].object);
				}else{
					index = game.initialisingPlayers.indexOf(data.id);
					if (index!=-1){
						const player = game.initialisingPlayers[index];
						player.deleted = true;
						game.initialisingPlayers.splice(index, 1);
					}
				}
			}
		})

    this.socket = socket;

    
  }

  
  // this method does not get called
  
  initSocket() {
    this.socket.emit('init',{
      // id: this.socket.id,
      model: this.model,
      position: this.characterControls?.model.position,
      quaternion: this.object?.quaternion,
      action: this.characterControls?.currentAction,
    })
  }

  updateSocket() {
    if (this.socket !== undefined) {
      // the new socket is coming from here
      this.socket.emit('update', {
        // id: this.socket.id,
        position: this.characterControls?.model.position,
        quaternion: this.characterControls?.model.quaternion,
        action: this.characterControls?.currentAction,
        model: this.model,
      })
    }

  }

  move(delta: any) {
    this.updateSocket();
  }
}