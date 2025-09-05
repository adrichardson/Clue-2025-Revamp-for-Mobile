// rooms/LobbyRoom.js
import { Room } from "colyseus";

export class LobbyRoom extends Room {
  onCreate(options) {
    this.autoDispose = false; // don't shut down if empty
    console.log("LobbyRoom created!");
  }

  onJoin(client, options) {
    console.log(client.sessionId, "joined the lobby");

    this.state.users.push({ id: client.sessionId, name: options?.username || "Guest" });

    // Broadcast to everyone
    this.broadcast("userJoined", { id: client.sessionId });
  }

  onLeave(client) {
    console.log(client.sessionId, "left the lobby");
    this.state.users = this.state.users.filter(u => u.id !== client.sessionId);
  }
}
