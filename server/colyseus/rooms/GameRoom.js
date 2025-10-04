import { Room } from "colyseus";
import { GameState } from "../schemas/GameState.js";
import { gameroomHandlers } from "../handlers/GameRoomHandler.js";
import { Player } from "../schemas/Player.js";

export class GameRoom extends Room {
  onCreate(options) {
    this.autoDispose = false; // keep game alive
    this.state  = new GameState();

    console.log("GameRoom ("+ this.roomId +") created!");

    for (const [msg, handler] of Object.entries(gameroomHandlers)) {
      this.onMessage(msg, (client, message) => {
        handler(client, this.state, message);
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
      this.broadcast("userJoined", { username }, { except: client });
      console.log("player " + username + " joined game room: " + this.roomId);          
    } catch (err) {
      console.error("Error in onJoin:", err);
    }
  }

  onLeave(client) {
    let player = client.player;
    console.log(player.username + " disconnected from game room: " + this.roomId);
  }
}
