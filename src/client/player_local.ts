import { Player } from "./player";
import { io } from 'socket.io-client';

export class PlayerLocal extends Player {
  socket: any;
  constructor(game: any, camera: any, model: { id: any; model: any; } | undefined) {
    super(game, camera, model);

    const player = this;
    const socket = io();

    socket.on('setId', function(data: { id: any; }){
			player.id = data.id;
      console.log(data.id)
		});
    
		socket.on('remoteData', function(data: any){
			game.remoteData = data;
		});

    socket.on('deletePlayer', function(data: { id: any; }){
			const players = game.remotePlayers.filter(function(player: { id: any; }){
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
      model: this.model,
      position: this.object?.position,
      quaternion: this.object?.quaternion,
      action: 'idle_02',
    })
  }

  updateSocket() {
    if (this.socket !== undefined) {
      // the new socket is coming from here
      this.socket.emit('update', {
        position: this.object?.position,
        quaternion: this.object?.quaternion,
        action: 'idle_02',
      })
    }

  }

  move(delta: any) {
    this.updateSocket();
  }
}