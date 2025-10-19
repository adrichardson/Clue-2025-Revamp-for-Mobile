import { Room } from "colyseus";
import { GameState } from "../schemas/GameState.js";
import { GameRoomHandlers } from "../handlers/GameRoomHandler.js";
import { Player } from "../schemas/Player.js";

export class GameRoom extends Room {
  onCreate(game) {
    this.autoDispose = false;
    this.state  = new GameState();

    this.setMetadata({
        currentturn: 0,
    });  

    console.log("GameRoom ("+ this.roomId +") created!");

    for (const [msg, handler] of Object.entries(GameRoomHandlers)) {
      this.onMessage(msg, (client, message) => {
        handler(this, client, message);
      });
    }  
  }

  onJoin(client, options) {
    const { player } = options;
      let newplayer = new Player(player.username, player.user_id, player.character_id, false);
      this.state.addPlayer(player.user_id, newplayer);
      client.player = newplayer;

      console.log("player " + player.username + " joined game room: " + this.roomId);
  }

  async onLeave(client) {
    let player = this.state.getPlayer(client.player.user_id);
    console.log(player.username + " disconnected from game room: " + this.roomId);
    this.state.removePlayer(client.player.user_id);
    client.send("disconnected");
  }
}
