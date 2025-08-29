import { Room } from "colyseus";
import { GameState } from "../schemas/GameState.js";

export class GameRoom extends Room {
  onCreate(options) {
    this.setState(new GameState());

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x += data.x;
        player.y += data.y;
      }
    });
  }

  onJoin(client) {
    console.log(client.sessionId, "joined!");
    this.state.addPlayer(client.sessionId);
  }

  onLeave(client) {
    console.log(client.sessionId, "left!");
    this.state.removePlayer(client.sessionId);
  }
}
