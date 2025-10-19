import { Room } from "colyseus";
import { GameLobbyState } from "../schemas/GameLobbyState.js";
import { GameLobbyRoomHandlers } from "../handlers/GameLobbyRoomHandler.js";
import { Player } from "../schemas/Player.js";

export class GameLobbyRoom extends Room {
  onCreate(game) {
    this.autoDispose = false;
    this.state  = new GameLobbyState();

    this.setMetadata({
        owner: game.owner,
        type: game.type,
        mode: game.mode,
        maxplayers: game.maxplayers,
        password: game.password,
        gamelobby_id: this.roomId
    });  

    console.log("GameLobbyRoom ("+ this.roomId +") created!");

    for (const [msg, handler] of Object.entries(GameLobbyRoomHandlers)) {
      this.onMessage(msg, (client, message) => {
        handler(this, client, message);
      });
    }  
  }

  getNextAvailableCharacter(maxCharacters = 6) {
    const taken = new Set([...this.state.players.values()].map(p => p.character_id));

    for (let i = 0; i < maxCharacters; i++) {
      if (!taken.has(i)) return i;
    }

    return -1; // none available
  }

  onJoin(client, options) {
    const { user } = options;
    const username = user.username;
    const user_id = user.user_id;
    
    try {
      let character_id = this.getNextAvailableCharacter();
      let player = new Player(username, user_id, character_id, false);
      this.state.addPlayer(user_id, player);
      client.player = player;

      console.log("player " + username + " joined game room: " + this.roomId);       
      client.send("metadata", this.metadata);
      this.broadcast("playerjoined", { player : player });    
      player.user_id = user_id;

    } catch (err) {
      console.error("Error in onJoin:", err);
    }
  }

  async onLeave(client) {
    let player = this.state.getPlayer(client.player.user_id);
    console.log(player.username + " disconnected from game room: " + this.roomId);
    this.state.removePlayer(client.player.user_id);
    client.send("disconnected");
    if (client.player.username == this.metadata.owner){
      console.log("Owner left. Shutting down room:", this.roomId); 
      this.disconnect();
      global.lobbyRoom.broadcast("listgames");           
    }
  }
}
