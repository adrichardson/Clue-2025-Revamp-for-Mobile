import { Room } from "colyseus";
import { GameState } from "../schemas/GameState.js";
import { gameroomHandlers } from "../handlers/GameRoomHandler.js";
import { Player } from "../schemas/Player.js";

export class GameRoom extends Room {
  onCreate(game) {
    this.autoDispose = false;
    this.state  = new GameState();

    this.setMetadata({
        owner: game.owner,
        type: game.type,
        mode: game.mode,
        maxplayers: game.maxplayers,
        password: game.password,
        game_id: this.roomId
    });  

    console.log("GameRoom ("+ this.roomId +") created!");

    for (const [msg, handler] of Object.entries(gameroomHandlers)) {
      this.onMessage(msg, (client, message) => {
        handler(this, client, message);
      });
    }  
  }

  onJoin(client, options) {
    const { user } = options;
    const username = user.username;
    const user_id = user.user_id;
    
    try {
      let player = new Player(username, user_id);
      this.state.addPlayer(user_id, player);
      client.player = player;

      console.log("player " + username + " joined game room: " + this.roomId);       
      client.send("metadata", this.metadata);

    } catch (err) {
      console.error("Error in onJoin:", err);
    }
  }

  async onLeave(client) {
    let player = this.state.getPlayer(client.player.user_id);
    console.log(player.username + " disconnected from game room: " + this.roomId);
    this.state.removePlayer(client.player.user_id);
    if (client.player.username == this.metadata.owner){
      console.log("Owner left. Shutting down room:", this.roomId); 
      this.disconnect();
      global.lobbyRoom.broadcast("listgames");           
    }
  }
}
